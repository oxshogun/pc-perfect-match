import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { decodeShare } from "@/lib/pc/share";
import { CATEGORY_LABEL, CATEGORY_ORDER, type PartCategory, type Part, type Build } from "@/lib/pc/types";
import {
  analyze,
  estimatePrice,
  estimateWattage,
  performanceTier,
  resolveBuild,
} from "@/lib/pc/compat";
import { CompatibilityPanel } from "@/components/pc/CompatibilityPanel";
import { PartSlot } from "@/components/pc/PartSlot";
import { Button } from "@/components/ui/button";
import { createBuild, saveBuild, upsertPart, setActiveBuildId } from "@/lib/pc/store";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/share/$data")({
  head: () => ({
    meta: [
      { title: "Shared build — RIG.LAB" },
      { name: "description", content: "A shared PC build with compatibility analysis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharedBuild,
});

const MULTIPLE: PartCategory[] = ["ram", "storage"];

function SharedBuild() {
  const { data } = useParams({ from: "/share/$data" });
  const payload = useMemo(() => decodeShare(data), [data]);

  if (!payload) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-destructive">Invalid link</p>
        <h1 className="text-2xl font-bold mt-2">Could not read shared build</h1>
        <p className="text-muted-foreground mt-2">
          The share URL looks malformed or was truncated.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to builder</Link>
        </Button>
      </div>
    );
  }

  const fauxBuild: Build = {
    id: "shared",
    name: payload.name,
    createdAt: 0,
    updatedAt: 0,
    parts: payload.build,
  };
  const resolved = resolveBuild(fauxBuild, payload.parts);
  const issues = analyze(resolved);
  const watts = estimateWattage(resolved);
  const price = estimatePrice(resolved);
  const tier = performanceTier(resolved);

  const partsForSlot = (cat: PartCategory): Part[] => {
    if (MULTIPLE.includes(cat)) {
      const ids = ((fauxBuild.parts as any)[cat] as string[] | undefined) ?? [];
      return ids.map((id) => payload.parts.find((p) => p.id === id)).filter(Boolean) as Part[];
    }
    const id = (fauxBuild.parts as any)[cat] as string | undefined;
    const p = id ? payload.parts.find((x) => x.id === id) : undefined;
    return p ? [p] : [];
  };

  async function importToLibrary() {
    try {
      for (const p of payload!.parts) await upsertPart(p);
      const b = await createBuild(`${payload!.name} (imported)`);
      await saveBuild({ ...b, parts: payload!.build });
      await setActiveBuildId(b.id);
      toast.success("Imported to your library");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Shared rig</p>
        <div className="flex flex-wrap items-end gap-4 justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{payload.name}</h1>
          <Button onClick={importToLibrary}>
            <Download className="h-4 w-4 mr-1.5" /> Import to my library
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Est. price" value={`$${price.toLocaleString()}`} accent />
        <StatCard label="Est. draw" value={`${watts.total} W`} sub={`rec. ${watts.recommended} W PSU`} />
        <StatCard label="Tier" value={tier.tier} sub={`score ${tier.score}`} />
        <StatCard
          label="Status"
          value={issues.some((i) => i.level === "error") ? "FAULT" : issues.some((i) => i.level === "warning") ? "REVIEW" : "READY"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {CATEGORY_ORDER.map((cat) => (
            <PartSlot
              key={cat}
              category={cat}
              parts={partsForSlot(cat)}
              multiple={MULTIPLE.includes(cat)}
              onAdd={() => {}}
              onRemove={() => {}}
            />
          ))}
        </div>
        <div>
          <CompatibilityPanel issues={issues} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
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
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{sub}</p>}
    </div>
  );
}
