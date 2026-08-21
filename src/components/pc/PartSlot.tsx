import { CATEGORY_LABEL, type Part, type PartCategory } from "@/lib/pc/types";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, MemoryStick, Power, Box, Fan, MonitorPlay, Wrench, Plus, X } from "lucide-react";
import { partSummary } from "./partSummary";
import { PartThumb } from "./PartThumb";
import type { LucideIcon } from "lucide-react";

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

interface Props {
  category: PartCategory;
  parts: Part[]; // resolved (0 or more)
  onAdd: () => void;
  onRemove: (id: string) => void;
  multiple?: boolean;
}

export function PartSlot({ category, parts, onAdd, onRemove, multiple }: Props) {
  const Icon = ICONS[category];
  const empty = parts.length === 0;
  const canAdd = multiple || empty;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {CATEGORY_LABEL[category]}
          {multiple && parts.length > 0 && (
            <span className="text-primary ml-2">×{parts.length}</span>
          )}
        </span>
        <div className="ml-auto">
          {canAdd && (
            <Button size="sm" variant="ghost" onClick={onAdd} className="h-7 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> {empty ? "Select" : "Add another"}
            </Button>
          )}
        </div>
      </div>

      {empty ? (
        <button
          onClick={onAdd}
          className="w-full text-left px-4 py-4 text-sm text-muted-foreground italic hover:bg-surface transition"
        >
          — no {CATEGORY_LABEL[category].toLowerCase()} selected —
        </button>
      ) : (
        <ul className="divide-y divide-border">
          {parts.map((p) => (
            <li key={p.id} className="flex items-start gap-3 px-4 py-3">
              <PartThumb category={p.category} src={p.imageUrl} alt={p.name} size="md" part={p} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.brand && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {p.brand}
                    </span>
                  )}
                  <span className="font-medium text-foreground truncate">{p.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono truncate">
                  {partSummary(p)}
                </p>
              </div>
              {p.price != null && (
                <span className="font-mono text-sm text-primary shrink-0">${p.price}</span>
              )}
              <button
                onClick={() => onRemove(p.id)}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
