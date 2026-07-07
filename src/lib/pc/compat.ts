import type {
  Build,
  CompatIssue,
  CasePart,
  CoolerPart,
  CpuPart,
  GpuPart,
  MotherboardPart,
  Part,
  PsuPart,
  RamPart,
  StoragePart,
} from "./types";

export interface ResolvedBuild {
  cpu?: CpuPart;
  cooler?: CoolerPart;
  motherboard?: MotherboardPart;
  ram: RamPart[];
  gpu?: GpuPart;
  storage: StoragePart[];
  psu?: PsuPart;
  case?: CasePart;
}

export function resolveBuild(build: Build, parts: Part[]): ResolvedBuild {
  const byId = new Map(parts.map((p) => [p.id, p]));
  const one = <T extends Part>(id?: string) => (id ? (byId.get(id) as T | undefined) : undefined);
  const many = <T extends Part>(ids?: string[]) =>
    (ids ?? []).map((id) => byId.get(id) as T | undefined).filter(Boolean) as T[];
  return {
    cpu: one<CpuPart>(build.parts.cpu),
    cooler: one<CoolerPart>(build.parts.cooler),
    motherboard: one<MotherboardPart>(build.parts.motherboard),
    ram: many<RamPart>(build.parts.ram),
    gpu: one<GpuPart>(build.parts.gpu),
    storage: many<StoragePart>(build.parts.storage),
    psu: one<PsuPart>(build.parts.psu),
    case: one<CasePart>(build.parts.case),
  };
}

let counter = 0;
const iss = (
  level: CompatIssue["level"],
  category: CompatIssue["category"],
  title: string,
  detail: string,
): CompatIssue => ({ id: `i${++counter}`, level, category, title, detail });

export function analyze(r: ResolvedBuild): CompatIssue[] {
  counter = 0;
  const out: CompatIssue[] = [];
  const { cpu, cooler, motherboard, ram, gpu, storage, psu, case: box } = r;

  /* --- CPU ↔ Motherboard socket --- */
  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    out.push(
      iss(
        "error",
        "motherboard",
        "CPU socket mismatch",
        `CPU uses ${cpu.socket} but motherboard is ${motherboard.socket}.`,
      ),
    );
  }

  /* --- Cooler socket / height / TDP --- */
  if (cpu && cooler && !cooler.supportedSockets.includes(cpu.socket)) {
    out.push(
      iss(
        "error",
        "cooler",
        "Cooler socket unsupported",
        `${cooler.name} does not list ${cpu.socket} as a supported socket.`,
      ),
    );
  }
  if (cpu && cooler && cooler.tdpRating > 0 && cooler.tdpRating < cpu.tdp) {
    out.push(
      iss(
        "warning",
        "cooler",
        "Cooler under CPU TDP",
        `Cooler rated ${cooler.tdpRating} W vs CPU ${cpu.tdp} W — expect thermal throttling.`,
      ),
    );
  }
  if (cooler && box && cooler.type === "Air" && cooler.heightMm > box.maxCoolerHeightMm) {
    out.push(
      iss(
        "error",
        "cooler",
        "Cooler too tall for case",
        `${cooler.name} is ${cooler.heightMm} mm; case allows ${box.maxCoolerHeightMm} mm.`,
      ),
    );
  }

  /* --- Motherboard ↔ RAM type/speed/slots/channels --- */
  if (motherboard && ram.length) {
    const wrongType = ram.filter((r) => r.ramType !== motherboard.ramType);
    if (wrongType.length) {
      out.push(
        iss(
          "error",
          "ram",
          "RAM type mismatch",
          `Motherboard needs ${motherboard.ramType}; kit is ${wrongType[0].ramType}.`,
        ),
      );
    }
    const sticks = ram.reduce((s, r) => s + r.sticks, 0);
    if (sticks > motherboard.ramSlots) {
      out.push(
        iss(
          "error",
          "ram",
          "Too many DIMMs",
          `Build uses ${sticks} sticks but motherboard has ${motherboard.ramSlots} slots.`,
        ),
      );
    }
    const fastest = Math.max(...ram.map((r) => r.speed));
    if (fastest > motherboard.maxRamSpeed) {
      out.push(
        iss(
          "warning",
          "ram",
          "RAM above board JEDEC",
          `Kit rated ${fastest} MT/s; board officially supports ${motherboard.maxRamSpeed}. Will run at lower speed without XMP/EXPO tuning.`,
        ),
      );
    }
    if (cpu && fastest > cpu.maxRamSpeed) {
      out.push(
        iss(
          "info",
          "ram",
          "RAM above CPU rated speed",
          `Kit is ${fastest} MT/s; CPU official max is ${cpu.maxRamSpeed}. Overclock territory.`,
        ),
      );
    }
    if (sticks === 1 && motherboard.memoryChannels >= 2) {
      out.push(
        iss(
          "warning",
          "ram",
          "Single-channel memory",
          `Only one DIMM installed on a ${motherboard.memoryChannels}-channel platform — performance loss.`,
        ),
      );
    }
  }
  if (cpu && ram.length) {
    const wrong = ram.some((r) => r.ramType !== cpu.ramType);
    if (wrong) {
      out.push(
        iss(
          "error",
          "ram",
          "RAM type incompatible with CPU",
          `CPU expects ${cpu.ramType}.`,
        ),
      );
    }
  }

  /* --- Case ↔ Motherboard form factor --- */
  if (motherboard && box && !box.supportedFormFactors.includes(motherboard.formFactor)) {
    out.push(
      iss(
        "error",
        "case",
        "Motherboard won't fit case",
        `Case supports ${box.supportedFormFactors.join(", ")} but board is ${motherboard.formFactor}.`,
      ),
    );
  }

  /* --- Case ↔ GPU length --- */
  if (gpu && box && gpu.lengthMm > box.maxGpuLengthMm) {
    out.push(
      iss(
        "error",
        "case",
        "GPU too long for case",
        `GPU is ${gpu.lengthMm} mm; case fits ${box.maxGpuLengthMm} mm.`,
      ),
    );
  }

  /* --- Case ↔ PSU form factor --- */
  if (psu && box && !box.psuFormFactors.includes(psu.formFactor)) {
    out.push(
      iss(
        "error",
        "case",
        "PSU form factor mismatch",
        `Case accepts ${box.psuFormFactors.join(", ")}; PSU is ${psu.formFactor}.`,
      ),
    );
  }

  /* --- Storage slot counts --- */
  if (motherboard) {
    const m2 = storage.filter((s) => s.interface.startsWith("M.2")).length;
    const sata = storage.filter((s) => s.interface === "SATA").length;
    if (m2 > motherboard.m2Slots) {
      out.push(
        iss(
          "error",
          "storage",
          "Not enough M.2 slots",
          `Build uses ${m2} M.2 drives; board has ${motherboard.m2Slots}.`,
        ),
      );
    }
    if (sata > motherboard.sataPorts) {
      out.push(
        iss(
          "error",
          "storage",
          "Not enough SATA ports",
          `Build uses ${sata} SATA drives; board has ${motherboard.sataPorts}.`,
        ),
      );
    }
  }

  /* --- PSU wattage & connectors --- */
  const est = estimateWattage(r);
  if (psu) {
    if (psu.wattage < est.total) {
      out.push(
        iss(
          "error",
          "psu",
          "Power supply undersized",
          `Estimated draw ${est.total} W exceeds PSU ${psu.wattage} W.`,
        ),
      );
    } else if (psu.wattage < est.recommended) {
      out.push(
        iss(
          "warning",
          "psu",
          "PSU below recommended headroom",
          `Estimated peak ${est.total} W. Recommend ~${est.recommended} W PSU for headroom & efficiency.`,
        ),
      );
    }

    // GPU PCIe connectors
    if (gpu) {
      const need = gpu.pcieConnectors;
      const have = { pin8: psu.pcie8Pin, pin6: psu.pcie8Pin, pin12: psu.pcie12vhpwr };
      if (need.pin12vhpwr > have.pin12 && psu.pcie8Pin < need.pin12vhpwr * 3) {
        out.push(
          iss(
            "error",
            "psu",
            "Missing 12VHPWR connector",
            `GPU needs a 12VHPWR/16-pin connector (or 3× 8-pin adapter).`,
          ),
        );
      }
      if (need.pin8 > psu.pcie8Pin) {
        out.push(
          iss(
            "error",
            "psu",
            "Not enough PCIe 8-pin cables",
            `GPU needs ${need.pin8}× PCIe 8-pin; PSU has ${psu.pcie8Pin}.`,
          ),
        );
      }
    }
    if (motherboard && motherboard.eps8Pin > psu.eps8Pin) {
      out.push(
        iss(
          "warning",
          "psu",
          "EPS connectors under board spec",
          `Board has ${motherboard.eps8Pin}× EPS8-pin; PSU provides ${psu.eps8Pin}. One EPS is usually enough for stock loads.`,
        ),
      );
    }
  }

  /* --- Missing critical parts --- */
  const missing: [keyof Build["parts"], string][] = [
    ["cpu", "CPU"],
    ["motherboard", "Motherboard"],
    ["ram", "RAM"],
    ["psu", "Power supply"],
    ["case", "Case"],
  ];
  missing.forEach(([k, label]) => {
    const v = (r as any)[k];
    const empty = Array.isArray(v) ? v.length === 0 : !v;
    if (empty) {
      out.push(iss("info", "system", `${label} not selected`, `Pick a ${label.toLowerCase()} to complete the build.`));
    }
  });
  if (cpu && !cpu.integratedGraphics && !gpu) {
    out.push(
      iss(
        "error",
        "gpu",
        "No graphics output",
        `CPU has no integrated graphics — a discrete GPU is required.`,
      ),
    );
  }
  if (!cooler && cpu) {
    out.push(iss("info", "cooler", "No CPU cooler selected", "Some CPUs ship with a stock cooler; otherwise add one."));
  }

  return out;
}

export interface Wattage {
  cpu: number;
  gpu: number;
  other: number;
  total: number;
  recommended: number;
}

export function estimateWattage(r: ResolvedBuild): Wattage {
  const cpu = r.cpu?.tdp ?? 0;
  const gpu = r.gpu?.tdp ?? 0;
  const ram = r.ram.reduce((s, k) => s + k.sticks * 4, 0);
  const storage = r.storage.length * 8;
  const fans = 15;
  const board = 25;
  const other = ram + storage + fans + board;
  const total = Math.round(cpu + gpu + other);
  const recommended = Math.max(450, Math.ceil((total * 1.4) / 50) * 50);
  return { cpu, gpu, other, total, recommended };
}

export function estimatePrice(r: ResolvedBuild): number {
  const items: (Part | undefined)[] = [
    r.cpu,
    r.cooler,
    r.motherboard,
    r.gpu,
    r.psu,
    r.case,
    ...r.ram,
    ...r.storage,
  ];
  return items.reduce((s, p) => s + (p?.price ?? 0), 0);
}

/* --- rough performance tier --- */
export function performanceTier(r: ResolvedBuild): { tier: string; score: number } {
  const cpuScore = r.cpu ? Math.min(100, r.cpu.tdp * 0.5 + (r.cpu.cores ?? 0) * 3) : 0;
  const gpuScore = r.gpu ? Math.min(100, r.gpu.tdp * 0.35) : 0;
  const ramGb = r.ram.reduce((s, k) => s + k.sizeGb * k.sticks, 0);
  const ramScore = Math.min(100, ramGb * 2);
  const score = Math.round(cpuScore * 0.35 + gpuScore * 0.5 + ramScore * 0.15);
  const tier =
    score >= 80
      ? "Enthusiast"
      : score >= 60
      ? "High-end"
      : score >= 40
      ? "Mid-range"
      : score >= 20
      ? "Entry"
      : "Incomplete";
  return { tier, score };
}
