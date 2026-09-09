import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        asin: z.string().regex(/^[A-Z0-9]{10}$/i, "Invalid ASIN"),
      }),
    )
    .min(1)
    .max(50),
});

export type PriceResult = {
  id: string;
  asin: string;
  price?: number;
  currency?: string;
  image?: string;
  error?: string;
};

async function fetchOne(asin: string, apiKey: string): Promise<Omit<PriceResult, "id">> {
  const url = new URL("https://api.rainforestapi.com/request");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("type", "product");
  url.searchParams.set("amazon_domain", "amazon.com");
  url.searchParams.set("asin", asin);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return { asin, error: `Rainforest ${res.status}` };
    const json = (await res.json()) as any;
    const buybox = json?.product?.buybox_winner;
    const price =
      buybox?.price?.value ?? json?.product?.price?.value ?? buybox?.rrp?.value;
    const currency = buybox?.price?.currency ?? json?.product?.price?.currency ?? "USD";
    const image = json?.product?.main_image?.link ?? json?.product?.images?.[0]?.link ?? undefined;
    if (typeof price !== "number") return { asin, error: "No price found", image };
    return { asin, price, currency, image };
  } catch (e) {
    return { asin, error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

/**
 * Admin-only: refreshes prices for the provided catalog parts and
 * writes the results back to the database (parts.data.price, .imageUrl,
 * and parts.price_updated_at).
 */
export const fetchAmazonPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ results: PriceResult[] }> => {
    const { data: adminCheck } = await context.supabase.rpc("is_admin");
    if (!adminCheck) throw new Error("Only the admin can refresh catalog prices.");

    const apiKey = process.env.RAINFOREST_API_KEY;
    if (!apiKey) {
      return {
        results: data.items.map((i) => ({ id: i.id, asin: i.asin, error: "Price service not configured" })),
      };
    }

    const results: PriceResult[] = [];
    for (const item of data.items) {
      const r = await fetchOne(item.asin, apiKey);
      results.push({ id: item.id, ...r });

      if (r.price != null) {
        // Merge price + image into the row's data jsonb
        const { data: row } = await context.supabase
          .from("parts")
          .select("data")
          .eq("id", item.id)
          .maybeSingle();
        const currentData = (row?.data as Record<string, unknown>) ?? {};
        const nextData: Record<string, unknown> = { ...currentData, price: r.price };
        if (r.image) nextData.imageUrl = r.image;
        await context.supabase
          .from("parts")
          .update({ data: nextData as any, price_updated_at: new Date().toISOString() })
          .eq("id", item.id);


        await context.supabase.from("price_history").insert({
          part_id: item.id,
          owner_id: context.userId,
          price: r.price,
          currency: r.currency ?? "USD",
          source: "rainforest",
        });
      }
    }
    return { results };
  });

/* ------------- Shared catalog refresh (admin, name lookup) ------------- */

const catalogInput = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(300),
        asin: z
          .string()
          .regex(/^[A-Z0-9]{10}$/i)
          .nullable()
          .optional(),
      }),
    )
    .min(1)
    .max(20),
});

/** Finds a product on Amazon by name and returns its ASIN + current price. */
async function searchOne(term: string, apiKey: string): Promise<Omit<PriceResult, "id">> {
  const url = new URL("https://api.rainforestapi.com/request");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("type", "search");
  url.searchParams.set("amazon_domain", "amazon.com");
  url.searchParams.set("search_term", term);
  url.searchParams.set("sort_by", "featured");
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return { asin: "", error: `Rainforest ${res.status}` };
    const json = (await res.json()) as any;
    const results: any[] = Array.isArray(json?.search_results) ? json.search_results : [];
    const hit = results.find(
      (r) => typeof r?.asin === "string" && typeof r?.price?.value === "number" && !r?.sponsored,
    );
    if (!hit) return { asin: "", error: "No Amazon match" };
    return {
      asin: hit.asin as string,
      price: hit.price.value as number,
      currency: (hit.price.currency as string) ?? "USD",
      image: (hit.image as string) ?? undefined,
    };
  } catch (e) {
    return { asin: "", error: e instanceof Error ? e.message : "Search failed" };
  }
}

/**
 * Admin-only: pulls live Amazon prices into the SHARED catalog. Parts without
 * an ASIN are looked up by name first and the matched ASIN is stored, so later
 * refreshes go straight to the product page.
 */
export const refreshCatalogPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => catalogInput.parse(data))
  .handler(async ({ data, context }): Promise<{ results: PriceResult[] }> => {
    const { data: adminCheck } = await context.supabase.rpc("is_admin");
    if (!adminCheck) throw new Error("Only the admin can refresh shared prices.");

    const apiKey = process.env.RAINFOREST_API_KEY;
    if (!apiKey) {
      return {
        results: data.items.map((i) => ({ id: i.id, asin: i.asin ?? "", error: "Price service not configured" })),
      };
    }

    const results: PriceResult[] = [];
    for (const item of data.items) {
      const hasAsin = item.asin && /^[A-Z0-9]{10}$/i.test(item.asin);
      let r = hasAsin ? await fetchOne(item.asin!.toUpperCase(), apiKey) : await searchOne(item.name, apiKey);
      if (r.price == null && hasAsin) {
        // Product page had no buyable price — fall back to a name search.
        const alt = await searchOne(item.name, apiKey);
        if (alt.price != null) r = alt;
      }
      results.push({ id: item.id, ...r, asin: r.asin || item.asin || "" });
      if (r.price == null) continue;

      const { data: row } = await context.supabase
        .from("parts")
        .select("data")
        .eq("id", item.id)
        .maybeSingle();
      const currentData = (row?.data as Record<string, unknown>) ?? {};
      const nextData: Record<string, unknown> = { ...currentData, price: r.price };
      if (r.image) nextData.imageUrl = r.image;

      const patch: Record<string, unknown> = {
        data: nextData,
        price_updated_at: new Date().toISOString(),
      };
      if (r.asin) patch.asin = r.asin.toUpperCase();

      const { error } = await context.supabase.from("parts").update(patch as any).eq("id", item.id);
      if (error) {
        results[results.length - 1] = { id: item.id, asin: r.asin ?? "", error: error.message };
        continue;
      }

      await context.supabase.from("price_history").insert({
        part_id: item.id,
        owner_id: context.userId,
        price: r.price,
        currency: r.currency ?? "USD",
        source: "rainforest",
      });
    }
    return { results };
  });

/**
 * Any signed-in user: refreshes prices for the given parts into that user's
 * own private price overrides. The shared catalog is never modified.
 */
export const fetchMyPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ results: PriceResult[] }> => {
    const apiKey = process.env.RAINFOREST_API_KEY;
    if (!apiKey) {
      return {
        results: data.items.map((i) => ({ id: i.id, asin: i.asin, error: "Price service not configured" })),
      };
    }

    const results: PriceResult[] = [];
    for (const item of data.items) {
      const r = await fetchOne(item.asin, apiKey);
      results.push({ id: item.id, ...r });
      if (r.price == null) continue;

      const { error } = await context.supabase.from("part_overrides").upsert(
        {
          user_id: context.userId,
          part_id: item.id,
          price: r.price,
          asin: item.asin.toUpperCase(),
          image_url: r.image ?? null,
          price_updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,part_id" },
      );
      if (error) {
        results[results.length - 1] = { id: item.id, asin: item.asin, error: error.message };
      }
    }
    return { results };
  });
