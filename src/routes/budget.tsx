import { createFileRoute, Link, useNavigate, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { Boxes, Cpu, DollarSign, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useParts, createBuild, saveBuild, setActiveBuildId } from "@/lib/pc/store";
import { recommendBuild } from "@/lib/pc/recommend";
import { CATEGORY_LABEL, CATEGORY_ORDER, type Part, type PartCategory } from "@/lib/pc/types";
import { ZoomControls, useZoomControls } from "@/components/pc/three/ZoomControls";

const BuildViewer = lazy(() => import("@/components/pc/three/BuildViewer"));

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
  head: () => ({
    meta: [
      { title: "Budget Builder — RIG.LAB" },
      {
        name: "description",
        content:
          "Set a price range and get a compatible PC build recommendation with part-by-part pricing, power draw and a 3D preview.",
      },
      { property: "og:title", content: "Budget Builder — RIG.LAB" },
      {
        property: "og:description",
        content: "Pick a budget and see a fully compatible parts list with prices and a 3D preview of the rig.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: "Budget", range: [500, 800] },
  { label: "Mid-range", range: [900, 1400] },
  { label: "High-end", range: [1500, 2200] },
  { label: "No limits", range: [2500, 5000] },
];

function BudgetPage() {
  const parts = useParts();
  const navigate = useNavigate();
  const zoom = useZoomControls();
  const [range, setRange] = useState<[number, number]>([900, 1400]);
  const [busy, setBusy] = useState(false);

  const rec = useMemo(() => recommendBuild(parts, range[0], range[1]), [parts, range]);

  const rows = useMemo(() => {
    if (!rec) return [];
    const out: { cat: PartCategory; part: Part }[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (cat === "ram") rec.resolved.ram.forEach((p) => out.push({ cat, part: p }));
      else if (cat === "storage") rec.resolved.storage.forEach((p) => out.push({ cat, part: p }));
      else {
        const p = rec.resolved[cat];
        if (p) out.push({ cat, part: p });
      }
    }
    return out;
  }, [rec]);

  async function loadIntoWorkbench() {
    if (!rec) return;
    setBusy(true);
    try {
      const created = await createBuild(`$${rec.price.toLocaleString()} build`);
      await saveBuild({ ...created, parts: rec.buildParts });
      await setActiveBuildId(created.id);
      toast.success("Loaded into the workbench");
      navigate({ to: "/" });
    } catch {
      toast.error("Could not load that build");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Budget calculator</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Build for your price range</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Slide to your budget and we pick the strongest fully compatible parts list that fits, with prices,
        power draw and a 3D preview of the finished rig.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="font-mono text-2xl font-bold tabular-nums text-primary">
            ${range[0].toLocaleString()} – ${range[1].toLocaleString()}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant={range[0] === p.range[0] && range[1] === p.range[1] ? "default" : "outline"}
                onClick={() => setRange(p.range)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <Slider
          className="mt-6"
          min={400}
          max={6000}
          step={50}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1] ?? v[0]] as [number, number])}
        />
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>$400</span>
          <span>$6,000</span>
        </div>
      </div>

      {!rec ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <Cpu className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No complete compatible build fits that range yet. Try raising the top of the range, or{" "}
            <Link to="/library" className="text-primary hover:underline">
              add more parts
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Build total" value={`$${rec.price.toLocaleString()}`} accent />
            <Stat
              label="Headroom"
              value={`$${Math.max(0, range[1] - rec.price).toLocaleString()}`}
              sub="left in budget"
            />
            <Stat label="Tier" value={rec.tier.tier} sub={`score ${rec.tier.score}`} />
            <Stat label="Est. draw" value={`${rec.watts.total} W`} sub={`${rec.psuNote ?? rec.watts.recommended} W PSU rec.`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Recommended parts
                </p>
              </div>
              <ul className="divide-y divide-border">
                {rows.map(({ cat, part }) => (
                  <li key={part.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {CATEGORY_LABEL[cat]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{part.name}</span>
                    <span className="font-mono text-sm tabular-nums text-primary">
                      ${(part.price ?? 0).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 border-t border-border bg-surface px-4 py-3">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Total
                </span>
                <span className="ml-auto font-mono text-lg font-bold tabular-nums text-primary">
                  ${rec.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
                  <Boxes className="h-4 w-4 text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    3D preview
                  </p>
                </div>
                <div className="relative h-[320px]">
                  <ClientOnly fallback={<ViewerFallback />}>
                    <Suspense fallback={<ViewerFallback />}>
                      <BuildViewer resolved={rec.resolved} controlsRef={zoom.controlsRef} />
                    </Suspense>
                  </ClientOnly>
                  <ZoomControls
                    onZoomIn={zoom.zoomIn}
                    onZoomOut={zoom.zoomOut}
                    className="absolute bottom-2 right-2"
                  />
                </div>
              </div>
              <Button className="w-full" onClick={loadIntoWorkbench} disabled={busy}>
                Load into workbench
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can swap any part afterwards on the{" "}
                <Link to="/" className="text-primary hover:underline">
                  builder
                </Link>
                .
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ViewerFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface">
      <Boxes className="h-8 w-8 animate-pulse text-muted-foreground" />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-mono text-2xl font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
