import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Boxes, ChevronDown, Maximize2, X } from "lucide-react";
import type { ResolvedBuild } from "@/lib/pc/compat";
import type { PartCategory } from "@/lib/pc/types";

const BuildViewer = lazy(() => import("./BuildViewer"));

interface Props {
  resolved: ResolvedBuild;
  faults?: PartCategory[];
}

function Placeholder() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-surface">
      <Boxes className="h-8 w-8 text-muted-foreground animate-pulse" />
    </div>
  );
}

export function BuildPreviewPanel({ resolved, faults }: Props) {
  const [open, setOpen] = useState(true);
  const [full, setFull] = useState(false);

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
              onClick={() => setFull(true)}
              aria-label="Expand preview"
              className="rounded p-1 text-muted-foreground hover:text-primary"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse preview"
              className="rounded p-1 text-muted-foreground hover:text-primary"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-[220px]">
          <ClientOnly fallback={<Placeholder />}>
            <Suspense fallback={<Placeholder />}>
              <BuildViewer resolved={resolved} faults={faults} />
            </Suspense>
          </ClientOnly>
        </div>
      </div>

      {full && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4">
          <button
            onClick={() => setFull(false)}
            aria-label="Close fullscreen preview"
            className="absolute right-6 top-6 z-10 rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="h-full w-full overflow-hidden rounded-lg border border-border">
            <ClientOnly fallback={<Placeholder />}>
              <Suspense fallback={<Placeholder />}>
                <BuildViewer resolved={resolved} faults={faults} />
              </Suspense>
            </ClientOnly>
          </div>
        </div>
      )}
    </>
  );
}
