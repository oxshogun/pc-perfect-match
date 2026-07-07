import type { Build, Part } from "./types";

export interface SharedPayload {
  name: string;
  parts: Part[];
  build: Build["parts"];
}

// URL-safe base64
function b64encode(s: string) {
  if (typeof window === "undefined") return Buffer.from(s, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(s: string) {
  const t = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  if (typeof window === "undefined") return Buffer.from(t, "base64").toString("utf-8");
  return decodeURIComponent(escape(atob(t)));
}

export function encodeShare(payload: SharedPayload): string {
  return b64encode(JSON.stringify(payload));
}

export function decodeShare(token: string): SharedPayload | null {
  try {
    return JSON.parse(b64decode(token)) as SharedPayload;
  } catch {
    return null;
  }
}
