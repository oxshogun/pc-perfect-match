import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { SEED_PARTS } from "@/lib/pc/seed";
import type { Part, PartCategory } from "@/lib/pc/types";

type PartRow = {
  id: string;
  owner_id: string | null;
  category: string;
  asin: string | null;
  visibility: string;
  price_updated_at: string | null;
  data: Record<string, unknown>;
};

function rowToPart(row: PartRow): Part {
  const data = (row.data ?? {}) as Record<string, unknown>;
  return {
    ...(data as object),
    id: row.id,
    category: row.category as PartCategory,
    asin: row.asin ?? undefined,
    visibility: row.visibility as "catalog" | "private",
    priceUpdatedAt: row.price_updated_at ? new Date(row.price_updated_at).getTime() : undefined,
  } as unknown as Part;
}

function partToRowFields(part: Part) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, category, asin, priceUpdatedAt: _pu, visibility: _v, ...rest } = part as any;
  return {
    category,
    asin: asin ?? null,
    data: rest,
  };
}

/* ---------------- List ---------------- */

export const listParts = createServerFn({ method: "GET" })
  .handler(async (): Promise<Part[]> => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("Backend is not configured.");

    const request = getRequest();
    const authHeader = request?.headers.get("authorization") ?? undefined;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : undefined;
    const headers = token && token.split(".").length === 3 ? { Authorization: `Bearer ${token}` } : undefined;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        headers,
        fetch: (input, init) => {
          const nextHeaders = new Headers(
            typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
          );
          if (init?.headers) new Headers(init.headers).forEach((value, key) => nextHeaders.set(key, value));
          if (supabaseKey.startsWith("sb_") && nextHeaders.get("Authorization") === `Bearer ${supabaseKey}`) {
            nextHeaders.delete("Authorization");
          }
          nextHeaders.set("apikey", supabaseKey);
          return fetch(input, { ...init, headers: nextHeaders });
        },
      },
    });

    const { data, error } = await supabase
      .from("parts")
      .select("id, owner_id, category, asin, visibility, price_updated_at, data")
      .order("category")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const parts = (data as unknown as PartRow[]).map(rowToPart);

    // Merge in the caller's private price overrides (RLS returns only their rows).
    if (headers) {
      const { data: ov } = await supabase
        .from("part_overrides")
        .select("part_id, price, asin, image_url, price_updated_at");
      if (ov?.length) {
        const byId = new Map(ov.map((o) => [o.part_id, o]));
        for (const p of parts) {
          const o = byId.get(p.id);
          if (!o) continue;
          const target = p as any;
          if (o.price != null) target.price = Number(o.price);
          if (o.asin) target.asin = o.asin;
          if (o.image_url) target.imageUrl = o.image_url;
          if (o.price_updated_at) target.priceUpdatedAt = new Date(o.price_updated_at).getTime();
          target.hasOverride = true;
        }
      }
    }
    return parts;
  });

/* ---------------- Personal price overrides ---------------- */

const overrideInput = z.object({
  partId: z.string().uuid(),
  price: z.number().min(0).max(100000).nullable().optional(),
  asin: z
    .string()
    .regex(/^[A-Z0-9]{10}$/i, "Amazon product code must be 10 letters/numbers")
    .nullable()
    .optional(),
});

export const setPartOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => overrideInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("part_overrides").upsert(
      {
        user_id: context.userId,
        part_id: data.partId,
        price: data.price ?? null,
        asin: data.asin ? data.asin.toUpperCase() : null,
        price_updated_at: data.price != null ? new Date().toISOString() : null,
      } as any,
      { onConflict: "user_id,part_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearPartOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ partId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("part_overrides")
      .delete()
      .eq("user_id", context.userId)
      .eq("part_id", data.partId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


/* ---------------- Upsert ---------------- */



const upsertInput = z.object({
  part: z.record(z.string(), z.unknown()),
  visibility: z.enum(["catalog", "private"]).optional(),
});

export const upsertPart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertInput.parse(d))
  .handler(async ({ data, context }): Promise<Part> => {
    const part = data.part as unknown as Part;
    const rowFields = partToRowFields(part);
    const visibility = data.visibility ?? part.visibility ?? "private";

    // For catalog rows: server-side gate (double check on top of RLS).
    if (visibility === "catalog") {
      const { data: adminCheck } = await context.supabase.rpc("is_admin");
      if (!adminCheck) throw new Error("Only the admin can edit catalog parts.");
    }

    const isExistingUuid =
      typeof part.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part.id);

    if (isExistingUuid) {
      // Update: preserve visibility & owner (RLS enforces)
      const { data: row, error } = await context.supabase
        .from("parts")
        .update({ ...rowFields } as any)
        .eq("id", part.id)
        .select("id, owner_id, category, asin, visibility, price_updated_at, data")
        .single();
      if (error) throw new Error(error.message);
      return rowToPart(row as PartRow);
    }


    const insertRow = {
      ...rowFields,
      visibility,
      owner_id: visibility === "catalog" ? null : context.userId,
    } as any;
    const { data: row, error } = await context.supabase
      .from("parts")
      .insert(insertRow)
      .select("id, owner_id, category, asin, visibility, price_updated_at, data")
      .single();
    if (error) throw new Error(error.message);
    return rowToPart(row as PartRow);

  });

/* ---------------- Delete ---------------- */

export const deletePart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("parts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Seed catalog (admin only) ---------------- */

export const seedCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ inserted: number }> => {
    const { data: adminCheck } = await context.supabase.rpc("is_admin");
    if (!adminCheck) throw new Error("Only the admin can seed the catalog.");

    // Only insert if the catalog is empty.
    const { count } = await context.supabase
      .from("parts")
      .select("id", { count: "exact", head: true })
      .eq("visibility", "catalog");
    if ((count ?? 0) > 0) return { inserted: 0 };

    const rows = SEED_PARTS.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, category, asin, ...rest } = p as any;
      return {
        category,
        asin: asin ?? null,
        visibility: "catalog",
        owner_id: null,
        data: rest,
      };
    });
    const { error } = await context.supabase.from("parts").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

/* ---------------- Whoami / admin check ---------------- */

export const whoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ userId: string; email: string | null; isAdmin: boolean }> => {
    const { data } = await context.supabase.rpc("is_admin");
    const email = (context.claims?.email as string | undefined) ?? null;
    return { userId: context.userId, email, isAdmin: Boolean(data) };
  });
