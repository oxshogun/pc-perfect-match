import type { Part } from "@/lib/pc/types";

export function partSummary(p: Part): string {
  switch (p.category) {
    case "cpu":
      return `${p.socket} · ${p.tdp}W · ${p.ramType} up to ${p.maxRamSpeed} · ${p.cores ?? "?"}C${p.integratedGraphics ? " · iGPU" : ""}`;
    case "motherboard":
      return `${p.socket} · ${p.formFactor} · ${p.ramType} ${p.ramSlots}× up to ${p.maxRamSpeed} · M.2 ${p.m2Slots} · SATA ${p.sataPorts}`;
    case "ram":
      return `${p.sticks}×${p.sizeGb}GB ${p.ramType}-${p.speed}`;
    case "gpu": {
      const c = p.pcieConnectors;
      const conn = [
        c.pin12vhpwr && `${c.pin12vhpwr}×12VHPWR`,
        c.pin8 && `${c.pin8}×8-pin`,
        c.pin6 && `${c.pin6}×6-pin`,
      ]
        .filter(Boolean)
        .join(" + ") || "no aux power";
      return `${p.lengthMm}mm · ${p.tdp}W · ${conn}`;
    }
    case "storage":
      return `${p.sizeGb >= 1000 ? `${(p.sizeGb / 1000).toFixed(p.sizeGb % 1000 ? 1 : 0)}TB` : `${p.sizeGb}GB`} · ${p.interface}`;
    case "psu":
      return `${p.wattage}W · ${p.formFactor} · ${p.efficiency ?? ""} · PCIe ${p.pcie8Pin}×8-pin${p.pcie12vhpwr ? ` + ${p.pcie12vhpwr}×12VHPWR` : ""} · EPS ${p.eps8Pin}`;
    case "case":
      return `${p.supportedFormFactors.join("/")} · GPU ≤${p.maxGpuLengthMm}mm · cooler ≤${p.maxCoolerHeightMm}mm`;
    case "cooler":
      return `${p.type}${p.radiatorMm ? ` ${p.radiatorMm}mm` : ""} · ≤${p.tdpRating}W · ${p.heightMm}mm tall · ${p.supportedSockets.join("/")}`;
  }
}
