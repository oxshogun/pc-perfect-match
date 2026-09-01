import { AlertTriangle, Info, X } from "lucide-react";
import type { ResolvedBuild } from "@/lib/pc/compat";
import { CATEGORY_DESCRIPTION } from "@/lib/pc/guide";
import { CATEGORY_LABEL, type CompatIssue, type PartCategory } from "@/lib/pc/types";

const CONNECTIONS: Record<PartCategory, string> = {
  cpu: "Drops into the motherboard socket; cooled by the CPU cooler and powered by the PSU's EPS 8-pin cable.",
  cooler: "Clamps onto the CPU socket; an AIO's radiator bolts to the case roof or front and its fans plug into the board.",
  motherboard: "Screws to the case tray and links CPU, RAM, GPU, storage and the PSU's 24-pin.",
  ram: "Slots into the board's DIMM slots — populate matching channels for full bandwidth.",
  gpu: "Rides in the top PCIe x16 slot, bracket at the rear panel, fed by PCIe / 12VHPWR cables from the PSU.",
  storage: "M.2 drives sit on the board under a heatsink; SATA drives mount in the tray and use a board SATA port plus a PSU cable.",
  psu: "Sits in the basement and powers the board, CPU and GPU; must fit the case's PSU form factor.",
  case: "Houses everything — its clearances cap GPU length, cooler height and radiator size.",
};

function specs(cat: PartCategory, r: ResolvedBuild): string[] {
  switch (cat) {
    case "cpu":
      return r.cpu
        ? [`Socket ${r.cpu.socket}`, `${r.cpu.tdp} W TDP`, `${r.cpu.ramType} up to ${r.cpu.maxRamSpeed} MT/s`]
        : [];
    case "cooler":
      return r.cooler
        ? [
            r.cooler.type === "AIO" ? `${r.cooler.radiatorMm ?? 240} mm radiator` : `${r.cooler.heightMm} mm tall`,
            `${r.cooler.tdpRating} W rating`,
            `Sockets: ${r.cooler.supportedSockets.join(", ")}`,
          ]
        : [];
    case "motherboard":
      return r.motherboard
        ? [
            `${r.motherboard.formFactor} · ${r.motherboard.socket}`,
            `${r.motherboard.ramSlots} DIMM · ${r.motherboard.ramType}`,
            `${r.motherboard.m2Slots} M.2 · ${r.motherboard.sataPorts} SATA`,
          ]
        : [];
    case "ram":
      return r.ram[0]
        ? [
            `${r.ram[0].sticks} × ${r.ram[0].sizeGb} GB`,
            `${r.ram[0].ramType} ${r.ram[0].speed} MT/s`,
          ]
        : [];
    case "gpu":
      return r.gpu
        ? [
            `${r.gpu.lengthMm} mm long`,
            `${r.gpu.tdp} W TDP`,
            `Power: ${r.gpu.pcieConnectors.pin12vhpwr ? "12VHPWR" : `${r.gpu.pcieConnectors.pin8}× 8-pin`}`,
          ]
        : [];
    case "storage":
      return r.storage.length
        ? r.storage.map((s) => `${s.name} — ${s.interface}, ${s.sizeGb} GB`)
        : [];
    case "psu":
      return r.psu
        ? [`${r.psu.wattage} W`, `${r.psu.formFactor}${r.psu.efficiency ? ` · ${r.psu.efficiency}` : ""}`, `${r.psu.modular ?? "Full"} modular`]
        : [];
    case "case":
      return r.case
        ? [
            r.case.supportedFormFactors.join(", "),
            `GPU ≤ ${r.case.maxGpuLengthMm} mm`,
            `Cooler ≤ ${r.case.maxCoolerHeightMm} mm`,
          ]
        : [];
  }
}

export function PartDetailsCard({
  category,
  resolved,
  issues = [],
  onClose,
  className = "",
}: {
  category: PartCategory;
  resolved: ResolvedBuild;
  issues?: CompatIssue[];
  onClose: () => void;
  className?: string;
}) {
  const part =
    category === "ram"
      ? resolved.ram[0]
      : category === "storage"
        ? resolved.storage[0]
        : (resolved[category] as { name: string; brand?: string; price?: number } | undefined);
  const mine = issues.filter((i) => i.category === category);
  const rows = specs(category, resolved);

  return (
    <div
      className={`rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur ${className}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
            {CATEGORY_LABEL[category]}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            {part?.name ?? "Not selected"}
          </p>
          {part && (
            <p className="font-mono text-[10px] text-muted-foreground">
              {[part.brand, part.price != null ? `$${part.price.toFixed(2)}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close part details"
          className="ml-auto rounded p-1 text-muted-foreground hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {CATEGORY_DESCRIPTION[category]}
      </p>

      {rows.length > 0 && (
        <ul className="mt-2 space-y-0.5 font-mono text-[10px] text-foreground/80">
          {rows.map((s) => (
            <li key={s} className="truncate">
              · {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-1.5 rounded-md border border-border/70 bg-surface p-2 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
        <span>{CONNECTIONS[category]}</span>
      </div>

      {mine.length > 0 && (
        <ul className="mt-2 space-y-1">
          {mine.map((i) => (
            <li
              key={i.id}
              className={`flex gap-1.5 rounded-md border p-2 text-[11px] leading-relaxed ${
                i.level === "error"
                  ? "border-destructive/50 text-destructive"
                  : "border-border text-muted-foreground"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                <strong className="font-semibold">{i.title}</strong> — {i.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
