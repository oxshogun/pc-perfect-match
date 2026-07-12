import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Build } from "@/lib/pc/types";

type BuildRow = {
  id: string;
  name: string;
  parts: Build["parts"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function rowToBuild(r: BuildRow): Build & { isActive: boolean } {
  return {
    id: r.id,
    name: r.name,
    parts: (r.parts ?? { ram: [], storage: [] }) as Build["parts"],
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
    isActive: r.is_active,
  };
}

export const listBuilds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("builds")
      .select("id, name, parts, is_active, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as BuildRow[]).map(rowToBuild);
  });

export const getOrCreateActiveBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const existing = await context.supabase
      .from("builds")
      .select("id, name, parts, is_active, created_at, updated_at")
      .eq("is_active", true)
      .maybeSingle();
    if (existing.data) return rowToBuild(existing.data as BuildRow);

    // No active — check for any build
    const any = await context.supabase
      .from("builds")
      .select("id, name, parts, is_active, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (any.data) {
      await context.supabase.from("builds").update({ is_active: true }).eq("id", any.data.id);
      return rowToBuild({ ...(any.data as BuildRow), is_active: true });
    }

    // Create fresh
    const { data: row, error } = await context.supabase
      .from("builds")
      .insert({
        owner_id: context.userId,
        name: "My rig",
        parts: { ram: [], storage: [] },
        is_active: true,
      })
      .select("id, name, parts, is_active, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return rowToBuild(row as BuildRow);
  });

const buildInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  parts: z.record(z.string(), z.unknown()),
});

export const saveBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => buildInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("builds")
        .update({ name: data.name, parts: data.parts as any })
        .eq("id", data.id)
        .select("id, name, parts, is_active, created_at, updated_at")
        .single();
      if (error) throw new Error(error.message);
      return rowToBuild(row as BuildRow);
    }
    const { data: row, error } = await context.supabase
      .from("builds")
      .insert({ owner_id: context.userId, name: data.name, parts: data.parts as any, is_active: false })
      .select("id, name, parts, is_active, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return rowToBuild(row as BuildRow);
  });


export const deleteBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("builds").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setActiveBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Clear other actives, set this one
    await context.supabase
      .from("builds")
      .update({ is_active: false })
      .eq("owner_id", context.userId)
      .neq("id", data.id);
    const { error } = await context.supabase
      .from("builds")
      .update({ is_active: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createNewBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: z.string().min(1).max(200).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const name = data.name ?? `Build ${new Date().toLocaleDateString()}`;
    // Clear other actives
    await context.supabase
      .from("builds")
      .update({ is_active: false })
      .eq("owner_id", context.userId);
    const { data: row, error } = await context.supabase
      .from("builds")
      .insert({
        owner_id: context.userId,
        name,
        parts: { ram: [], storage: [] },
        is_active: true,
      })
      .select("id, name, parts, is_active, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return rowToBuild(row as BuildRow);
  });
