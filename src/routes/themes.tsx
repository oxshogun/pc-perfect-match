import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { THEMES, applyTheme, getStoredTheme } from "@/lib/pc/themes";
import { toast } from "sonner";

export const Route = createFileRoute("/themes")({
  head: () => ({
    meta: [
      { title: "Themes — RIG.LAB color schemes" },
      {
        name: "description",
        content:
          "Pick a color scheme for your RIG.LAB workbench: cyan, ember, toxic lime, violet, arctic or gold.",
      },
      { property: "og:title", content: "Themes — RIG.LAB color schemes" },
      {
        property: "og:description",
        content: "Six hardware-console color schemes for the RIG.LAB PC builder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThemesPage,
});

function ThemesPage() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setActive(getStoredTheme());
  }, []);

  function pick(id: string, name: string) {
    applyTheme(id);
    setActive(id);
    toast.success(`Theme set to ${name}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Appearance</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Palette className="h-6 w-6 text-primary" /> Themes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recolor the whole workbench. Your pick is saved to this browser and doesn't affect your
          parts, builds or compatibility checks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id, t.name)}
              className={`group relative overflow-hidden rounded-lg border bg-card p-4 text-left transition-all hover:-translate-y-0.5 ${
                selected
                  ? "border-primary glow-primary"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold tracking-tight">{t.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.tagline}</p>
                </div>
                {selected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-1.5">
                {t.swatch.map((c, i) => (
                  <span
                    key={i}
                    className="h-8 flex-1 rounded-sm ring-1 ring-inset ring-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>

              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                {selected ? "active" : "apply theme"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
