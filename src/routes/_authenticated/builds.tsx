import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createBuild,
  deleteBuild,
  saveBuild,
  setActiveBuildId,
  useActiveBuildId,
  useBuilds,
  useParts,
} from "@/lib/pc/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyze, estimatePrice, performanceTier, resolveBuild } from "@/lib/pc/compat";
import { encodeShare } from "@/lib/pc/share";
import { FilePlus, Share2, Trash2, Copy, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/builds")({
  head: () => ({
    meta: [
      { title: "Saved builds — RIG.LAB" },
      { name: "description", content: "Your saved PC builds." },
    ],
  }),
  component: BuildsPage,
});

function BuildsPage() {
  const builds = useBuilds();
  const parts = useParts();
  const activeId = useActiveBuildId();

  const rows = useMemo(
    () =>
      builds.map((b) => {
        const r = resolveBuild(b, parts);
        const issues = analyze(r);
        return {
          build: b,
          price: estimatePrice(r),
          tier: performanceTier(r),
          errors: issues.filter((i) => i.level === "error").length,
          warnings: issues.filter((i) => i.level === "warning").length,
          picked: Object.values(b.parts).reduce(
            (s, v) => s + (Array.isArray(v) ? v.length : v ? 1 : 0),
            0,
          ),
        };
      }),
    [builds, parts],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Archive</p>
          <h1 className="text-3xl font-bold tracking-tight">Saved builds</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {builds.length} build{builds.length === 1 ? "" : "s"} saved locally.
          </p>
        </div>
        <Button
          onClick={() => {
            createBuild();
            toast.success("New build created");
          }}
        >
          <FilePlus className="h-4 w-4 mr-1.5" /> New build
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No builds yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map(({ build, price, tier, errors, warnings, picked }) => {
            const active = build.id === activeId;
            return (
              <div
                key={build.id}
                className={`rounded-lg border p-4 bg-card transition ${
                  active
                    ? "border-primary/50 glow-primary"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {active && <Star className="h-4 w-4 text-primary fill-primary" />}
                      <h3 className="font-semibold text-lg truncate">{build.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 items-center text-xs font-mono">
                      <Badge variant="outline" className="uppercase tracking-widest">
                        {picked} parts
                      </Badge>
                      <Badge variant="outline" className="uppercase tracking-widest text-primary border-primary/40">
                        {tier.tier}
                      </Badge>
                      {errors > 0 && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/40 uppercase tracking-widest">
                          {errors} err
                        </Badge>
                      )}
                      {warnings > 0 && (
                        <Badge className="bg-warning/20 text-warning border-warning/40 uppercase tracking-widest">
                          {warnings} warn
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        · updated {new Date(build.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold text-primary tabular-nums">
                      ${price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!active && (
                    <Button
                      onClick={() => {
                        setActiveBuildId(build.id);
                        toast.success("Loaded in workbench");
                      }}
                    >
                      Open <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  {active && (
                    <Button asChild>
                      <Link to="/">
                        Continue editing <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const usedIds = new Set<string>();
                      Object.values(build.parts).forEach((v) => {
                        if (Array.isArray(v)) v.forEach((id) => usedIds.add(id));
                        else if (v) usedIds.add(v);
                      });
                      const usedParts = parts.filter((p) => usedIds.has(p.id));
                      const token = encodeShare({
                        name: build.name,
                        parts: usedParts,
                        build: build.parts,
                      });
                      const url = `${window.location.origin}/share/${token}`;
                      navigator.clipboard.writeText(url).then(
                        () => toast.success("Share link copied"),
                        () => toast.error("Could not copy"),
                      );
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1.5" /> Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const dup = {
                        ...build,
                        id: `build-${Math.random().toString(36).slice(2, 9)}`,
                        name: `${build.name} (copy)`,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      };
                      saveBuild(dup);
                      toast.success("Duplicated");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1.5" /> Duplicate
                  </Button>
                  {builds.length > 1 && (
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        deleteBuild(build.id);
                        toast.success("Build deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
