/**
 * Cloud-backed store. Legacy exports kept as no-op stubs for old callers.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const applyPriceUpdates = (_: unknown) => {};
export const getLastPriceRefresh = () => 0;
export const isPriceRefreshDue = () => false;

/*
 * Cloud-backed store, exposed with the same hook/helper surface the app used
 * when everything lived in localStorage.
 */

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { Build, Part } from "./types";
import {
  listParts,
  upsertPart as upsertPartFn,
  deletePart as deletePartFn,
  whoAmI,
} from "@/lib/parts.functions";
import {
  listBuilds,
  saveBuild as saveBuildFn,
  deleteBuild as deleteBuildFn,
  setActiveBuild as setActiveBuildFn,
  createNewBuild as createNewBuildFn,
  getOrCreateActiveBuild,
} from "@/lib/builds.functions";

/* ---- Module-level QueryClient bridge (bound by RootComponent) ---- */

let qcRef: QueryClient | null = null;
export function bindQueryClient(qc: QueryClient) {
  qcRef = qc;
}

function invalidate(...keys: string[]) {
  if (!qcRef) return;
  for (const k of keys) qcRef.invalidateQueries({ queryKey: [k] });
}

/* ---- Query keys ---- */

export const partsKey = ["parts"] as const;
export const buildsKey = ["builds"] as const;
export const whoAmIKey = ["whoami"] as const;

/* ---- Types ---- */

type BuildWithActive = Build & { isActive: boolean };

const EMPTY_BUILD: BuildWithActive = {
  id: "",
  name: "Loading…",
  createdAt: 0,
  updatedAt: 0,
  parts: { ram: [], storage: [] },
  isActive: true,
};

/* ---- Hooks ---- */

export function useParts(): Part[] {
  const q = useQuery({ queryKey: partsKey, queryFn: () => listParts(), staleTime: 30_000 });
  return q.data ?? [];
}

export function useBuilds(): Build[] {
  const q = useQuery({ queryKey: buildsKey, queryFn: () => listBuilds(), staleTime: 30_000 });
  return q.data ?? [];
}

export function useActiveBuild(): Build {
  const builds = useBuilds();
  return builds.find((b) => (b as BuildWithActive).isActive) ?? builds[0] ?? EMPTY_BUILD;
}

export function useActiveBuildId(): string {
  return useActiveBuild().id;
}

export function useWhoAmI() {
  return useQuery({ queryKey: whoAmIKey, queryFn: () => whoAmI(), staleTime: 5 * 60_000 });
}

export function useIsAdmin(): boolean {
  const q = useWhoAmI();
  return Boolean(q.data?.isAdmin);
}

/* ---- Imperative helpers (call server fns + invalidate) ---- */

export async function upsertPart(part: Part) {
  const visibility = (part as any).visibility as "catalog" | "private" | undefined;
  await upsertPartFn({ data: { part: part as any, visibility } });
  invalidate("parts");
}

export async function deletePart(id: string) {
  await deletePartFn({ data: { id } });
  invalidate("parts", "builds");
}

export async function createBuild(name?: string): Promise<Build> {
  const b = await createNewBuildFn({ data: { name } });
  invalidate("builds");
  return b;
}

export async function saveBuild(build: Build) {
  const payload = {
    id: build.id && /^[0-9a-f-]{36}$/.test(build.id) ? build.id : undefined,
    name: build.name,
    parts: build.parts as Record<string, unknown>,
  };
  await saveBuildFn({ data: payload });
  invalidate("builds");
}

export async function deleteBuild(id: string) {
  await deleteBuildFn({ data: { id } });
  invalidate("builds");
}

export async function setActiveBuildId(id: string) {
  await setActiveBuildFn({ data: { id } });
  invalidate("builds");
}

export async function ensureActiveBuild(): Promise<Build> {
  const b = await getOrCreateActiveBuild();
  invalidate("builds");
  return b;
}

/**
 * Apply a mutator to the active build and persist it. Reads from cache
 * to avoid a round-trip. If nothing is loaded yet, no-op.
 */
export async function updateActiveBuild(mutator: (b: Build) => Build) {
  if (!qcRef) return;
  const builds = qcRef.getQueryData<Build[]>(partsFallback(buildsKey)) ?? [];
  const active =
    (builds as BuildWithActive[]).find((b) => b.isActive) ?? builds[0];
  if (!active || !active.id) {
    // No build exists yet — create one, then apply.
    const created = await createNewBuildFn({ data: {} });
    const next = mutator(created);
    await saveBuild(next);
    return;
  }
  const next = mutator(active);
  await saveBuild(next);

  // Optimistic cache update
  qcRef.setQueryData<Build[]>(partsFallback(buildsKey), (prev) => {
    if (!prev) return prev;
    return prev.map((b) => (b.id === active.id ? next : b));
  });
}

// Small helper — react-query's queryKey type wants a mutable array.
function partsFallback<T extends readonly unknown[]>(k: T): unknown[] {
  return [...k];
}

/* ---- Hooks that expose ready-to-call helpers (optional) ---- */

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: partsKey });
    qc.invalidateQueries({ queryKey: buildsKey });
  };
}
