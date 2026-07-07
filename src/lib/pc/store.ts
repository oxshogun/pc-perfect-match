import { useSyncExternalStore } from "react";
import type { Build, Part } from "./types";
import { SEED_PARTS } from "./seed";

const PARTS_KEY = "riglab.parts.v1";
const BUILDS_KEY = "riglab.builds.v1";
const ACTIVE_KEY = "riglab.activeBuild.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

// Cached snapshots — required for useSyncExternalStore stability.
let partsCache: Part[] | null = null;
let buildsCache: Build[] | null = null;
let activeIdCache: string | null = null;

function invalidate() {
  partsCache = null;
  buildsCache = null;
  activeIdCache = null;
}
const emit = () => {
  invalidate();
  listeners.forEach((l) => l());
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export function emptyBuild(name = "Untitled build"): Build {
  const now = Date.now();
  return {
    id: uid("build"),
    name,
    createdAt: now,
    updatedAt: now,
    parts: { ram: [], storage: [] },
  };
}

let initialized = false;
function ensureInit() {
  if (initialized || !isBrowser()) return;
  initialized = true;
  if (!window.localStorage.getItem(PARTS_KEY)) writeJSON(PARTS_KEY, SEED_PARTS);
  if (!window.localStorage.getItem(BUILDS_KEY)) writeJSON(BUILDS_KEY, []);
  if (!window.localStorage.getItem(ACTIVE_KEY)) {
    const b = emptyBuild("My rig");
    writeJSON(BUILDS_KEY, [b]);
    writeJSON(ACTIVE_KEY, b.id);
  }
}

/* ---------- Parts ---------- */

export function getParts(): Part[] {
  ensureInit();
  if (partsCache === null) partsCache = readJSON<Part[]>(PARTS_KEY, []);
  return partsCache;
}

export function upsertPart(part: Part) {
  const parts = [...getParts()];
  const idx = parts.findIndex((p) => p.id === part.id);
  if (idx >= 0) parts[idx] = part;
  else parts.push({ ...part, id: part.id || uid("part") });
  writeJSON(PARTS_KEY, parts);
  emit();
}

export function deletePart(id: string) {
  const parts = getParts().filter((p) => p.id !== id);
  writeJSON(PARTS_KEY, parts);
  const builds = getBuilds().map((b) => scrubPartFromBuild(b, id));
  writeJSON(BUILDS_KEY, builds);
  emit();
}

function scrubPartFromBuild(b: Build, id: string): Build {
  const p = { ...b.parts };
  (Object.keys(p) as (keyof Build["parts"])[]).forEach((k) => {
    const v = p[k] as string | string[] | undefined;
    if (Array.isArray(v)) (p as any)[k] = v.filter((x) => x !== id);
    else if (v === id) (p as any)[k] = undefined;
  });
  return { ...b, parts: p, updatedAt: Date.now() };
}

/* ---------- Builds ---------- */

export function getBuilds(): Build[] {
  ensureInit();
  if (buildsCache === null) buildsCache = readJSON<Build[]>(BUILDS_KEY, []);
  return buildsCache;
}

export function getActiveBuildId(): string {
  ensureInit();
  if (activeIdCache === null) activeIdCache = readJSON<string>(ACTIVE_KEY, "");
  return activeIdCache;
}

export function setActiveBuildId(id: string) {
  writeJSON(ACTIVE_KEY, id);
  emit();
}

export function getActiveBuild(): Build {
  const builds = getBuilds();
  const id = getActiveBuildId();
  const found = builds.find((b) => b.id === id);
  if (found) return found;
  if (builds[0]) {
    writeJSON(ACTIVE_KEY, builds[0].id);
    invalidate();
    return builds[0];
  }
  const b = emptyBuild();
  writeJSON(BUILDS_KEY, [b]);
  writeJSON(ACTIVE_KEY, b.id);
  invalidate();
  return b;
}

export function createBuild(name?: string): Build {
  const b = emptyBuild(name || `Build ${new Date().toLocaleDateString()}`);
  const builds = [...getBuilds(), b];
  writeJSON(BUILDS_KEY, builds);
  writeJSON(ACTIVE_KEY, b.id);
  emit();
  return b;
}

export function saveBuild(build: Build) {
  const builds = getBuilds();
  const next = builds.some((b) => b.id === build.id)
    ? builds.map((b) => (b.id === build.id ? { ...build, updatedAt: Date.now() } : b))
    : [...builds, { ...build, updatedAt: Date.now() }];
  writeJSON(BUILDS_KEY, next);
  emit();
}

export function deleteBuild(id: string) {
  const builds = getBuilds().filter((b) => b.id !== id);
  writeJSON(BUILDS_KEY, builds);
  if (getActiveBuildId() === id) {
    writeJSON(ACTIVE_KEY, builds[0]?.id ?? "");
  }
  emit();
}

export function updateActiveBuild(mutator: (b: Build) => Build) {
  const active = getActiveBuild();
  saveBuild(mutator(active));
}

/* ---------- React hooks ---------- */

function subscribe(cb: Listener) {
  listeners.add(cb);
  const onStorage = () => {
    invalidate();
    cb();
  };
  if (isBrowser()) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (isBrowser()) window.removeEventListener("storage", onStorage);
  };
}

// Stable server-snapshot singletons — must be reference-equal across calls.
const SERVER_PARTS: Part[] = [];
const SERVER_BUILDS: Build[] = [];
const SERVER_BUILD: Build = {
  id: "ssr",
  name: "",
  createdAt: 0,
  updatedAt: 0,
  parts: { ram: [], storage: [] },
};

export function useParts(): Part[] {
  return useSyncExternalStore(subscribe, getParts, () => SERVER_PARTS);
}

export function useBuilds(): Build[] {
  return useSyncExternalStore(subscribe, getBuilds, () => SERVER_BUILDS);
}

export function useActiveBuild(): Build {
  return useSyncExternalStore(subscribe, getActiveBuild, () => SERVER_BUILD);
}

export function useActiveBuildId(): string {
  return useSyncExternalStore(subscribe, getActiveBuildId, () => "");
}

