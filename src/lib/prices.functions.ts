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
