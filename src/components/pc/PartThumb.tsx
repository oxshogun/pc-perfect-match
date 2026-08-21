import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Cpu, HardDrive, MemoryStick, Power, Box, Fan, MonitorPlay, Wrench, Rotate3d } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Part, PartCategory } from "@/lib/pc/types";

const PartModelViewer = lazy(() => import("./three/PartModelViewer"));

const ICONS: Record<PartCategory, LucideIcon> = {
  cpu: Cpu,
  motherboard: Wrench,
  ram: MemoryStick,
  gpu: MonitorPlay,
  storage: HardDrive,
  psu: Power,
  case: Box,
  cooler: Fan,
};

const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4" },
  md: { box: "h-12 w-12", icon: "h-5 w-5" },
  lg: { box: "h-16 w-16", icon: "h-7 w-7" },
} as const;

interface Props {
  category: PartCategory;
  src?: string;
  alt?: string;
  size?: keyof typeof SIZES;
  /** part specs — enables the 3D spin view */
  part?: Part;
}

export function PartThumb({ category, src, alt, size = "sm", part }: Props) {
  const [failed, setFailed] = useState(false);
  const [show3d, setShow3d] = useState(false);
  const Icon = ICONS[category];
  const s = SIZES[size];
  const showImg = !!src && !failed;

  const content = show3d ? (
    <ClientOnly fallback={<Icon className={`${s.icon} text-muted-foreground animate-pulse`} />}>
      <Suspense fallback={<Icon className={`${s.icon} text-muted-foreground animate-pulse`} />}>
        <PartModelViewer part={part} category={category} static />
      </Suspense>
    </ClientOnly>
  ) : showImg ? (
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain bg-white"
      loading="lazy"
    />
  ) : (
    <Icon className={`${s.icon} text-muted-foreground`} />
  );

  return (
    <div
      className={`${s.box} group relative shrink-0 rounded-md border border-border bg-surface overflow-hidden flex items-center justify-center`}
    >
      {content}
      <button
        type="button"
        onClick={() => setShow3d((v) => !v)}
        aria-label={show3d ? "Show photo" : "Show 3D model"}
        title={show3d ? "Show photo" : "Show 3D model"}
        className={`absolute bottom-0 right-0 rounded-tl-md bg-background/80 p-0.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-primary ${show3d ? "opacity-100 text-primary" : ""}`}
      >
        <Rotate3d className="h-3 w-3" />
      </button>
    </div>
  );
}
