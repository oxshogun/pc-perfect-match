export interface ThemeDef {
  id: string;
  name: string;
  tagline: string;
  /** swatch preview colors (css color strings) */
  swatch: [string, string, string, string];
}

export const THEMES: ThemeDef[] = [
  {
    id: "cyan",
    name: "Cyan Core",
    tagline: "Stock RIG.LAB — neon cyan on gunmetal",
    swatch: ["oklch(0.16 0.015 240)", "oklch(0.22 0.02 240)", "oklch(0.84 0.16 195)", "oklch(0.78 0.16 155)"],
  },
  {
    id: "ember",
    name: "Ember Forge",
    tagline: "Molten orange, blast-furnace blacks",
    swatch: ["oklch(0.15 0.012 40)", "oklch(0.22 0.02 40)", "oklch(0.78 0.18 50)", "oklch(0.70 0.20 25)"],
  },
  {
    id: "toxic",
    name: "Toxic Lime",
    tagline: "Overclocked acid green",
    swatch: ["oklch(0.15 0.02 150)", "oklch(0.21 0.03 150)", "oklch(0.86 0.21 130)", "oklch(0.80 0.15 175)"],
  },
  {
    id: "violet",
    name: "Violet Surge",
    tagline: "RGB-adjacent magenta bloom",
    swatch: ["oklch(0.15 0.025 300)", "oklch(0.21 0.035 300)", "oklch(0.75 0.20 305)", "oklch(0.72 0.18 340)"],
  },
  {
    id: "arctic",
    name: "Arctic Bench",
    tagline: "Sub-zero blue, LN2 cold",
    swatch: ["oklch(0.17 0.02 250)", "oklch(0.24 0.03 250)", "oklch(0.82 0.13 245)", "oklch(0.88 0.06 220)"],
  },
  {
    id: "gold",
    name: "Titanium Gold",
    tagline: "Brushed graphite with gold trim",
    swatch: ["oklch(0.16 0.004 90)", "oklch(0.23 0.006 90)", "oklch(0.83 0.14 90)", "oklch(0.75 0.09 60)"],
  },
];

export const DEFAULT_THEME = "cyan";
const STORAGE_KEY = "riglab.theme";

export function getStoredTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return THEMES.some((t) => t.id === v) ? (v as string) : DEFAULT_THEME;
}

export function applyTheme(id: string) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = id;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("riglab:theme", { detail: id }));
}
