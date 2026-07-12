import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  } as Part;
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
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Part[]> => {
    const { data, error } = await context.supabase
      .from("parts")
      .select("id, owner_id, category, asin, visibility, price_updated_at, data")
      .order("category")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as PartRow[]).map(rowToPart);
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
    const part = data.part as Part;
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
        .update({ ...rowFields })
        .eq("id", part.id)
        .select("id, owner_id, category, asin, visibility, price_updated_at, data")
        .single();
      if (error) throw new Error(error.message);
      return rowToPart(row as PartRow);
    }

    const insertRow: Record<string, unknown> = {
      ...rowFields,
      visibility,
      owner_id: visibility === "catalog" ? null : context.userId,
    };
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
