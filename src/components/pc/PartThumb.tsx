import { useState } from "react";
import { Cpu, HardDrive, MemoryStick, Power, Box, Fan, MonitorPlay, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PartCategory } from "@/lib/pc/types";

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
}

export function PartThumb({ category, src, alt, size = "sm" }: Props) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[category];
  const s = SIZES[size];
  const showImg = !!src && !failed;
  return (
    <div
      className={`${s.box} shrink-0 rounded-md border border-border bg-surface overflow-hidden flex items-center justify-center`}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain bg-white"
          loading="lazy"
        />
      ) : (
        <Icon className={`${s.icon} text-muted-foreground`} />
      )}
    </div>
  );
}
