import { useRef, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function useZoomControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const zoom = useCallback((factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    // drei forwards the underlying Three.js OrbitControls instance.
    // dollyIn/dollyOut move the camera toward/away from target by a ratio.
    if (factor < 1) {
      (controls as any).dollyIn(factor);
    } else {
      (controls as any).dollyOut(factor);
    }
    controls.update();
  }, []);

  const zoomIn = useCallback(() => zoom(0.85), [zoom]);
  const zoomOut = useCallback(() => zoom(1.18), [zoom]);

  return { controlsRef, zoomIn, zoomOut };
}

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
}

export function ZoomControls({ onZoomIn, onZoomOut, className = "" }: ZoomControlsProps) {
  return (
    <div className={`flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-lg ${className}`}>
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom out"
        className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-surface"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom in"
        className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-surface"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
