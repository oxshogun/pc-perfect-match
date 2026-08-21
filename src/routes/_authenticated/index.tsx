import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PartSlot } from "@/components/pc/PartSlot";
import { PartPickerDialog } from "@/components/pc/PartPickerDialog";
import { CompatibilityPanel } from "@/components/pc/CompatibilityPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useActiveBuild,
  useParts,
  updateActiveBuild,
  createBuild,
  saveBuild,
} from "@/lib/pc/store";
import { CATEGORY_ORDER, type Part, type PartCategory } from "@/lib/pc/types";
import {
  analyze,
  estimatePrice,
  estimateWattage,
  performanceTier,
  resolveBuild,
} from "@/lib/pc/compat";
import { encodeShare } from "@/lib/pc/share";
import { BuildPreviewPanel } from "@/components/pc/three/BuildPreviewPanel";
import { toast } from "sonner";
import { Copy, FilePlus, Save, Share2, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: BuilderPage,
});

const MULTIPLE_CATEGORIES: PartCategory[] = ["ram", "storage"];

function BuilderPage() {
  const parts = useParts();
  const build = useActiveBuild();
  const [pickerFor, setPickerFor] = useState<PartCategory | null>(null);
  const [renaming, setRenaming] = useState(false);

  const resolved = useMemo(() => resolveBuild(build, parts), [build, parts]);
  const issues = useMemo(() => analyze(resolved), [resolved]);
  const watts = useMemo(() => estimateWattage(resolved), [resolved]);
  const price = useMemo(() => estimatePrice(resolved), [resolved]);
  const tier = useMemo(() => performanceTier(resolved), [resolved]);

  function partsForSlot(cat: PartCategory): Part[] {
    if (MULTIPLE_CATEGORIES.includes(cat)) {
      const ids = (build.parts as any)[cat] as string[] | undefined;
      return (ids ?? []).map((id) => parts.find((p) => p.id === id)).filter(Boolean) as Part[];
    }
    const id = (build.parts as any)[cat] as string | undefined;
    const p = id ? parts.find((x) => x.id === id) : undefined;
    return p ? [p] : [];
  }

  function handlePick(part: Part) {
    updateActiveBuild((b) => {
      const p = { ...b.parts };
      if (MULTIPLE_CATEGORIES.includes(part.category)) {
        const key = part.category as "ram" | "storage";
        const arr = (p[key] as string[] | undefined) ?? [];
        p[key] = [...arr, part.id];
      } else {
        (p as any)[part.category] = part.id;
      }
      return { ...b, parts: p };
    });
    toast.success(`Added ${part.name}`);
  }

  function handleRemove(cat: PartCategory, id: string) {
    updateActiveBuild((b) => {
      const p = { ...b.parts };
      if (MULTIPLE_CATEGORIES.includes(cat)) {
        const key = cat as "ram" | "storage";
        p[key] = ((p[key] as string[] | undefined) ?? []).filter((x) => x !== id);
      } else {
        (p as any)[cat] = undefined;
      }
      return { ...b, parts: p };
    });
  }

  function handleShare() {
    const usedIds = new Set<string>();
    Object.values(build.parts).forEach((v) => {
      if (Array.isArray(v)) v.forEach((id) => usedIds.add(id));
      else if (v) usedIds.add(v);
    });
    const usedParts = parts.filter((p) => usedIds.has(p.id));
    const token = encodeShare({ name: build.name, parts: usedParts, build: build.parts });
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Share link copied to clipboard"),
      () => toast.error("Could not copy link"),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[240px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
            Workbench
          </p>
          {renaming ? (
            <Input
              autoFocus
              value={build.name}
              onChange={(e) =>
                saveBuild({ ...build, name: e.target.value })
              }
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
              className="mt-1 text-2xl font-bold h-auto py-1"
            />
          ) : (
            <h1
              className="mt-1 text-3xl font-bold tracking-tight cursor-text hover:text-primary transition-colors"
              onClick={() => setRenaming(true)}
            >
              {build.name}
              <span className="ml-2 text-xs font-mono text-muted-foreground align-middle">
                click to rename
              </span>
            </h1>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => createBuild()}>
            <FilePlus className="h-4 w-4 mr-1.5" /> New build
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1.5" /> Share
          </Button>
          <Button asChild>
            <Link to="/builds">
              <Save className="h-4 w-4 mr-1.5" /> Builds
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Est. price" value={`$${price.toLocaleString()}`} accent />
        <Stat label="Est. draw" value={`${watts.total} W`} sub={`rec. ${watts.recommended} W PSU`} />
        <Stat label="Tier" value={tier.tier} sub={`score ${tier.score}`} />
        <Stat
          label="Status"
          value={
            issues.some((i) => i.level === "error")
              ? "FAULT"
              : issues.some((i) => i.level === "warning")
              ? "REVIEW"
              : "READY"
          }
          tone={
            issues.some((i) => i.level === "error")
              ? "destructive"
              : issues.some((i) => i.level === "warning")
              ? "warning"
              : "success"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Slots */}
        <div className="space-y-3">
          {CATEGORY_ORDER.map((cat) => (
            <PartSlot
              key={cat}
              category={cat}
              parts={partsForSlot(cat)}
              multiple={MULTIPLE_CATEGORIES.includes(cat)}
              onAdd={() => setPickerFor(cat)}
              onRemove={(id) => handleRemove(cat, id)}
            />
          ))}
        </div>

        {/* Right column: compat + wattage */}
        <div className="space-y-4">
          <CompatibilityPanel issues={issues} />

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Power breakdown
              </p>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <WattRow label="CPU" value={watts.cpu} />
              <WattRow label="GPU" value={watts.gpu} />
              <WattRow label="Other" value={watts.other} />
              <div className="h-px bg-border my-2" />
              <WattRow label="Total" value={watts.total} bold />
              <WattRow label="Recommended PSU" value={watts.recommended} muted />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Need a part not in the library?{" "}
            <Link to="/library" className="text-primary hover:underline">
              Add it →
            </Link>
          </p>
        </div>
      </div>

      {pickerFor && (
        <PartPickerDialog
          open={!!pickerFor}
          onOpenChange={(v) => !v && setPickerFor(null)}
          category={pickerFor}
          onPick={handlePick}
          multiple={MULTIPLE_CATEGORIES.includes(pickerFor)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  tone?: "destructive" | "warning" | "success";
}) {
  const toneClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
      ? "text-warning"
      : tone === "success"
      ? "text-success"
      : accent
      ? "text-primary"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{sub}</p>}
    </div>
  );
}

function WattRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: number;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "text-foreground" : "text-muted-foreground"} ${muted ? "text-muted-foreground text-xs" : ""}`}
    >
      <span>{label}</span>
      <span className={`tabular-nums ${bold ? "text-primary font-bold" : ""}`}>{value} W</span>
    </div>
  );
}
