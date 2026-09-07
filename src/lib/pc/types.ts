export type PartCategory =
  | "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "storage"
  | "psu"
  | "case"
  | "cooler";

export const CATEGORY_LABEL: Record<PartCategory, string> = {
  cpu: "CPU",
  motherboard: "Motherboard",
  ram: "Memory",
  gpu: "GPU",
  storage: "Storage",
  psu: "Power supply",
  case: "Case",
  cooler: "CPU cooler",
};

export const CATEGORY_ORDER: PartCategory[] = [
  "cpu",
  "cooler",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "psu",
  "case",
];

export type FormFactor = "ATX" | "Micro-ATX" | "Mini-ITX" | "E-ATX";
export type RamType = "DDR3" | "DDR4" | "DDR5";
export type StorageInterface = "M.2 NVMe" | "M.2 SATA" | "SATA" | "PCIe";

export interface BasePart {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  category: PartCategory;
  notes?: string;
  asin?: string;
  priceUpdatedAt?: number;
  imageUrl?: string;
  /** 'catalog' = admin-curated shared part, 'private' = user's own part */
  visibility?: "catalog" | "private";
  /** true when this part's price/link comes from the signed-in user's own override */
  hasOverride?: boolean;

}



export interface CpuPart extends BasePart {
  category: "cpu";
  socket: string;
  tdp: number;
  ramType: RamType;
  maxRamSpeed: number; // MT/s official
  memoryChannels: number; // 2 or 4
  integratedGraphics: boolean;
  cores?: number;
  boostClock?: number;
}

export interface MotherboardPart extends BasePart {
  category: "motherboard";
  socket: string;
  chipset?: string;
  formFactor: FormFactor;
  ramType: RamType;
  ramSlots: number;
  maxRamSpeed: number;
  memoryChannels: number;
  m2Slots: number;
  sataPorts: number;
  pcieX16Slots: number;
  eps8Pin: number; // number of EPS/CPU 8-pin connectors on the board
}

export interface RamPart extends BasePart {
  category: "ram";
  ramType: RamType;
  speed: number;
  sizeGb: number; // per stick
  sticks: number; // 1, 2, 4
}

export interface GpuPart extends BasePart {
  category: "gpu";
  lengthMm: number;
  tdp: number;
  pcieConnectors: { pin8: number; pin6: number; pin12vhpwr: number };
}

export interface StoragePart extends BasePart {
  category: "storage";
  interface: StorageInterface;
  sizeGb: number;
}

export interface PsuPart extends BasePart {
  category: "psu";
  wattage: number;
  formFactor: "ATX" | "SFX" | "SFX-L";
  efficiency?: string;
  pcie8Pin: number;
  eps8Pin: number;
  pcie12vhpwr: number;
  modular?: "Full" | "Semi" | "None";
}

export interface CasePart extends BasePart {
  category: "case";
  supportedFormFactors: FormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  psuFormFactors: ("ATX" | "SFX" | "SFX-L")[];
  radiatorSupport?: string;
}

export interface CoolerPart extends BasePart {
  category: "cooler";
  supportedSockets: string[];
  heightMm: number; // 0 for AIO
  tdpRating: number;
  type: "Air" | "AIO";
  radiatorMm?: number;
}

export type Part =
  | CpuPart
  | MotherboardPart
  | RamPart
  | GpuPart
  | StoragePart
  | PsuPart
  | CasePart
  | CoolerPart;

export interface Build {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  parts: {
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

export type IssueLevel = "error" | "warning" | "info";

export interface CompatIssue {
  id: string;
  level: IssueLevel;
  category: PartCategory | "system";
  title: string;
  detail: string;
}
