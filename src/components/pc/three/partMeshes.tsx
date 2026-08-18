import { useMemo } from "react";
import type {
  CasePart,
  CoolerPart,
  CpuPart,
  GpuPart,
  MotherboardPart,
  Part,
  PartCategory,
  PsuPart,
  RamPart,
  StoragePart,
} from "@/lib/pc/types";

/** Palette (3D materials cannot use CSS tokens) tuned to the app's dark/neon-cyan theme. */
export const COL = {
  pcb: "#0f2a2f",
  pcbLight: "#14383e",
  metal: "#6b7784",
  darkMetal: "#2b3440",
  plastic: "#1b2430",
  accent: "#5fe4f0",
  gold: "#c9a227",
  fan: "#374151",
  glass: "#9fdfe8",
  heatsink: "#8b949e",
  label: "#d8dee6",
} as const;

type MeshProps = { ghost?: boolean; fault?: boolean };

function useMat(base: string, { ghost, fault }: MeshProps) {
  return useMemo(() => {
    if (fault) return { color: "#ff5d5d", opacity: ghost ? 0.25 : 1 };
    return { color: base, opacity: ghost ? 0.18 : 1 };
  }, [base, ghost, fault]);
}

function Box({
  size,
  position = [0, 0, 0],
  color,
  ghost,
  fault,
  metalness = 0.5,
  roughness = 0.45,
  rotation,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  rotation?: [number, number, number];
} & MeshProps) {
  const m = useMat(color, { ghost, fault });
  return (
    <mesh position={position} rotation={rotation} castShadow={!ghost}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={m.color}
        transparent={m.opacity < 1}
        opacity={m.opacity}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}

function Cyl({
  args,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color,
  ghost,
  fault,
}: {
  args: [number, number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
} & MeshProps) {
  const m = useMat(color, { ghost, fault });
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial
        color={m.color}
        transparent={m.opacity < 1}
        opacity={m.opacity}
        metalness={0.4}
        roughness={0.5}
      />
    </mesh>
  );
}

function FanUnit({ size = 0.5, ...p }: { size?: number } & MeshProps) {
  const r = size / 2;
  return (
    <group>
      <Box size={[size, size, 0.09]} color={COL.plastic} {...p} />
      <Cyl args={[r * 0.85, r * 0.85, 0.05, 20]} rotation={[Math.PI / 2, 0, 0]} color={COL.fan} {...p} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Box
          key={i}
          size={[r * 0.8, 0.03, 0.05]}
          position={[
            Math.cos((i / 7) * Math.PI * 2) * r * 0.42,
            Math.sin((i / 7) * Math.PI * 2) * r * 0.42,
            0.05,
          ]}
          rotation={[0, 0, (i / 7) * Math.PI * 2]}
          color={COL.metal}
          {...p}
        />
      ))}
      <Cyl args={[r * 0.28, r * 0.28, 0.14, 16]} rotation={[Math.PI / 2, 0, 0]} color={COL.darkMetal} {...p} />
    </group>
  );
}

/* ---------------- Per-category models ---------------- */

export function CpuModel({ part, ...p }: { part?: CpuPart } & MeshProps) {
  const cores = part?.cores ?? 8;
  return (
    <group>
      <Box size={[1.4, 0.1, 1.4]} color={COL.darkMetal} metalness={0.2} {...p} />
      <Box size={[1.05, 0.14, 1.05]} position={[0, 0.11, 0]} color={COL.metal} metalness={0.95} roughness={0.2} {...p} />
      <Box size={[0.6, 0.03, 0.18]} position={[0, 0.19, 0]} color={COL.accent} metalness={0.3} {...p} />
      {Array.from({ length: Math.min(cores, 12) }).map((_, i) => (
        <Box
          key={i}
          size={[0.07, 0.02, 0.07]}
          position={[-0.6 + (i % 6) * 0.24, -0.06, i < 6 ? -0.55 : 0.55]}
          color={COL.gold}
          metalness={1}
          roughness={0.25}
          {...p}
        />
      ))}
    </group>
  );
}

export function MotherboardModel({ part, ...p }: { part?: MotherboardPart } & MeshProps) {
  const ff = part?.formFactor ?? "ATX";
  const w = ff === "Mini-ITX" ? 1.3 : ff === "Micro-ATX" ? 1.7 : ff === "E-ATX" ? 2.3 : 2;
  const h = ff === "Mini-ITX" ? 1.3 : ff === "Micro-ATX" ? 1.7 : 2;
  const slots = part?.ramSlots ?? 4;
  return (
    <group>
      <Box size={[w, 0.06, h]} color={COL.pcb} metalness={0.15} roughness={0.8} {...p} />
      {/* CPU socket */}
      <Box size={[0.5, 0.07, 0.5]} position={[-w * 0.12, 0.06, -h * 0.22]} color={COL.darkMetal} {...p} />
      {/* RAM slots */}
      {Array.from({ length: slots }).map((_, i) => (
        <Box
          key={i}
          size={[0.07, 0.09, h * 0.55]}
          position={[w * 0.26 + i * 0.11, 0.07, -h * 0.05]}
          color={i % 2 ? COL.plastic : COL.accent}
          {...p}
        />
      ))}
      {/* PCIe x16 slots */}
      {Array.from({ length: part?.pcieX16Slots ?? 2 }).map((_, i) => (
        <Box
          key={i}
          size={[w * 0.72, 0.07, 0.08]}
          position={[-w * 0.06, 0.06, h * 0.05 + i * 0.32]}
          color={COL.accent}
          {...p}
        />
      ))}
      {/* Chipset + M.2 heatsinks */}
      <Box size={[0.38, 0.1, 0.38]} position={[w * 0.1, 0.08, h * 0.32]} color={COL.heatsink} metalness={0.9} {...p} />
      {Array.from({ length: Math.min(part?.m2Slots ?? 2, 3) }).map((_, i) => (
        <Box
          key={i}
          size={[w * 0.5, 0.05, 0.14]}
          position={[-w * 0.1, 0.06, h * 0.16 + i * 0.22]}
          color={COL.metal}
          metalness={0.9}
          {...p}
        />
      ))}
      {/* Rear I/O shroud */}
      <Box size={[0.5, 0.24, 0.16]} position={[-w * 0.28, 0.15, -h * 0.44]} color={COL.plastic} {...p} />
    </group>
  );
}

export function RamModel({ part, ...p }: { part?: RamPart } & MeshProps) {
  const sticks = Math.max(1, Math.min(part?.sticks ?? 2, 4));
  return (
    <group>
      {Array.from({ length: sticks }).map((_, i) => (
        <group key={i} position={[(i - (sticks - 1) / 2) * 0.26, 0, 0]}>
          <Box size={[0.09, 0.9, 1.6]} color={COL.pcbLight} metalness={0.2} roughness={0.7} {...p} />
          {/* heatspreader */}
          <Box size={[0.13, 0.7, 1.5]} position={[0, 0.12, 0]} color={COL.darkMetal} metalness={0.85} {...p} />
          {/* RGB diffuser bar */}
          <Box size={[0.14, 0.12, 1.4]} position={[0, 0.5, 0]} color={COL.accent} metalness={0.1} roughness={0.3} {...p} />
          {/* contacts */}
          <Box size={[0.1, 0.06, 1.4]} position={[0, -0.44, 0]} color={COL.gold} metalness={1} roughness={0.25} {...p} />
        </group>
      ))}
    </group>
  );
}

export function GpuModel({ part, ...p }: { part?: GpuPart } & MeshProps) {
  const len = Math.max(1.2, Math.min(((part?.lengthMm ?? 300) / 340) * 2.6, 3));
  const fans = len > 2.4 ? 3 : len > 1.8 ? 2 : 1;
  return (
    <group>
      {/* PCB + bracket */}
      <Box size={[len, 0.07, 1.05]} color={COL.pcb} metalness={0.2} roughness={0.8} {...p} />
      <Box size={[len * 0.95, 0.42, 0.95]} position={[0, 0.24, 0]} color={COL.plastic} {...p} />
      {/* shroud accent stripe */}
      <Box size={[len * 0.95, 0.04, 0.06]} position={[0, 0.46, -0.45]} color={COL.accent} {...p} />
      {/* fans on top */}
      {Array.from({ length: fans }).map((_, i) => (
        <group
          key={i}
          position={[(i - (fans - 1) / 2) * (len * 0.9 / fans), 0.47, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <FanUnit size={Math.min(0.8, (len * 0.85) / fans)} {...p} />
        </group>
      ))}
      {/* fin stack visible at rear */}
      <Box size={[len * 0.9, 0.3, 0.06]} position={[0, 0.22, 0.48]} color={COL.heatsink} metalness={0.9} {...p} />
      {/* I/O bracket */}
      <Box size={[0.05, 0.75, 1]} position={[-len / 2 - 0.03, 0.2, 0]} color={COL.metal} metalness={0.95} {...p} />
      {/* PCIe fingers */}
      <Box size={[len * 0.45, 0.06, 0.12]} position={[len * 0.05, -0.06, -0.4]} color={COL.gold} metalness={1} {...p} />
      {/* power connectors */}
      {Array.from({
        length:
          (part?.pcieConnectors?.pin8 ?? 2) + (part?.pcieConnectors?.pin12vhpwr ?? 0) || 2,
      }).map((_, i) => (
        <Box
          key={i}
          size={[0.22, 0.12, 0.1]}
          position={[len * 0.2 - i * 0.28, 0.5, 0.3]}
          color={COL.darkMetal}
          {...p}
        />
      ))}
    </group>
  );
}

export function StorageModel({ part, ...p }: { part?: StoragePart } & MeshProps) {
  const isM2 = (part?.interface ?? "M.2 NVMe").startsWith("M.2");
  if (isM2) {
    return (
      <group>
        <Box size={[2, 0.05, 0.42]} color={COL.pcbLight} metalness={0.2} roughness={0.8} {...p} />
        <Box size={[0.5, 0.12, 0.34]} position={[0.35, 0.08, 0]} color={COL.darkMetal} {...p} />
        <Box size={[0.5, 0.12, 0.34]} position={[-0.3, 0.08, 0]} color={COL.darkMetal} {...p} />
        <Box size={[0.28, 0.1, 0.3]} position={[0.9, 0.07, 0]} color={COL.metal} metalness={0.9} {...p} />
        <Box size={[0.12, 0.06, 0.36]} position={[-0.96, 0, 0]} color={COL.gold} metalness={1} {...p} />
      </group>
    );
  }
  return (
    <group>
      <Box size={[1.9, 0.3, 1.4]} color={COL.metal} metalness={0.9} roughness={0.35} {...p} />
      <Box size={[1.2, 0.03, 0.9]} position={[0, 0.16, 0]} color={COL.label} metalness={0.1} {...p} />
      <Box size={[0.5, 0.14, 0.12]} position={[-0.72, -0.05, 0.55]} color={COL.plastic} {...p} />
    </group>
  );
}

export function PsuModel({ part, ...p }: { part?: PsuPart } & MeshProps) {
  const sfx = (part?.formFactor ?? "ATX") !== "ATX";
  const w = sfx ? 1.25 : 1.7;
  return (
    <group>
      <Box size={[w, 0.86, 1.4]} color={COL.darkMetal} metalness={0.85} roughness={0.4} {...p} />
      <group position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <FanUnit size={w * 0.72} {...p} />
      </group>
      <Box size={[0.05, 0.55, 0.9]} position={[w / 2 + 0.02, -0.05, 0]} color={COL.plastic} {...p} />
      <Box size={[0.4, 0.16, 0.16]} position={[-w / 2 - 0.06, 0.1, 0.35]} color={COL.plastic} {...p} />
      <Box size={[0.5, 0.04, 0.7]} position={[0, -0.44, 0]} color={COL.accent} {...p} />
    </group>
  );
}

export function CaseModel({ part, ...p }: { part?: CasePart } & MeshProps) {
  const ffs = part?.supportedFormFactors ?? ["ATX"];
  const small = ffs.every((f) => f === "Mini-ITX");
  const w = small ? 1.1 : 1.4;
  const h = small ? 1.6 : 2.4;
  const d = small ? 1.4 : 2.1;
  const m = useMat(COL.plastic, p);
  return (
    <group>
      {/* chassis frame (open on front-left for the glass panel) */}
      <Box size={[w, 0.06, d]} position={[0, -h / 2, 0]} color={COL.darkMetal} {...p} />
      <Box size={[w, 0.06, d]} position={[0, h / 2, 0]} color={COL.darkMetal} {...p} />
      <Box size={[0.06, h, d]} position={[w / 2, 0, 0]} color={COL.darkMetal} {...p} />
      <Box size={[w, h, 0.06]} position={[0, 0, d / 2]} color={COL.plastic} {...p} />
      {/* tempered glass side */}
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[0.03, h * 0.96, d * 0.96]} />
        <meshStandardMaterial
          color={COL.glass}
          transparent
          opacity={p.ghost ? 0.06 : 0.16}
          metalness={0.2}
          roughness={0.05}
        />
      </mesh>
      {/* front mesh strip */}
      <Box size={[w * 0.9, h * 0.9, 0.03]} position={[0, 0, -d / 2 + 0.02]} color={m.color} {...p} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Box
          key={i}
          size={[w * 0.8, 0.05, 0.02]}
          position={[0, h * 0.4 - i * (h * 0.1), -d / 2 - 0.01]}
          color={COL.accent}
          ghost
          {...(p.fault ? { fault: true } : {})}
        />
      ))}
      {/* feet */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            size={[0.16, 0.1, 0.16]}
            position={[sx * (w / 2 - 0.14), -h / 2 - 0.08, sz * (d / 2 - 0.16)]}
            color={COL.darkMetal}
            {...p}
          />
        )),
      )}
    </group>
  );
}

export function CoolerModel({ part, ...p }: { part?: CoolerPart } & MeshProps) {
  const aio = (part?.type ?? "Air") === "AIO";
  if (aio) {
    const rad = Math.max(1.4, Math.min(((part?.radiatorMm ?? 240) / 360) * 3, 3));
    return (
      <group>
        {/* radiator */}
        <Box size={[0.34, rad, 1]} position={[-0.9, 0, 0]} color={COL.metal} metalness={0.9} {...p} />
        {Array.from({ length: rad > 2.4 ? 3 : 2 }).map((_, i) => (
          <group
            key={i}
            position={[-0.62, (i - (rad > 2.4 ? 1 : 0.5)) * (rad / (rad > 2.4 ? 3 : 2)), 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <FanUnit size={rad / (rad > 2.4 ? 3.2 : 2.2)} {...p} />
          </group>
        ))}
        {/* tubes */}
        <Cyl args={[0.07, 0.07, 1.3, 10]} rotation={[0, 0, Math.PI / 2]} position={[0.0, 0.3, -0.2]} color={COL.plastic} {...p} />
        <Cyl args={[0.07, 0.07, 1.3, 10]} rotation={[0, 0, Math.PI / 2]} position={[0.0, 0.1, 0.2]} color={COL.plastic} {...p} />
        {/* pump block */}
        <Cyl args={[0.42, 0.42, 0.34, 24]} position={[0.85, 0.2, 0]} color={COL.darkMetal} {...p} />
        <Cyl args={[0.3, 0.3, 0.05, 24]} position={[0.85, 0.38, 0]} color={COL.accent} {...p} />
      </group>
    );
  }
  const hgt = Math.max(1, Math.min(((part?.heightMm ?? 155) / 170) * 2.2, 2.4));
  return (
    <group>
      {/* baseplate */}
      <Box size={[0.7, 0.1, 0.7]} position={[0, -hgt / 2, 0]} color={COL.metal} metalness={0.95} {...p} />
      {/* heatpipes */}
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <Cyl key={x} args={[0.05, 0.05, hgt * 0.9, 10]} position={[x, 0, 0]} color={COL.metal} {...p} />
      ))}
      {/* fin stack */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box
          key={i}
          size={[0.95, 0.03, 0.85]}
          position={[0, -hgt / 2 + 0.35 + i * ((hgt - 0.5) / 12), 0]}
          color={COL.heatsink}
          metalness={0.9}
          roughness={0.3}
          {...p}
        />
      ))}
      {/* fan on the side */}
      <group position={[0, 0.05, -0.6]}>
        <FanUnit size={0.95} {...p} />
      </group>
    </group>
  );
}

/** Renders the stylized model for any part (or a generic ghost when unknown). */
export function PartModel({
  part,
  category,
  ghost,
  fault,
}: {
  part?: Part;
  category?: PartCategory;
} & MeshProps) {
  const cat = part?.category ?? category;
  const p = { ghost, fault };
  switch (cat) {
    case "cpu":
      return <CpuModel part={part as CpuPart} {...p} />;
    case "motherboard":
      return <MotherboardModel part={part as MotherboardPart} {...p} />;
    case "ram":
      return <RamModel part={part as RamPart} {...p} />;
    case "gpu":
      return <GpuModel part={part as GpuPart} {...p} />;
    case "storage":
      return <StorageModel part={part as StoragePart} {...p} />;
    case "psu":
      return <PsuModel part={part as PsuPart} {...p} />;
    case "case":
      return <CaseModel part={part as CasePart} {...p} />;
    case "cooler":
      return <CoolerModel part={part as CoolerPart} {...p} />;
    default:
      return <Box size={[1.2, 1.2, 1.2]} color={COL.plastic} {...p} />;
  }
}
