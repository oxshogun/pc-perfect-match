import { useRef, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function useZoomControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // factor < 1 moves the camera closer (zoom in), > 1 moves it away (zoom out).
  const zoom = useCallback((factor: number) => {
    const controls = controlsRef.current as any;
    if (!controls) return;
    const camera = controls.object;
    const target = controls.target;
    if (!camera || !target) return;

    const offsetX = camera.position.x - target.x;
    const offsetY = camera.position.y - target.y;
    const offsetZ = camera.position.z - target.z;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ);
    if (distance === 0) return;

    const min = typeof controls.minDistance === "number" ? controls.minDistance : 0.01;
    const max = typeof controls.maxDistance === "number" && Number.isFinite(controls.maxDistance)
      ? controls.maxDistance
      : Number.POSITIVE_INFINITY;
    const next = Math.min(Math.max(distance * factor, min), max);
    const scale = next / distance;

    camera.position.set(
      target.x + offsetX * scale,
      target.y + offsetY * scale,
      target.z + offsetZ * scale,
    );
    camera.updateProjectionMatrix?.();
    controls.update();
  }, []);

  const zoomIn = useCallback(() => zoom(0.8), [zoom]);
  const zoomOut = useCallback(() => zoom(1.25), [zoom]);

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
