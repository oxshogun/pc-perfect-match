import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Boxes, ChevronDown, Maximize2, Move3d, X } from "lucide-react";
import type { ResolvedBuild } from "@/lib/pc/compat";
import type { CompatIssue, PartCategory } from "@/lib/pc/types";
import { ZoomControls, useZoomControls } from "./ZoomControls";
import { PartDetailsCard } from "./PartDetailsCard";

const BuildViewer = lazy(() => import("./BuildViewer"));

interface Props {
  resolved: ResolvedBuild;
  faults?: PartCategory[];
  issues?: CompatIssue[];
}

function Placeholder() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-surface">
      <Boxes className="h-8 w-8 text-muted-foreground animate-pulse" />
    </div>
  );
}

export function BuildPreviewPanel({ resolved, faults, issues = [] }: Props) {
  const [open, setOpen] = useState(true);
  const [full, setFull] = useState(false);
  const [explode, setExplode] = useState(false);
  const [selected, setSelected] = useState<PartCategory | null>(null);
  const panelZoom = useZoomControls();
  const fullZoom = useZoomControls();

  function toggleExplode() {
    setExplode((v) => {
      if (v) setSelected(null);
      return !v;
    });
  }

  const showCard = explode && selected;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground shadow-lg hover:text-primary"
      >
        <Boxes className="h-4 w-4 text-primary" /> 3D rig
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 w-[300px] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-1.5">
          <Boxes className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Assembled rig
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleExplode}
              aria-label="Toggle exploded view"
              aria-pressed={explode}
              title={explode ? "Assembled view" : "Exploded view"}
              className={`rounded p-1 ${explode ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
            >
              <Move3d className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setFull(true)}
              aria-label="Expand preview"
              className="rounded p-1 text-muted-foreground hover:text-primary"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setSelected(null);
              }}
              aria-label="Collapse preview"
              className="rounded p-1 text-muted-foreground hover:text-primary"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="relative h-[220px]">
          <ClientOnly fallback={<Placeholder />}>
            <Suspense fallback={<Placeholder />}>
              <BuildViewer
                resolved={resolved}
                faults={faults}
                explode={explode}
                selected={selected}
                onSelect={setSelected}
                controlsRef={panelZoom.controlsRef}
              />
            </Suspense>
          </ClientOnly>
          <ZoomControls
            onZoomIn={panelZoom.zoomIn}
            onZoomOut={panelZoom.zoomOut}
            className="absolute bottom-2 right-2"
          />
          {explode && !selected && (
            <p className="pointer-events-none absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Click a part
            </p>
          )}
        </div>
        {showCard && !full && (
          <div className="max-h-[320px] overflow-y-auto border-t border-border p-2">
            <PartDetailsCard
              category={selected}
              resolved={resolved}
              issues={issues}
              onClose={() => setSelected(null)}
              className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
            />
          </div>
        )}
      </div>

      {full && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4">
          <button
            onClick={toggleExplode}
            aria-label="Toggle exploded view"
            aria-pressed={explode}
            className={`absolute right-20 top-6 z-10 flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] ${explode ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
          >
            <Move3d className="h-4 w-4" /> {explode ? "Assembled" : "Explode"}
          </button>
          <button
            onClick={() => {
              setFull(false);
              setSelected(null);
            }}
            aria-label="Close fullscreen preview"
            className="absolute right-6 top-6 z-10 rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex h-full w-full gap-4">
            <div className="relative h-full flex-1 overflow-hidden rounded-lg border border-border">
              <ClientOnly fallback={<Placeholder />}>
                <Suspense fallback={<Placeholder />}>
                  <BuildViewer
                    resolved={resolved}
                    faults={faults}
                    explode={explode}
                    selected={selected}
                    onSelect={setSelected}
                    controlsRef={fullZoom.controlsRef}
                  />
                </Suspense>
              </ClientOnly>
              <ZoomControls
                onZoomIn={fullZoom.zoomIn}
                onZoomOut={fullZoom.zoomOut}
                className="absolute bottom-4 right-4"
              />
              {explode && !selected && (
                <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Click a part for details
                </p>
              )}
            </div>
            {showCard && (
              <div className="w-[320px] shrink-0 overflow-y-auto pt-16">
                <PartDetailsCard
                  category={selected}
                  resolved={resolved}
                  issues={issues}
                  onClose={() => setSelected(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
