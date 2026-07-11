import type { Part } from "./types";

// Broad starter catalog covering popular name-brand parts across current
// and recent generations. Not exhaustive (impossible), but wide enough that
// most users can pick real parts instead of typing everything.
// Users can freely add / edit / delete these.

// ============================== CPUs ==============================
const CPUS: Part[] = [
  // AMD AM5 (Ryzen 7000/9000)
  { id: "cpu-amd-9950x3d", category: "cpu", name: "Ryzen 9 9950X3D", brand: "AMD", price: 699, socket: "AM5", tdp: 170, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 16, boostClock: 5.7 },
  { id: "cpu-amd-9950x", category: "cpu", name: "Ryzen 9 9950X", brand: "AMD", price: 649, socket: "AM5", tdp: 170, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 16, boostClock: 5.7 },
  { id: "cpu-amd-9900x", category: "cpu", name: "Ryzen 9 9900X", brand: "AMD", price: 499, socket: "AM5", tdp: 120, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 12, boostClock: 5.6 },
  { id: "cpu-amd-9800x3d", category: "cpu", name: "Ryzen 7 9800X3D", brand: "AMD", price: 479, socket: "AM5", tdp: 120, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.2 },
  { id: "cpu-amd-9700x", category: "cpu", name: "Ryzen 7 9700X", brand: "AMD", price: 359, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.5 },
  { id: "cpu-amd-9600x", category: "cpu", name: "Ryzen 5 9600X", brand: "AMD", price: 279, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 6, boostClock: 5.4 },
  { id: "cpu-amd-7950x3d", category: "cpu", name: "Ryzen 9 7950X3D", brand: "AMD", price: 599, socket: "AM5", tdp: 120, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 16, boostClock: 5.7 },
  { id: "cpu-amd-7950x", category: "cpu", name: "Ryzen 9 7950X", brand: "AMD", price: 549, socket: "AM5", tdp: 170, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 16, boostClock: 5.7 },
  { id: "cpu-amd-7900x", category: "cpu", name: "Ryzen 9 7900X", brand: "AMD", price: 429, socket: "AM5", tdp: 170, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 12, boostClock: 5.6 },
  { id: "cpu-amd-7800x3d", category: "cpu", name: "Ryzen 7 7800X3D", brand: "AMD", price: 379, socket: "AM5", tdp: 120, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.0 },
  { id: "cpu-amd-7700x", category: "cpu", name: "Ryzen 7 7700X", brand: "AMD", price: 329, socket: "AM5", tdp: 105, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.4 },
  { id: "cpu-amd-7700", category: "cpu", name: "Ryzen 7 7700", brand: "AMD", price: 289, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.3 },
  { id: "cpu-amd-7600x", category: "cpu", name: "Ryzen 5 7600X", brand: "AMD", price: 249, socket: "AM5", tdp: 105, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 6, boostClock: 5.3 },
  { id: "cpu-amd-7600", category: "cpu", name: "Ryzen 5 7600", brand: "AMD", price: 219, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 6, boostClock: 5.1 },
  { id: "cpu-amd-8700g", category: "cpu", name: "Ryzen 7 8700G", brand: "AMD", price: 329, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 8, boostClock: 5.1 },
  { id: "cpu-amd-8600g", category: "cpu", name: "Ryzen 5 8600G", brand: "AMD", price: 229, socket: "AM5", tdp: 65, ramType: "DDR5", maxRamSpeed: 5200, memoryChannels: 2, integratedGraphics: true, cores: 6, boostClock: 5.0 },

  // AMD AM4 (Ryzen 5000)
  { id: "cpu-amd-5800x3d", category: "cpu", name: "Ryzen 7 5800X3D", brand: "AMD", price: 299, socket: "AM4", tdp: 105, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 8, boostClock: 4.5 },
  { id: "cpu-amd-5700x3d", category: "cpu", name: "Ryzen 7 5700X3D", brand: "AMD", price: 229, socket: "AM4", tdp: 105, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 8, boostClock: 4.1 },
  { id: "cpu-amd-5900x", category: "cpu", name: "Ryzen 9 5900X", brand: "AMD", price: 329, socket: "AM4", tdp: 105, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 12, boostClock: 4.8 },
  { id: "cpu-amd-5800x", category: "cpu", name: "Ryzen 7 5800X", brand: "AMD", price: 219, socket: "AM4", tdp: 105, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 8, boostClock: 4.7 },
  { id: "cpu-amd-5700x", category: "cpu", name: "Ryzen 7 5700X", brand: "AMD", price: 169, socket: "AM4", tdp: 65, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 8, boostClock: 4.6 },
  { id: "cpu-amd-5600x", category: "cpu", name: "Ryzen 5 5600X", brand: "AMD", price: 159, socket: "AM4", tdp: 65, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 6, boostClock: 4.6 },
  { id: "cpu-amd-5600", category: "cpu", name: "Ryzen 5 5600", brand: "AMD", price: 129, socket: "AM4", tdp: 65, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 6, boostClock: 4.4 },

  // Intel LGA1851 (Core Ultra series 2 / Arrow Lake)
  { id: "cpu-intel-u9-285k", category: "cpu", name: "Core Ultra 9 285K", brand: "Intel", price: 589, socket: "LGA1851", tdp: 250, ramType: "DDR5", maxRamSpeed: 6400, memoryChannels: 2, integratedGraphics: true, cores: 24, boostClock: 5.7 },
  { id: "cpu-intel-u7-265k", category: "cpu", name: "Core Ultra 7 265K", brand: "Intel", price: 399, socket: "LGA1851", tdp: 250, ramType: "DDR5", maxRamSpeed: 6400, memoryChannels: 2, integratedGraphics: true, cores: 20, boostClock: 5.5 },
  { id: "cpu-intel-u5-245k", category: "cpu", name: "Core Ultra 5 245K", brand: "Intel", price: 309, socket: "LGA1851", tdp: 159, ramType: "DDR5", maxRamSpeed: 6400, memoryChannels: 2, integratedGraphics: true, cores: 14, boostClock: 5.2 },

  // Intel LGA1700 (12th/13th/14th gen)
  { id: "cpu-intel-14900k", category: "cpu", name: "Core i9-14900K", brand: "Intel", price: 549, socket: "LGA1700", tdp: 253, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 24, boostClock: 6.0 },
  { id: "cpu-intel-14700k", category: "cpu", name: "Core i7-14700K", brand: "Intel", price: 399, socket: "LGA1700", tdp: 253, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 20, boostClock: 5.6 },
  { id: "cpu-intel-14600k", category: "cpu", name: "Core i5-14600K", brand: "Intel", price: 319, socket: "LGA1700", tdp: 181, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 14, boostClock: 5.3 },
  { id: "cpu-intel-14400f", category: "cpu", name: "Core i5-14400F", brand: "Intel", price: 199, socket: "LGA1700", tdp: 65, ramType: "DDR5", maxRamSpeed: 4800, memoryChannels: 2, integratedGraphics: false, cores: 10, boostClock: 4.7 },
  { id: "cpu-intel-13900k", category: "cpu", name: "Core i9-13900K", brand: "Intel", price: 489, socket: "LGA1700", tdp: 253, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 24, boostClock: 5.8 },
  { id: "cpu-intel-13700k", category: "cpu", name: "Core i7-13700K", brand: "Intel", price: 349, socket: "LGA1700", tdp: 253, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 16, boostClock: 5.4 },
  { id: "cpu-intel-13600k", category: "cpu", name: "Core i5-13600K", brand: "Intel", price: 279, socket: "LGA1700", tdp: 181, ramType: "DDR5", maxRamSpeed: 5600, memoryChannels: 2, integratedGraphics: true, cores: 14, boostClock: 5.1 },
  { id: "cpu-intel-12700k", category: "cpu", name: "Core i7-12700K", brand: "Intel", price: 299, socket: "LGA1700", tdp: 190, ramType: "DDR5", maxRamSpeed: 4800, memoryChannels: 2, integratedGraphics: true, cores: 12, boostClock: 5.0 },
  { id: "cpu-intel-12600k", category: "cpu", name: "Core i5-12600K", brand: "Intel", price: 229, socket: "LGA1700", tdp: 150, ramType: "DDR5", maxRamSpeed: 4800, memoryChannels: 2, integratedGraphics: true, cores: 10, boostClock: 4.9 },
  { id: "cpu-intel-12400f", category: "cpu", name: "Core i5-12400F", brand: "Intel", price: 129, socket: "LGA1700", tdp: 65, ramType: "DDR5", maxRamSpeed: 4800, memoryChannels: 2, integratedGraphics: false, cores: 6, boostClock: 4.4 },
];

// ============================== MOTHERBOARDS ==============================
const MOBOS: Part[] = [
  // AM5 - X870/X870E
  { id: "mb-asus-rog-x870e-hero", category: "motherboard", name: "ROG Crosshair X870E Hero", brand: "ASUS", price: 699, socket: "AM5", chipset: "X870E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8000, memoryChannels: 2, m2Slots: 5, sataPorts: 4, pcieX16Slots: 2, eps8Pin: 2 },
  { id: "mb-msi-x870-tomahawk", category: "motherboard", name: "MAG X870 Tomahawk WiFi", brand: "MSI", price: 329, socket: "AM5", chipset: "X870", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8000, memoryChannels: 2, m2Slots: 4, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-gb-x870e-aorus-elite", category: "motherboard", name: "X870E Aorus Elite WiFi7", brand: "Gigabyte", price: 349, socket: "AM5", chipset: "X870E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8200, memoryChannels: 2, m2Slots: 4, sataPorts: 4, pcieX16Slots: 2, eps8Pin: 2 },
  { id: "mb-asrock-x870e-taichi", category: "motherboard", name: "X870E Taichi", brand: "ASRock", price: 499, socket: "AM5", chipset: "X870E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8200, memoryChannels: 2, m2Slots: 5, sataPorts: 4, pcieX16Slots: 2, eps8Pin: 2 },
  // AM5 - B650/X670
  { id: "mb-msi-b650-tomahawk", category: "motherboard", name: "B650 Tomahawk WiFi", brand: "MSI", price: 219, socket: "AM5", chipset: "B650", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 3, sataPorts: 6, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-asus-b650e-f", category: "motherboard", name: "ROG Strix B650E-F Gaming WiFi", brand: "ASUS", price: 289, socket: "AM5", chipset: "B650E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 3, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-gb-b650-aorus-elite", category: "motherboard", name: "B650 Aorus Elite AX", brand: "Gigabyte", price: 199, socket: "AM5", chipset: "B650", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6600, memoryChannels: 2, m2Slots: 3, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-asrock-b650m-pg", category: "motherboard", name: "B650M PG Riptide", brand: "ASRock", price: 159, socket: "AM5", chipset: "B650", formFactor: "Micro-ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 2, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
  { id: "mb-asus-x670e-hero", category: "motherboard", name: "ROG Crosshair X670E Hero", brand: "ASUS", price: 629, socket: "AM5", chipset: "X670E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 5, sataPorts: 6, pcieX16Slots: 2, eps8Pin: 2 },

  // AM4 - B550/X570
  { id: "mb-msi-b550-tomahawk", category: "motherboard", name: "B550 Tomahawk MAX WiFi", brand: "MSI", price: 179, socket: "AM4", chipset: "B550", formFactor: "ATX", ramType: "DDR4", ramSlots: 4, maxRamSpeed: 5100, memoryChannels: 2, m2Slots: 2, sataPorts: 6, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-asus-b550-f", category: "motherboard", name: "ROG Strix B550-F Gaming", brand: "ASUS", price: 189, socket: "AM4", chipset: "B550", formFactor: "ATX", ramType: "DDR4", ramSlots: 4, maxRamSpeed: 4800, memoryChannels: 2, m2Slots: 2, sataPorts: 6, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-gb-x570s-aorus-elite", category: "motherboard", name: "X570S Aorus Elite AX", brand: "Gigabyte", price: 219, socket: "AM4", chipset: "X570", formFactor: "ATX", ramType: "DDR4", ramSlots: 4, maxRamSpeed: 5400, memoryChannels: 2, m2Slots: 3, sataPorts: 6, pcieX16Slots: 2, eps8Pin: 2 },

  // LGA1851 - Z890
  { id: "mb-asus-z890-hero", category: "motherboard", name: "ROG Maximus Z890 Hero", brand: "ASUS", price: 749, socket: "LGA1851", chipset: "Z890", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8800, memoryChannels: 2, m2Slots: 5, sataPorts: 4, pcieX16Slots: 2, eps8Pin: 2 },
  { id: "mb-msi-z890-tomahawk", category: "motherboard", name: "MAG Z890 Tomahawk WiFi", brand: "MSI", price: 329, socket: "LGA1851", chipset: "Z890", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8400, memoryChannels: 2, m2Slots: 4, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-gb-z890-aorus-elite", category: "motherboard", name: "Z890 Aorus Elite WiFi7", brand: "Gigabyte", price: 319, socket: "LGA1851", chipset: "Z890", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8600, memoryChannels: 2, m2Slots: 4, sataPorts: 4, pcieX16Slots: 2, eps8Pin: 2 },

  // LGA1700 - Z790/B760
  { id: "mb-asus-z790-hero", category: "motherboard", name: "ROG Maximus Z790 Hero", brand: "ASUS", price: 629, socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 8000, memoryChannels: 2, m2Slots: 5, sataPorts: 6, pcieX16Slots: 2, eps8Pin: 2 },
  { id: "mb-msi-z790-tomahawk", category: "motherboard", name: "MAG Z790 Tomahawk WiFi", brand: "MSI", price: 259, socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 7800, memoryChannels: 2, m2Slots: 4, sataPorts: 6, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-gb-z790-aorus-elite", category: "motherboard", name: "Z790 Aorus Elite AX", brand: "Gigabyte", price: 269, socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 7600, memoryChannels: 2, m2Slots: 4, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 2 },
  { id: "mb-asrock-z790-nova", category: "motherboard", name: "Z790 Taichi Lite", brand: "ASRock", price: 349, socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 7200, memoryChannels: 2, m2Slots: 5, sataPorts: 8, pcieX16Slots: 2, eps8Pin: 2 },
  { id: "mb-msi-b760-tomahawk", category: "motherboard", name: "MAG B760 Tomahawk WiFi", brand: "MSI", price: 199, socket: "LGA1700", chipset: "B760", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 7200, memoryChannels: 2, m2Slots: 3, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
  { id: "mb-asus-b760-plus", category: "motherboard", name: "TUF Gaming B760-Plus WiFi", brand: "ASUS", price: 189, socket: "LGA1700", chipset: "B760", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 7200, memoryChannels: 2, m2Slots: 3, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
];

// ============================== RAM ==============================
const RAMS: Part[] = [
  // DDR5
  { id: "ram-corsair-ven-32-6000", category: "ram", name: "Vengeance 32GB (2x16) DDR5-6000 CL30", brand: "Corsair", price: 105, ramType: "DDR5", speed: 6000, sizeGb: 16, sticks: 2 },
  { id: "ram-corsair-dom-64-6400", category: "ram", name: "Dominator Titanium 64GB (2x32) DDR5-6400", brand: "Corsair", price: 289, ramType: "DDR5", speed: 6400, sizeGb: 32, sticks: 2 },
  { id: "ram-gskill-tz-32-6000", category: "ram", name: "Trident Z5 Neo 32GB (2x16) DDR5-6000 CL30", brand: "G.Skill", price: 109, ramType: "DDR5", speed: 6000, sizeGb: 16, sticks: 2 },
  { id: "ram-gskill-tz-64-6400", category: "ram", name: "Trident Z5 RGB 64GB (2x32) DDR5-6400", brand: "G.Skill", price: 259, ramType: "DDR5", speed: 6400, sizeGb: 32, sticks: 2 },
  { id: "ram-gskill-fx-32-8000", category: "ram", name: "Trident Z5 CK 32GB (2x16) DDR5-8000", brand: "G.Skill", price: 219, ramType: "DDR5", speed: 8000, sizeGb: 16, sticks: 2 },
  { id: "ram-kingston-fury-32-6000", category: "ram", name: "Fury Beast 32GB (2x16) DDR5-6000", brand: "Kingston", price: 99, ramType: "DDR5", speed: 6000, sizeGb: 16, sticks: 2 },
  { id: "ram-kingston-renegade-32-7200", category: "ram", name: "Fury Renegade 32GB (2x16) DDR5-7200", brand: "Kingston", price: 179, ramType: "DDR5", speed: 7200, sizeGb: 16, sticks: 2 },
  { id: "ram-crucial-pro-32-5600", category: "ram", name: "Pro 32GB (2x16) DDR5-5600", brand: "Crucial", price: 89, ramType: "DDR5", speed: 5600, sizeGb: 16, sticks: 2 },
  { id: "ram-teamgroup-tf-32-6400", category: "ram", name: "T-Force Delta RGB 32GB (2x16) DDR5-6400", brand: "TeamGroup", price: 109, ramType: "DDR5", speed: 6400, sizeGb: 16, sticks: 2 },
  // DDR4
  { id: "ram-corsair-ven-32-3600", category: "ram", name: "Vengeance LPX 32GB (2x16) DDR4-3600", brand: "Corsair", price: 79, ramType: "DDR4", speed: 3600, sizeGb: 16, sticks: 2 },
  { id: "ram-gskill-rj-32-3600", category: "ram", name: "Ripjaws V 32GB (2x16) DDR4-3600 CL16", brand: "G.Skill", price: 74, ramType: "DDR4", speed: 3600, sizeGb: 16, sticks: 2 },
  { id: "ram-kingston-fury-16-3200", category: "ram", name: "Fury Beast 16GB (2x8) DDR4-3200", brand: "Kingston", price: 45, ramType: "DDR4", speed: 3200, sizeGb: 8, sticks: 2 },
];

// ============================== GPUs ==============================
const GPUS: Part[] = [
  // NVIDIA RTX 50 series
  { id: "gpu-nv-5090-fe", category: "gpu", name: "GeForce RTX 5090 Founders Edition", brand: "NVIDIA", price: 1999, lengthMm: 304, tdp: 575, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-asus-5090-tuf", category: "gpu", name: "TUF RTX 5090 OC", brand: "ASUS", price: 2299, lengthMm: 353, tdp: 600, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-msi-5090-suprim", category: "gpu", name: "RTX 5090 SUPRIM Liquid SOC", brand: "MSI", price: 2499, lengthMm: 305, tdp: 600, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-5080-fe", category: "gpu", name: "GeForce RTX 5080 Founders Edition", brand: "NVIDIA", price: 999, lengthMm: 304, tdp: 360, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-gb-5080-gaming-oc", category: "gpu", name: "RTX 5080 Gaming OC", brand: "Gigabyte", price: 1199, lengthMm: 340, tdp: 400, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-5070-ti", category: "gpu", name: "GeForce RTX 5070 Ti", brand: "NVIDIA", price: 749, lengthMm: 300, tdp: 300, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-msi-5070-ventus", category: "gpu", name: "RTX 5070 Ventus 3X OC", brand: "MSI", price: 549, lengthMm: 305, tdp: 250, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-5060-ti", category: "gpu", name: "GeForce RTX 5060 Ti 16GB", brand: "NVIDIA", price: 429, lengthMm: 242, tdp: 180, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },

  // NVIDIA RTX 40 series
  { id: "gpu-nv-4090-fe", category: "gpu", name: "GeForce RTX 4090 Founders Edition", brand: "NVIDIA", price: 1599, lengthMm: 304, tdp: 450, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-asus-4090-tuf", category: "gpu", name: "TUF RTX 4090 OC", brand: "ASUS", price: 1799, lengthMm: 349, tdp: 450, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-msi-4090-suprim", category: "gpu", name: "RTX 4090 SUPRIM X", brand: "MSI", price: 1749, lengthMm: 337, tdp: 450, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-4080-super", category: "gpu", name: "GeForce RTX 4080 SUPER FE", brand: "NVIDIA", price: 999, lengthMm: 304, tdp: 320, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-gb-4080-eagle", category: "gpu", name: "RTX 4080 SUPER Eagle OC", brand: "Gigabyte", price: 1049, lengthMm: 340, tdp: 320, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-4070-ti-super", category: "gpu", name: "GeForce RTX 4070 Ti SUPER FE", brand: "NVIDIA", price: 799, lengthMm: 267, tdp: 285, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-msi-4070ts-ventus", category: "gpu", name: "RTX 4070 Ti SUPER Ventus 3X", brand: "MSI", price: 829, lengthMm: 308, tdp: 285, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-4070-super", category: "gpu", name: "GeForce RTX 4070 SUPER FE", brand: "NVIDIA", price: 599, lengthMm: 244, tdp: 220, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-msi-4070s-ventus", category: "gpu", name: "RTX 4070 SUPER Ventus 3X", brand: "MSI", price: 599, lengthMm: 307, tdp: 220, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-asus-4070-dual", category: "gpu", name: "Dual RTX 4070 SUPER OC", brand: "ASUS", price: 619, lengthMm: 267, tdp: 220, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-4060-ti", category: "gpu", name: "GeForce RTX 4060 Ti 8GB FE", brand: "NVIDIA", price: 399, lengthMm: 245, tdp: 160, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-msi-4060-ventus", category: "gpu", name: "RTX 4060 Ventus 2X Black OC", brand: "MSI", price: 299, lengthMm: 205, tdp: 115, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-zotac-4060-twin", category: "gpu", name: "RTX 4060 Twin Edge OC", brand: "Zotac", price: 289, lengthMm: 224, tdp: 115, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },

  // NVIDIA 30 series
  { id: "gpu-nv-3090", category: "gpu", name: "GeForce RTX 3090 FE", brand: "NVIDIA", price: 699, lengthMm: 313, tdp: 350, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-msi-3080-suprim", category: "gpu", name: "RTX 3080 SUPRIM X", brand: "MSI", price: 599, lengthMm: 324, tdp: 340, pcieConnectors: { pin8: 3, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-evga-3070-ftw3", category: "gpu", name: "RTX 3070 FTW3 Ultra", brand: "EVGA", price: 449, lengthMm: 300, tdp: 220, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-asus-3060-tuf", category: "gpu", name: "TUF RTX 3060 12GB OC", brand: "ASUS", price: 279, lengthMm: 300, tdp: 170, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },

  // AMD RX 9000 series (RDNA4)
  { id: "gpu-amd-9070-xt", category: "gpu", name: "Radeon RX 9070 XT", brand: "AMD", price: 599, lengthMm: 280, tdp: 304, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-sapphire-9070xt-nitro", category: "gpu", name: "RX 9070 XT Nitro+", brand: "Sapphire", price: 749, lengthMm: 325, tdp: 340, pcieConnectors: { pin8: 3, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-amd-9070", category: "gpu", name: "Radeon RX 9070", brand: "AMD", price: 549, lengthMm: 280, tdp: 220, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },

  // AMD RX 7000 series
  { id: "gpu-amd-7900-xtx", category: "gpu", name: "Radeon RX 7900 XTX", brand: "AMD", price: 899, lengthMm: 287, tdp: 355, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-sapphire-7900xtx-nitro", category: "gpu", name: "RX 7900 XTX Nitro+", brand: "Sapphire", price: 999, lengthMm: 320, tdp: 420, pcieConnectors: { pin8: 3, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-amd-7900-xt", category: "gpu", name: "Radeon RX 7900 XT", brand: "AMD", price: 749, lengthMm: 276, tdp: 315, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-sapphire-7800xt-pulse", category: "gpu", name: "RX 7800 XT Pulse", brand: "Sapphire", price: 499, lengthMm: 313, tdp: 263, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-powercolor-7700xt", category: "gpu", name: "RX 7700 XT Hellhound", brand: "PowerColor", price: 419, lengthMm: 322, tdp: 245, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-amd-7600", category: "gpu", name: "Radeon RX 7600", brand: "AMD", price: 249, lengthMm: 204, tdp: 165, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },

  // Intel Arc
  { id: "gpu-intel-b580", category: "gpu", name: "Arc B580 Limited Edition", brand: "Intel", price: 249, lengthMm: 272, tdp: 190, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-asrock-a770", category: "gpu", name: "Arc A770 Phantom Gaming", brand: "ASRock", price: 329, lengthMm: 305, tdp: 225, pcieConnectors: { pin8: 1, pin6: 1, pin12vhpwr: 0 } },
];

// ============================== STORAGE ==============================
const STORAGE: Part[] = [
  { id: "sto-samsung-990pro-2tb", category: "storage", name: "990 Pro 2TB", brand: "Samsung", price: 179, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-samsung-990pro-4tb", category: "storage", name: "990 Pro 4TB", brand: "Samsung", price: 329, interface: "M.2 NVMe", sizeGb: 4000 },
  { id: "sto-samsung-980pro-2tb", category: "storage", name: "980 Pro 2TB", brand: "Samsung", price: 149, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-wd-sn850x-2tb", category: "storage", name: "WD Black SN850X 2TB", brand: "WD", price: 169, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-wd-sn850x-4tb", category: "storage", name: "WD Black SN850X 4TB", brand: "WD", price: 299, interface: "M.2 NVMe", sizeGb: 4000 },
  { id: "sto-crucial-t705-2tb", category: "storage", name: "T705 Gen5 2TB", brand: "Crucial", price: 279, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-crucial-t500-2tb", category: "storage", name: "T500 2TB", brand: "Crucial", price: 149, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-sk-p44-2tb", category: "storage", name: "Platinum P44 Pro 2TB", brand: "SK Hynix", price: 159, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-kingston-kc3000-1tb", category: "storage", name: "KC3000 1TB", brand: "Kingston", price: 89, interface: "M.2 NVMe", sizeGb: 1000 },
  { id: "sto-teamgroup-mp44-2tb", category: "storage", name: "MP44 2TB", brand: "TeamGroup", price: 119, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-samsung-870evo-1tb", category: "storage", name: "870 EVO 1TB", brand: "Samsung", price: 89, interface: "SATA", sizeGb: 1000 },
  { id: "sto-crucial-mx500-2tb", category: "storage", name: "MX500 2TB", brand: "Crucial", price: 129, interface: "SATA", sizeGb: 2000 },
  { id: "sto-seagate-barracuda-4tb", category: "storage", name: "BarraCuda 4TB HDD", brand: "Seagate", price: 79, interface: "SATA", sizeGb: 4000 },
  { id: "sto-wd-blue-4tb", category: "storage", name: "Blue 4TB HDD", brand: "WD", price: 89, interface: "SATA", sizeGb: 4000 },
];

// ============================== PSUs ==============================
const PSUS: Part[] = [
  { id: "psu-corsair-rm850x", category: "psu", name: "RM850x 2024", brand: "Corsair", price: 149, wattage: 850, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-corsair-rm1000x", category: "psu", name: "RM1000x 2024", brand: "Corsair", price: 199, wattage: 1000, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-corsair-hx1200i", category: "psu", name: "HX1200i", brand: "Corsair", price: 329, wattage: 1200, formFactor: "ATX", efficiency: "80+ Platinum", pcie8Pin: 6, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-corsair-sf750", category: "psu", name: "SF750", brand: "Corsair", price: 179, wattage: 750, formFactor: "SFX", efficiency: "80+ Platinum", pcie8Pin: 4, eps8Pin: 1, pcie12vhpwr: 0, modular: "Full" },
  { id: "psu-seasonic-focus-850", category: "psu", name: "Focus GX-850", brand: "Seasonic", price: 139, wattage: 850, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 0, modular: "Full" },
  { id: "psu-seasonic-prime-1000", category: "psu", name: "Prime TX-1000", brand: "Seasonic", price: 279, wattage: 1000, formFactor: "ATX", efficiency: "80+ Titanium", pcie8Pin: 6, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-evga-supernova-850", category: "psu", name: "SuperNOVA 850 G7", brand: "EVGA", price: 149, wattage: 850, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 0, modular: "Full" },
  { id: "psu-nzxt-c1000", category: "psu", name: "C1000 Gold", brand: "NZXT", price: 159, wattage: 1000, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-msi-mag-a850gl", category: "psu", name: "MAG A850GL PCIE5", brand: "MSI", price: 129, wattage: 850, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 3, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-asus-rog-loki-850", category: "psu", name: "ROG Loki 850W SFX-L", brand: "ASUS", price: 219, wattage: 850, formFactor: "SFX-L", efficiency: "80+ Platinum", pcie8Pin: 3, eps8Pin: 1, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-bequiet-dark-power-1000", category: "psu", name: "Dark Power 13 1000W", brand: "be quiet!", price: 289, wattage: 1000, formFactor: "ATX", efficiency: "80+ Titanium", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-thermaltake-tf1-1650", category: "psu", name: "Toughpower GF3 1650W", brand: "Thermaltake", price: 379, wattage: 1650, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 6, eps8Pin: 2, pcie12vhpwr: 2, modular: "Full" },
  { id: "psu-cm-v750-sfx", category: "psu", name: "V750 SFX Gold", brand: "Cooler Master", price: 149, wattage: 750, formFactor: "SFX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 1, pcie12vhpwr: 0, modular: "Full" },
];

// ============================== CASES ==============================
const CASES: Part[] = [
  { id: "case-corsair-4000d", category: "case", name: "4000D Airflow", brand: "Corsair", price: 104, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 360, maxCoolerHeightMm: 170, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 280mm top" },
  { id: "case-corsair-5000d", category: "case", name: "5000D Airflow", brand: "Corsair", price: 174, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 400, maxCoolerHeightMm: 170, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 360mm top" },
  { id: "case-corsair-7000d", category: "case", name: "7000D Airflow", brand: "Corsair", price: 269, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 450, maxCoolerHeightMm: 190, psuFormFactors: ["ATX"], radiatorSupport: "420mm front, 420mm top" },
  { id: "case-lian-o11d-evo", category: "case", name: "O11 Dynamic EVO", brand: "Lian Li", price: 179, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 422, maxCoolerHeightMm: 167, psuFormFactors: ["ATX", "SFX", "SFX-L"], radiatorSupport: "360mm side/top/bottom" },
  { id: "case-lian-a4h2o", category: "case", name: "A4-H2O", brand: "Lian Li", price: 129, supportedFormFactors: ["Mini-ITX"], maxGpuLengthMm: 322, maxCoolerHeightMm: 55, psuFormFactors: ["SFX", "SFX-L"], radiatorSupport: "240mm side" },
  { id: "case-fractal-north", category: "case", name: "North", brand: "Fractal Design", price: 139, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 355, maxCoolerHeightMm: 170, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 240mm top" },
  { id: "case-fractal-torrent", category: "case", name: "Torrent", brand: "Fractal Design", price: 199, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 461, maxCoolerHeightMm: 188, psuFormFactors: ["ATX"], radiatorSupport: "420mm front, 360mm bottom" },
  { id: "case-fractal-meshify-2", category: "case", name: "Meshify 2", brand: "Fractal Design", price: 159, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 467, maxCoolerHeightMm: 185, psuFormFactors: ["ATX"], radiatorSupport: "420mm front, 360mm top" },
  { id: "case-nzxt-h7-flow", category: "case", name: "H7 Flow (2024)", brand: "NZXT", price: 129, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 400, maxCoolerHeightMm: 185, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 360mm top" },
  { id: "case-nzxt-h9-flow", category: "case", name: "H9 Flow", brand: "NZXT", price: 149, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 435, maxCoolerHeightMm: 165, psuFormFactors: ["ATX"], radiatorSupport: "360mm top/side/bottom" },
  { id: "case-phanteks-p400a", category: "case", name: "Eclipse P400A", brand: "Phanteks", price: 89, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 420, maxCoolerHeightMm: 160, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 240mm top" },
  { id: "case-hyte-y70", category: "case", name: "Y70 Touch", brand: "HYTE", price: 359, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 440, maxCoolerHeightMm: 200, psuFormFactors: ["ATX"], radiatorSupport: "360mm top/side/bottom" },
  { id: "case-hyte-y40", category: "case", name: "Y40", brand: "HYTE", price: 149, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 375, maxCoolerHeightMm: 180, psuFormFactors: ["ATX"], radiatorSupport: "360mm side" },
  { id: "case-cm-td500", category: "case", name: "MasterBox TD500 Mesh V2", brand: "Cooler Master", price: 99, supportedFormFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 410, maxCoolerHeightMm: 165, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 240mm top" },
  { id: "case-cm-nr200p", category: "case", name: "NR200P", brand: "Cooler Master", price: 109, supportedFormFactors: ["Mini-ITX"], maxGpuLengthMm: 330, maxCoolerHeightMm: 155, psuFormFactors: ["SFX", "SFX-L"], radiatorSupport: "280mm side" },
  { id: "case-bequiet-pure-500", category: "case", name: "Pure Base 500 DX", brand: "be quiet!", price: 109, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 369, maxCoolerHeightMm: 190, psuFormFactors: ["ATX"], radiatorSupport: "360mm front, 240mm top" },
];

// ============================== COOLERS ==============================
const COOLERS: Part[] = [
  // Air
  { id: "cool-noctua-nh-d15", category: "cooler", name: "NH-D15", brand: "Noctua", price: 109, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200", "LGA1151"], heightMm: 165, tdpRating: 250, type: "Air" },
  { id: "cool-noctua-nh-d15-g2", category: "cooler", name: "NH-D15 G2", brand: "Noctua", price: 149, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"], heightMm: 168, tdpRating: 280, type: "Air" },
  { id: "cool-noctua-nh-u12a", category: "cooler", name: "NH-U12A", brand: "Noctua", price: 129, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 158, tdpRating: 230, type: "Air" },
  { id: "cool-noctua-nh-l9i", category: "cooler", name: "NH-L9i-17xx", brand: "Noctua", price: 55, supportedSockets: ["LGA1700", "LGA1851"], heightMm: 37, tdpRating: 95, type: "Air" },
  { id: "cool-thermalright-pa120", category: "cooler", name: "Peerless Assassin 120 SE", brand: "Thermalright", price: 39, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200", "LGA1151"], heightMm: 157, tdpRating: 245, type: "Air" },
  { id: "cool-thermalright-phantom", category: "cooler", name: "Phantom Spirit 120 SE", brand: "Thermalright", price: 45, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 157, tdpRating: 265, type: "Air" },
  { id: "cool-deepcool-ak620", category: "cooler", name: "AK620 Digital", brand: "Deepcool", price: 79, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 162, tdpRating: 260, type: "Air" },
  { id: "cool-bequiet-dr5", category: "cooler", name: "Dark Rock Pro 5", brand: "be quiet!", price: 99, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 168, tdpRating: 270, type: "Air" },
  { id: "cool-scythe-fuma3", category: "cooler", name: "Fuma 3", brand: "Scythe", price: 69, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 154, tdpRating: 220, type: "Air" },
  // AIO
  { id: "cool-arctic-lf3-360", category: "cooler", name: "Liquid Freezer III 360", brand: "Arctic", price: 89, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 350, type: "AIO", radiatorMm: 360 },
  { id: "cool-arctic-lf3-420", category: "cooler", name: "Liquid Freezer III 420", brand: "Arctic", price: 109, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"], heightMm: 0, tdpRating: 400, type: "AIO", radiatorMm: 420 },
  { id: "cool-corsair-h150i-elite", category: "cooler", name: "iCUE H150i Elite LCD XT", brand: "Corsair", price: 249, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 330, type: "AIO", radiatorMm: 360 },
  { id: "cool-corsair-h100i", category: "cooler", name: "iCUE H100i RGB Elite", brand: "Corsair", price: 129, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 250, type: "AIO", radiatorMm: 240 },
  { id: "cool-nzxt-kraken-360", category: "cooler", name: "Kraken 360 RGB", brand: "NZXT", price: 279, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 320, type: "AIO", radiatorMm: 360 },
  { id: "cool-nzxt-kraken-elite-280", category: "cooler", name: "Kraken Elite 280 RGB", brand: "NZXT", price: 259, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"], heightMm: 0, tdpRating: 300, type: "AIO", radiatorMm: 280 },
  { id: "cool-lian-galahad2-360", category: "cooler", name: "Galahad II Trinity 360", brand: "Lian Li", price: 149, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 330, type: "AIO", radiatorMm: 360 },
  { id: "cool-msi-mag-coreliquid-360", category: "cooler", name: "MAG CoreLiquid E360", brand: "MSI", price: 129, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 310, type: "AIO", radiatorMm: 360 },
  { id: "cool-asus-ryujin-iii-360", category: "cooler", name: "ROG Ryujin III 360 ARGB", brand: "ASUS", price: 349, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 340, type: "AIO", radiatorMm: 360 },
  { id: "cool-deepcool-ls720", category: "cooler", name: "LS720", brand: "Deepcool", price: 129, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 300, type: "AIO", radiatorMm: 360 },
];

// ============================== EXTRA PARTS (v3) ==============================
const EXTRAS: Part[] = [
  // Budget / previous-gen CPUs
  { id: "cpu-amd-5500", category: "cpu", name: "Ryzen 5 5500", brand: "AMD", price: 89, socket: "AM4", tdp: 65, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 6, boostClock: 4.2 },
  { id: "cpu-amd-5600g", category: "cpu", name: "Ryzen 5 5600G", brand: "AMD", price: 129, socket: "AM4", tdp: 65, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: true, cores: 6, boostClock: 4.4 },
  { id: "cpu-intel-13400f", category: "cpu", name: "Core i5-13400F", brand: "Intel", price: 179, socket: "LGA1700", tdp: 65, ramType: "DDR5", maxRamSpeed: 4800, memoryChannels: 2, integratedGraphics: false, cores: 10, boostClock: 4.6 },
  { id: "cpu-intel-12100f", category: "cpu", name: "Core i3-12100F", brand: "Intel", price: 89, socket: "LGA1700", tdp: 58, ramType: "DDR4", maxRamSpeed: 3200, memoryChannels: 2, integratedGraphics: false, cores: 4, boostClock: 4.3 },

  // Budget motherboards
  { id: "mb-msi-b550m-pro", category: "motherboard", name: "B550M Pro-VDH WiFi", brand: "MSI", price: 109, socket: "AM4", chipset: "B550", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 4, maxRamSpeed: 4400, memoryChannels: 2, m2Slots: 1, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
  { id: "mb-asus-a620m", category: "motherboard", name: "PRIME A620M-A", brand: "ASUS", price: 109, socket: "AM5", chipset: "A620", formFactor: "Micro-ATX", ramType: "DDR5", ramSlots: 4, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 2, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
  { id: "mb-gb-b760m-ds3h", category: "motherboard", name: "B760M DS3H DDR4", brand: "Gigabyte", price: 99, socket: "LGA1700", chipset: "B760", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 4, maxRamSpeed: 3200, memoryChannels: 2, m2Slots: 2, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },
  { id: "mb-asrock-b650e-pg-itx", category: "motherboard", name: "B650E PG-ITX WiFi", brand: "ASRock", price: 279, socket: "AM5", chipset: "B650E", formFactor: "Mini-ITX", ramType: "DDR5", ramSlots: 2, maxRamSpeed: 6400, memoryChannels: 2, m2Slots: 3, sataPorts: 4, pcieX16Slots: 1, eps8Pin: 1 },

  // More RAM options
  { id: "ram-corsair-ven-64-6000", category: "ram", name: "Vengeance 64GB (2x32) DDR5-6000 CL30", brand: "Corsair", price: 209, ramType: "DDR5", speed: 6000, sizeGb: 32, sticks: 2 },
  { id: "ram-gskill-tz-96-6400", category: "ram", name: "Trident Z5 Neo 96GB (2x48) DDR5-6400", brand: "G.Skill", price: 369, ramType: "DDR5", speed: 6400, sizeGb: 48, sticks: 2 },
  { id: "ram-corsair-ven-16-3200", category: "ram", name: "Vengeance LPX 16GB (2x8) DDR4-3200", brand: "Corsair", price: 39, ramType: "DDR4", speed: 3200, sizeGb: 8, sticks: 2 },
  { id: "ram-gskill-tz-64-3600", category: "ram", name: "Trident Z Neo 64GB (2x32) DDR4-3600", brand: "G.Skill", price: 139, ramType: "DDR4", speed: 3600, sizeGb: 32, sticks: 2 },

  // More GPUs
  { id: "gpu-nv-5070", category: "gpu", name: "GeForce RTX 5070", brand: "NVIDIA", price: 549, lengthMm: 250, tdp: 250, pcieConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 } },
  { id: "gpu-nv-5060", category: "gpu", name: "GeForce RTX 5060", brand: "NVIDIA", price: 299, lengthMm: 244, tdp: 145, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-asus-4060-dual", category: "gpu", name: "Dual RTX 4060 OC", brand: "ASUS", price: 289, lengthMm: 227, tdp: 115, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-sapphire-7600xt-pulse", category: "gpu", name: "RX 7600 XT Pulse", brand: "Sapphire", price: 329, lengthMm: 240, tdp: 190, pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 } },
  { id: "gpu-intel-b570", category: "gpu", name: "Arc B570 Limited Edition", brand: "Intel", price: 219, lengthMm: 272, tdp: 150, pcieConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 } },

  // More storage
  { id: "sto-samsung-990pro-1tb", category: "storage", name: "990 Pro 1TB", brand: "Samsung", price: 99, interface: "M.2 NVMe", sizeGb: 1000 },
  { id: "sto-wd-sn770-1tb", category: "storage", name: "WD Black SN770 1TB", brand: "WD", price: 69, interface: "M.2 NVMe", sizeGb: 1000 },
  { id: "sto-crucial-p5-plus-1tb", category: "storage", name: "P5 Plus 1TB", brand: "Crucial", price: 79, interface: "M.2 NVMe", sizeGb: 1000 },
  { id: "sto-seagate-firecuda-540-2tb", category: "storage", name: "FireCuda 540 2TB", brand: "Seagate", price: 239, interface: "M.2 NVMe", sizeGb: 2000 },
  { id: "sto-wd-red-8tb", category: "storage", name: "Red Plus 8TB NAS HDD", brand: "WD", price: 179, interface: "SATA", sizeGb: 8000 },
  { id: "sto-seagate-ironwolf-8tb", category: "storage", name: "IronWolf 8TB NAS HDD", brand: "Seagate", price: 189, interface: "SATA", sizeGb: 8000 },

  // More PSUs (budget / high-end)
  { id: "psu-corsair-rm650x", category: "psu", name: "RM650x 2024", brand: "Corsair", price: 109, wattage: 650, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 2, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },
  { id: "psu-corsair-hx1500i", category: "psu", name: "HX1500i", brand: "Corsair", price: 429, wattage: 1500, formFactor: "ATX", efficiency: "80+ Platinum", pcie8Pin: 8, eps8Pin: 2, pcie12vhpwr: 2, modular: "Full" },
  { id: "psu-seasonic-focus-750", category: "psu", name: "Focus GX-750", brand: "Seasonic", price: 119, wattage: 750, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 0, modular: "Full" },
  { id: "psu-bequiet-pure-750", category: "psu", name: "Pure Power 12 M 750W", brand: "be quiet!", price: 129, wattage: 750, formFactor: "ATX", efficiency: "80+ Gold", pcie8Pin: 4, eps8Pin: 2, pcie12vhpwr: 1, modular: "Full" },

  // More cases
  { id: "case-fractal-pop-air", category: "case", name: "Pop Air", brand: "Fractal Design", price: 79, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 405, maxCoolerHeightMm: 170, psuFormFactors: ["ATX"], radiatorSupport: "360mm front" },
  { id: "case-lian-o11-mini", category: "case", name: "O11 Dynamic Mini", brand: "Lian Li", price: 129, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 395, maxCoolerHeightMm: 170, psuFormFactors: ["ATX", "SFX", "SFX-L"], radiatorSupport: "280mm side/top" },
  { id: "case-nzxt-h5-flow", category: "case", name: "H5 Flow (2024)", brand: "NZXT", price: 99, supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLengthMm: 365, maxCoolerHeightMm: 165, psuFormFactors: ["ATX"], radiatorSupport: "280mm front, 360mm bottom" },
  { id: "case-fractal-terra", category: "case", name: "Terra", brand: "Fractal Design", price: 179, supportedFormFactors: ["Mini-ITX"], maxGpuLengthMm: 322, maxCoolerHeightMm: 77, psuFormFactors: ["SFX", "SFX-L"], radiatorSupport: "None" },

  // More coolers
  { id: "cool-noctua-nh-u12s", category: "cooler", name: "NH-U12S redux", brand: "Noctua", price: 59, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 158, tdpRating: 180, type: "Air" },
  { id: "cool-thermalright-aa120", category: "cooler", name: "Assassin X 120 R SE", brand: "Thermalright", price: 25, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 155, tdpRating: 180, type: "Air" },
  { id: "cool-arctic-lf3-240", category: "cooler", name: "Liquid Freezer III 240", brand: "Arctic", price: 79, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"], heightMm: 0, tdpRating: 280, type: "AIO", radiatorMm: 240 },
  { id: "cool-corsair-h170i-elite", category: "cooler", name: "iCUE H170i Elite LCD XT", brand: "Corsair", price: 329, supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"], heightMm: 0, tdpRating: 400, type: "AIO", radiatorMm: 420 },
];

export const SEED_PARTS: Part[] = [
  ...CPUS,
  ...MOBOS,
  ...RAMS,
  ...GPUS,
  ...STORAGE,
  ...PSUS,
  ...CASES,
  ...COOLERS,
  ...EXTRAS,
];

