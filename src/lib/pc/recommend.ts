import type {
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
import { analyze, estimatePrice, estimateWattage, performanceTier, type ResolvedBuild } from "./compat";

const priceOf = (p?: Part) => p?.price ?? 0;
const byPrice = <T extends Part>(a: T, b: T) => priceOf(a) - priceOf(b);

function pick<T extends Part>(parts: Part[], cat: T["category"]): T[] {
  return parts.filter((p) => p.category === cat && (p.price ?? 0) > 0) as T[];
}

function cheapest<T extends Part>(list: T[], ok: (p: T) => boolean): T | undefined {
  return list.filter(ok).sort(byPrice)[0];
}

export interface Recommendation {
  resolved: ResolvedBuild;
  price: number;
  watts: ReturnType<typeof estimateWattage>;
  tier: ReturnType<typeof performanceTier>;
  /** part ids in the shape a Build expects */
  buildParts: {
    cpu?: string;
    cooler?: string;
    motherboard?: string;
    ram?: string[];
    gpu?: string;
    storage?: string[];
    psu?: string;
    case?: string;
  };
}

/**
 * Greedy search: for each affordable CPU/GPU pair, fill the remaining
 * categories with the cheapest compatible option, then keep the
 * highest-scoring build that lands inside the budget.
 */
export function recommendBuild(
  parts: Part[],
  min: number,
  max: number,
): Recommendation | null {
  const cpus = pick<CpuPart>(parts, "cpu");
  const gpus = pick<GpuPart>(parts, "gpu");
  const boards = pick<MotherboardPart>(parts, "motherboard");
  const rams = pick<RamPart>(parts, "ram");
  const coolers = pick<CoolerPart>(parts, "cooler");
  const drives = pick<StoragePart>(parts, "storage");
  const psus = pick<PsuPart>(parts, "psu");
  const cases = pick<CasePart>(parts, "case");

  // limit the search space: strongest few dozen candidates by price
  const cpuPool = [...cpus].sort(byPrice).reverse().slice(0, 24);
  const gpuPool = [...gpus].sort(byPrice).reverse().slice(0, 24);

  let best: Recommendation | null = null;

  for (const cpu of cpuPool) {
    if (priceOf(cpu) > max * 0.45) continue;
    for (const gpu of gpuPool) {
      if (priceOf(cpu) + priceOf(gpu) > max * 0.8) continue;

      const motherboard = cheapest(boards, (b) => b.socket === cpu.socket && b.ramType === cpu.ramType);
      if (!motherboard) continue;

      const ram = cheapest(
        rams.filter((r) => r.ramType === cpu.ramType && r.sticks <= motherboard.ramSlots && r.sizeGb * r.sticks >= 16),
        () => true,
      );
      if (!ram) continue;

      const cooler = cheapest(
        coolers,
        (c) => c.supportedSockets.includes(cpu.socket) && c.tdpRating >= cpu.tdp,
      );
      if (!cooler) continue;

      const storage = cheapest(drives, (d) => d.sizeGb >= 500);
      if (!storage) continue;

      const draft: ResolvedBuild = {
        cpu,
        gpu,
        motherboard,
        cooler,
        ram: [ram],
        storage: [storage],
      };
      const need = estimateWattage(draft).recommended;
      const psu = cheapest(
        psus,
        (p) =>
          p.wattage >= need &&
          p.eps8Pin >= motherboard.eps8Pin &&
          (gpu.pcieConnectors.pin12vhpwr === 0 || p.pcie12vhpwr >= gpu.pcieConnectors.pin12vhpwr) &&
          p.pcie8Pin >= gpu.pcieConnectors.pin8,
      );
      if (!psu) continue;

      const box = cheapest(
        cases,
        (c) =>
          c.supportedFormFactors.includes(motherboard.formFactor) &&
          c.maxGpuLengthMm >= gpu.lengthMm &&
          c.maxCoolerHeightMm >= (cooler.type === "AIO" ? 0 : cooler.heightMm) &&
          c.psuFormFactors.includes(psu.formFactor),
      );
      if (!box) continue;

      const resolved: ResolvedBuild = { ...draft, psu, case: box };
      const price = estimatePrice(resolved);
      if (price > max) continue;
      if (analyze(resolved).some((i) => i.level === "error")) continue;

      const tier = performanceTier(resolved);
      const inRange = price >= min;
      const bestInRange = best ? best.price >= min : false;
      const better =
        !best ||
        (inRange && !bestInRange) ||
        (inRange === bestInRange &&
          (tier.score > best.tier.score || (tier.score === best.tier.score && price < best.price)));
      if (!better) continue;

      best = {
        resolved,
        price,
        watts: estimateWattage(resolved),
        tier,
        buildParts: {
          cpu: cpu.id,
          cooler: cooler.id,
          motherboard: motherboard.id,
          ram: [ram.id],
          gpu: gpu.id,
          storage: [storage.id],
          psu: psu.id,
          case: box.id,
        },
      };
    }
  }

  return best;
}
