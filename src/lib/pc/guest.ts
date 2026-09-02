/**
 * Guest mode — lets someone use the builder without an account.
 * Parts and builds a guest creates live in memory only (plus a per-tab
 * session flag), so nothing is persisted to the backend and everything is
 * discarded when the tab closes.
 */
import type { Build, Part } from "./types";

const FLAG = "riglab-guest";

type GuestBuild = Build & { isActive: boolean };

let guestParts: Part[] = [];
let guestBuilds: GuestBuild[] = [];

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export function enterGuestMode() {
  try {
    window.sessionStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function exitGuestMode() {
  try {
    window.sessionStorage.removeItem(FLAG);
  } catch {
    /* ignore */
  }
  guestParts = [];
  guestBuilds = [];
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---- parts ---- */

export function guestPartList(): Part[] {
  return guestParts;
}

export function guestUpsertPart(part: Part): Part {
  const saved = {
    ...part,
    id: part.id && guestParts.some((p) => p.id === part.id) ? part.id : part.id || uid("guest-part"),
    visibility: "private",
  } as Part;
  const i = guestParts.findIndex((p) => p.id === saved.id);
  if (i >= 0) guestParts = guestParts.map((p, idx) => (idx === i ? saved : p));
  else guestParts = [...guestParts, saved];
  return saved;
}

export function guestDeletePart(id: string) {
  guestParts = guestParts.filter((p) => p.id !== id);
  guestBuilds = guestBuilds.map((b) => {
    const parts: Record<string, unknown> = { ...(b.parts as Record<string, unknown>) };
    for (const [k, v] of Object.entries(parts)) {
      if (Array.isArray(v)) parts[k] = v.filter((x) => x !== id);
      else if (v === id) parts[k] = undefined;
    }
    return { ...b, parts: parts as Build["parts"] };
  });
}

/* ---- builds ---- */

export function guestBuildList(): GuestBuild[] {
  if (guestBuilds.length === 0) guestCreateBuild("Guest build");
  return guestBuilds;
}

export function guestCreateBuild(name?: string): GuestBuild {
  const now = Date.now();
  const b: GuestBuild = {
    id: uid("guest-build"),
    name: name ?? `Build ${guestBuilds.length + 1}`,
    createdAt: now,
    updatedAt: now,
    parts: { ram: [], storage: [] } as Build["parts"],
    isActive: true,
  };
  guestBuilds = [...guestBuilds.map((x) => ({ ...x, isActive: false })), b];
  return b;
}

export function guestSaveBuild(build: Build): GuestBuild {
  const existing = guestBuilds.find((b) => b.id === build.id);
  const next: GuestBuild = {
    ...(existing ?? { isActive: guestBuilds.length === 0 }),
    ...build,
    id: build.id || uid("guest-build"),
    isActive: existing?.isActive ?? guestBuilds.length === 0,
    updatedAt: Date.now(),
  } as GuestBuild;
  guestBuilds = existing
    ? guestBuilds.map((b) => (b.id === next.id ? next : b))
    : [...guestBuilds, next];
  return next;
}

export function guestDeleteBuild(id: string) {
  guestBuilds = guestBuilds.filter((b) => b.id !== id);
  if (guestBuilds.length && !guestBuilds.some((b) => b.isActive)) {
    guestBuilds = guestBuilds.map((b, i) => ({ ...b, isActive: i === 0 }));
  }
}

export function guestSetActiveBuild(id: string) {
  guestBuilds = guestBuilds.map((b) => ({ ...b, isActive: b.id === id }));
}

export function guestActiveBuild(): GuestBuild {
  const list = guestBuildList();
  return list.find((b) => b.isActive) ?? list[0];
}
