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

/**
 * Scene convention (shared with BuildViewer):
 *   +X = right (motherboard tray side)   -X = left (glass panel / case interior)
 *   +Y = up                              -Y = down (floor)
 *   +Z = rear (rear I/O)                 -Z = front intake
 *
 * Board-mounted models (cpu, cooler, ram, gpu, storage m.2) are authored with the
 * motherboard face at x = 0 and their body extending toward -X, so BuildViewer can
 * place them with a plain position offset and no rotation.
 */

/** millimetres -> scene units */
export const S = 0.005;
const mm = (v: number) => v * S;

/** Palette (3D materials cannot use CSS tokens) tuned to the app's dark/neon theme. */
export const COL = {
  pcb: "#0f2a2f",
  pcbLight: "#14383e",
  pcbDark: "#101820",
  metal: "#6b7784",
  darkMetal: "#2b3440",
  plastic: "#1b2430",
  black: "#12171e",
  accent: "#5fe4f0",
  gold: "#c9a227",
  fan: "#374151",
  glass: "#9fdfe8",
  heatsink: "#8b949e",
  label: "#d8dee6",
  nvidia: "#76b900",
  amd: "#e03a3a",
  intel: "#2f8fd8",
} as const;

type MeshProps = { ghost?: boolean; fault?: boolean };

/* ---------------- brand / tier detection ---------------- */

const txt = (p?: Part) => `${p?.brand ?? ""} ${p?.name ?? ""}`.toLowerCase();

export type Vendor = "nvidia" | "amd" | "intel" | "neutral";

export function gpuVendor(part?: GpuPart): Vendor {
  const t = txt(part);
  if (/geforce|rtx|gtx|nvidia/.test(t)) return "nvidia";
  if (/radeon|rx\s?\d|amd/.test(t)) return "amd";
  if (/arc|a7\d0|b5\d0|intel/.test(t)) return "intel";
  return "neutral";
}

export function cpuVendor(part?: CpuPart): Vendor {
  const t = txt(part);
  const s = (part?.socket ?? "").toUpperCase();
  if (s.startsWith("AM") || /ryzen|threadripper|athlon/.test(t)) return "amd";
  if (s.startsWith("LGA") || /intel|core|pentium|celeron/.test(t)) return "intel";
  return "neutral";
}

export function vendorColor(v: Vendor) {
  return v === "nvidia" ? COL.nvidia : v === "amd" ? COL.amd : v === "intel" ? COL.intel : COL.accent;
}

/** brand accent for non-silicon parts (ram, boards, psus, cases) */
export function brandAccent(part?: Part): string {
  const t = txt(part);
  if (/corsair/.test(t)) return "#f2c14e";
  if (/g\.?skill/.test(t)) return "#e0534f";
  if (/kingston|fury/.test(t)) return "#d84a3a";
  if (/crucial|micron/.test(t)) return "#3fa9df";
  if (/asus|rog/.test(t)) return "#e0345c";
  if (/msi/.test(t)) return "#e03a3a";
  if (/gigabyte|aorus/.test(t)) return "#e77b1e";
  if (/asrock/.test(t)) return "#4aa3e0";
  if (/nzxt/.test(t)) return "#c9d1d9";
  if (/lian\s?li/.test(t)) return "#9aa7b4";
  if (/fractal/.test(t)) return "#6f8ba0";
  if (/be\s?quiet/.test(t)) return "#5a6472";
  if (/cooler\s?master/.test(t)) return "#8a56d6";
  if (/seasonic/.test(t)) return "#3f9e6f";
  if (/samsung/.test(t)) return "#3f6fd8";
  if (/western digital|\bwd\b/.test(t)) return "#3fa9df";
  if (/seagate/.test(t)) return "#6fbf4a";
  return COL.accent;
}

const hasRgb = (p?: Part) => /rgb|argb|trident|vengeance rgb|lancool|aer|halo/.test(txt(p));

/* ---------------- primitives ---------------- */

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
  emissive = 0,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  rotation?: [number, number, number];
  emissive?: number;
} & MeshProps) {
  const m = useMat(color, { ghost, fault });
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={m.color}
        transparent={m.opacity < 1}
        opacity={m.opacity}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ? m.color : "#000000"}
        emissiveIntensity={emissive}
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
  metalness = 0.4,
  roughness = 0.5,
}: {
  args: [number, number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
} & MeshProps) {
  const m = useMat(color, { ghost, fault });
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={args} />
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

/** Fan authored in the XY plane (normal = +Z). */
function FanUnit({
  size = 0.5,
  accent = COL.metal,
  ...p
}: { size?: number; accent?: string } & MeshProps) {
  const r = size / 2;
  const t = size * 0.16;
  return (
    <group>
      <Box size={[size, size, t]} color={COL.plastic} roughness={0.7} metalness={0.2} {...p} />
      <Cyl args={[r * 0.92, r * 0.92, t * 0.7, 24]} rotation={[Math.PI / 2, 0, 0]} color={COL.black} {...p} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Box
          key={i}
          size={[r * 0.82, size * 0.06, t * 0.35]}
          position={[
            Math.cos((i / 9) * Math.PI * 2) * r * 0.44,
            Math.sin((i / 9) * Math.PI * 2) * r * 0.44,
            t * 0.3,
          ]}
          rotation={[0, 0, (i / 9) * Math.PI * 2 + 0.5]}
          color={COL.fan}
          roughness={0.6}
          {...p}
        />
      ))}
      <Cyl args={[r * 0.3, r * 0.3, t * 0.9, 20]} rotation={[Math.PI / 2, 0, 0]} color={COL.darkMetal} {...p} />
      <Cyl args={[r * 0.98, r * 0.98, t * 0.2, 28]} position={[0, 0, t * 0.5]} rotation={[Math.PI / 2, 0, 0]} color={accent} {...p} />
    </group>
  );
}

/* ---------------- shared dimensions / anchors ---------------- */

export function caseDims(part?: CasePart) {
  const ffs = part?.supportedFormFactors ?? ["ATX"];
  const big = ffs.includes("E-ATX");
  const itxOnly = ffs.every((f) => f === "Mini-ITX");
  const matxOnly = !big && ffs.every((f) => f === "Mini-ITX" || f === "Micro-ATX");
  const d = part?.maxGpuLengthMm;
  if (big) return { w: mm(240), h: mm(530), d: mm(510) };
  if (itxOnly) return { w: mm(190), h: mm(340), d: mm(340) };
  if (matxOnly) return { w: mm(205), h: mm(410), d: mm(410) };
  return { w: mm(215), h: mm(465), d: mm(d && d > 380 ? 470 : 445) };
}

const MB_SIZE: Record<string, { d: number; h: number }> = {
  ATX: { d: 305, h: 244 },
  "Micro-ATX": { d: 244, h: 244 },
  "Mini-ITX": { d: 170, h: 170 },
  "E-ATX": { d: 330, h: 272 },
};

/** All values in scene units, local to the board centre (board face plane at x = 0). */
export function mbLayout(part?: MotherboardPart) {
  const ff = part?.formFactor ?? "ATX";
  const base = MB_SIZE[ff] ?? MB_SIZE.ATX;
  const d = mm(base.d);
  const h = mm(base.h);
  const slots = Math.max(1, Math.min(part?.ramSlots ?? 4, 4));
  const pcie = Math.max(1, Math.min(part?.pcieX16Slots ?? 2, 3));
  return {
    d,
    h,
    /** CPU socket centre (local y, z) */
    socket: { y: h * 0.17, z: d * 0.16 },
    /** first DIMM slot centre and step toward the front of the case */
    dimm: { y: h * 0.08, z: -d * 0.02, step: mm(11), count: slots },
    /** PCIe x16 slot centres (topmost first) */
    pcie: Array.from({ length: pcie }).map((_, i) => ({
      y: -h * 0.13 - i * mm(80),
      z: d * 0.12,
    })),
    /** M.2 shield centres */
    m2: Array.from({ length: Math.max(1, Math.min(part?.m2Slots ?? 2, 3)) }).map((_, i) => ({
      y: -h * 0.05 - i * mm(70),
      z: -d * 0.1,
    })),
  };
}

/** Usable inner volume of the case (half-extents), after panel thickness. */
export function caseInterior(part?: CasePart) {
  const { w, h, d } = caseDims(part);
  const pad = mm(10);
  return {
    hx: w / 2 - pad,
    hy: h / 2 - pad,
    hz: d / 2 - pad,
    w: w - pad * 2,
    h: h - pad * 2,
    d: d - pad * 2,
  };
}

/**
 * Picks a legal mount + size for an AIO radiator inside the case.
 * Falls back roof -> front -> largest supported size, flagging a fit fault.
 */
export function radiatorPlan(cooler?: CoolerPart, box?: CasePart) {
  const I = caseInterior(box);
  const requested = cooler?.radiatorMm ?? 240;
  const wantFans = Math.max(1, Math.round(requested / 120));
  const fanLen = mm(122);
  const roofRoom = I.d - mm(30);
  const frontRoom = I.h - mm(40);
  let mount: "roof" | "front" = "roof";
  let fans = wantFans;
  let fits = true;
  if (wantFans * fanLen > roofRoom) {
    if (wantFans * fanLen <= frontRoom) {
      mount = "front";
    } else {
      const best = Math.max(roofRoom, frontRoom);
      mount = frontRoom > roofRoom ? "front" : "roof";
      fans = Math.max(1, Math.floor(best / fanLen));
      fits = false;
    }
  }
  return { mount, fans, fits, len: fans * fanLen, thick: mm(28), fanThick: mm(27) };
}

export function gpuDims(part?: GpuPart, maxLenMm?: number) {
  const tdp = part?.tdp ?? 200;
  const rawLen = Math.max(170, Math.min(part?.lengthMm ?? 285, 360));
  const len = mm(maxLenMm ? Math.min(rawLen, maxLenMm) : rawLen);
  const width = mm(tdp > 300 ? 140 : tdp > 180 ? 125 : 110); // PCB height off the board
  const thick = mm(tdp > 300 ? 68 : tdp > 180 ? 50 : 40); // slot thickness
  const fans = tdp > 280 || (part?.lengthMm ?? 285) > 310 ? 3 : (part?.lengthMm ?? 285) > 220 ? 2 : 1;
  return { len, width, thick, fans };
}

export function psuDims(part?: PsuPart) {
  const ff = part?.formFactor ?? "ATX";
  if (ff === "ATX") return { w: mm(150), h: mm(86), d: mm((part?.wattage ?? 750) > 1000 ? 180 : 150) };
  return { w: mm(125), h: mm(63), d: mm(ff === "SFX-L" ? 130 : 100) };
}

/* ---------------- CPU ---------------- */

export function CpuModel({ part, ...p }: { part?: CpuPart } & MeshProps) {
  const v = cpuVendor(part);
  const accent = vendorColor(v);
  const socket = (part?.socket ?? "AM5").toUpperCase();
  const amd = v === "amd";
  const pga = socket === "AM4" || socket.startsWith("FM");
  // substrate footprint
  const sw = amd ? mm(40) : mm(45); // z (depth)
  const sh = amd ? mm(40) : mm(37.5); // y
  const sub = mm(3);
  const ihsW = amd ? mm(30) : mm(38);
  const ihsH = amd ? mm(30) : mm(31);

  return (
    <group>
      {/* substrate (green/black PCB) sits against the board */}
      <Box size={[sub, sh, sw]} position={[-sub / 2, 0, 0]} color={COL.pcbDark} metalness={0.2} roughness={0.8} {...p} />
      {/* IHS */}
      <Box
        size={[mm(3.2), ihsH, ihsW]}
        position={[-sub - mm(1.6), 0, 0]}
        color={COL.metal}
        metalness={0.95}
        roughness={0.18}
        {...p}
      />
      {/* AM5 style notched corner cut-outs around the IHS */}
      {amd &&
        [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ].map(([sy, sz]) => (
          <Box
            key={`${sy}${sz}`}
            size={[mm(3.4), mm(9), mm(9)]}
            position={[-sub - mm(1.6), sy * ihsH * 0.5, sz * ihsW * 0.5]}
            color={COL.pcbDark}
            metalness={0.3}
            roughness={0.7}
            {...p}
          />
        ))}
      {/* laser-etched label bar */}
      <Box size={[mm(0.6), mm(6), ihsW * 0.62]} position={[-sub - mm(3.3), 0, 0]} color={accent} metalness={0.3} roughness={0.4} emissive={0.25} {...p} />
      {/* triangle key corner */}
      <Box size={[mm(1), mm(3), mm(3)]} position={[-sub - mm(0.4), -sh * 0.42, -sw * 0.42]} color={COL.gold} metalness={1} roughness={0.3} {...p} />
      {/* underside: PGA pins (AM4) or LGA pads */}
      {pga
        ? Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 8 }).map((_, j) => (
              <Cyl
                key={`${i}-${j}`}
                args={[mm(0.7), mm(0.7), mm(2), 6]}
                rotation={[0, 0, Math.PI / 2]}
                position={[mm(1), (i - 3.5) * sh * 0.11, (j - 3.5) * sw * 0.11]}
                color={COL.gold}
                metalness={1}
                roughness={0.3}
                {...p}
              />
            )),
          )
        : Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={i}
              size={[mm(0.5), sh * 0.7, sw * 0.1]}
              position={[mm(0.3), 0, (i - 2.5) * sw * 0.14]}
              color={COL.gold}
              metalness={1}
              roughness={0.3}
              {...p}
            />
          ))}
    </group>
  );
}

/* ---------------- Motherboard ---------------- */

export function MotherboardModel({ part, ...p }: { part?: MotherboardPart } & MeshProps) {
  const L = mbLayout(part);
  const accent = brandAccent(part);
  const t = mm(1.6);
  return (
    <group>
      {/* PCB (behind the mounting face) */}
      <Box size={[t, L.h, L.d]} position={[t / 2, 0, 0]} color={COL.pcb} metalness={0.15} roughness={0.85} {...p} />
      {/* socket frame */}
      <Box size={[mm(4), mm(52), mm(52)]} position={[-mm(2), L.socket.y, L.socket.z]} color={COL.darkMetal} metalness={0.8} roughness={0.4} {...p} />
      <Box size={[mm(2), mm(42), mm(42)]} position={[-mm(4), L.socket.y, L.socket.z]} color={COL.black} metalness={0.5} roughness={0.6} {...p} />
      {/* VRM heatsinks above and behind the socket */}
      <Box size={[mm(24), mm(26), mm(46)]} position={[-mm(12), L.socket.y + mm(48), L.socket.z]} color={COL.heatsink} metalness={0.9} roughness={0.3} {...p} />
      <Box size={[mm(24), mm(70), mm(24)]} position={[-mm(12), L.socket.y, L.socket.z + mm(44)]} color={COL.heatsink} metalness={0.9} roughness={0.3} {...p} />
      <Box size={[mm(2), mm(4), mm(40)]} position={[-mm(24), L.socket.y + mm(48), L.socket.z]} color={accent} emissive={0.35} {...p} />
      {/* DIMM slots */}
      {Array.from({ length: L.dimm.count }).map((_, i) => (
        <Box
          key={i}
          size={[mm(6), mm(120), mm(6)]}
          position={[-mm(3), L.dimm.y, L.dimm.z - i * L.dimm.step]}
          color={i % 2 ? COL.plastic : accent}
          metalness={0.2}
          roughness={0.6}
          {...p}
        />
      ))}
      {/* PCIe x16 slots */}
      {L.pcie.map((s, i) => (
        <Box key={i} size={[mm(6), mm(8), mm(89)]} position={[-mm(3), s.y, s.z]} color={i === 0 ? COL.metal : COL.plastic} metalness={0.7} {...p} />
      ))}
      {/* M.2 shields */}
      {L.m2.map((s, i) => (
        <Box key={i} size={[mm(4), mm(24), mm(90)]} position={[-mm(2), s.y, s.z]} color={COL.metal} metalness={0.9} roughness={0.3} {...p} />
      ))}
      {/* chipset heatsink */}
      <Box size={[mm(8), mm(48), mm(48)]} position={[-mm(4), -L.h * 0.34, -L.d * 0.24]} color={COL.darkMetal} metalness={0.85} roughness={0.35} {...p} />
      <Box size={[mm(1.2), mm(6), mm(30)]} position={[-mm(8.5), -L.h * 0.34, -L.d * 0.24]} color={accent} emissive={0.3} {...p} />
      {/* rear I/O shroud */}
      <Box size={[mm(26), mm(56), mm(30)]} position={[-mm(13), L.h * 0.3, L.d * 0.43]} color={COL.plastic} metalness={0.4} roughness={0.6} {...p} />
      {/* EPS + 24-pin headers */}
      <Box size={[mm(8), mm(10), mm(20)]} position={[-mm(4), L.h * 0.46, L.d * 0.2]} color={COL.black} {...p} />
      <Box size={[mm(8), mm(22), mm(10)]} position={[-mm(4), L.h * 0.1, -L.d * 0.46]} color={COL.black} {...p} />
    </group>
  );
}

/* ---------------- RAM ---------------- */

export function RamModel({
  part,
  step,
  slots,
  ...p
}: { part?: RamPart; /** slot pitch in scene units */ step?: number; slots?: number } & MeshProps) {
  const maxSticks = Math.max(1, Math.min(slots ?? 4, 4));
  const sticks = Math.max(1, Math.min(part?.sticks ?? 2, maxSticks));
  const rgb = hasRgb(part);
  const accent = brandAccent(part);
  const len = mm(133);
  const tall = mm(rgb ? 44 : 34);
  const pitch = step ?? mm(11);
  return (
    <group>
      {Array.from({ length: sticks }).map((_, i) => (
        <group key={i} position={[0, 0, -i * pitch]}>
          {/* PCB */}
          <Box size={[mm(31), len, mm(1.6)]} position={[-mm(15.5), 0, 0]} color={COL.pcbLight} metalness={0.2} roughness={0.8} {...p} />
          {/* heatspreader */}
          <Box size={[tall, len * 0.98, mm(7)]} position={[-tall / 2 - mm(2), mm(2), 0]} color={COL.darkMetal} metalness={0.85} roughness={0.3} {...p} />
          <Box size={[tall * 0.5, len * 0.9, mm(7.6)]} position={[-tall * 0.6, mm(2), 0]} color={accent} metalness={0.6} roughness={0.35} {...p} />
          {/* RGB diffuser along the top edge */}
          {rgb && (
            <Box size={[mm(6), len * 0.92, mm(8)]} position={[-tall - mm(2), 0, 0]} color={COL.label} metalness={0.05} roughness={0.25} emissive={0.5} {...p} />
          )}
          {/* gold contacts at the slot edge */}
          <Box size={[mm(5), len * 0.92, mm(2)]} position={[-mm(2), 0, 0]} color={COL.gold} metalness={1} roughness={0.25} {...p} />
        </group>
      ))}
    </group>
  );
}

/* ---------------- GPU ---------------- */

export function GpuModel({
  part,
  maxLenMm,
  ...p
}: { part?: GpuPart; maxLenMm?: number } & MeshProps) {
  const { len, width, thick, fans } = gpuDims(part, maxLenMm);
  const v = gpuVendor(part);
  const accent = vendorColor(v);
  const shroud = v === "nvidia" ? "#1c2229" : v === "amd" ? "#1a1d24" : "#161e28";
  const conn = part?.pcieConnectors;
  const vhpwr = (conn?.pin12vhpwr ?? 0) > 0;
  const pin8 = conn?.pin8 ?? (vhpwr ? 0 : 2);
  // authored: bracket at z = 0, card extends toward -Z; body extends -X off the board
  const cz = -len / 2;
  return (
    <group>
      {/* PCB */}
      <Box size={[width * 0.8, mm(2), len * 0.92]} position={[-width * 0.4, thick * 0.42, cz]} color={COL.pcb} metalness={0.2} roughness={0.85} {...p} />
      {/* PCIe fingers riding in the slot */}
      <Box size={[mm(89) * 0.5, mm(4), mm(89)]} position={[-mm(24), thick * 0.42 - mm(3), -mm(50)]} color={COL.gold} metalness={1} roughness={0.25} {...p} />
      {/* shroud body */}
      <Box size={[width, thick, len]} position={[-width / 2, 0, cz]} color={shroud} metalness={0.45} roughness={0.5} {...p} />
      {/* backplate (board side) */}
      <Box size={[mm(3), thick * 0.95, len * 0.97]} position={[-mm(1.5), 0, cz]} color={COL.darkMetal} metalness={0.85} roughness={0.3} {...p} />
      {/* accent stripe along the visible edge */}
      <Box size={[width * 0.9, mm(4), mm(6)]} position={[-width / 2, thick / 2 - mm(4), cz + len / 2 - mm(14)]} color={accent} emissive={0.4} {...p} />
      <Box size={[mm(6), thick * 0.5, len * 0.5]} position={[-width + mm(2), 0, cz]} color={accent} metalness={0.5} roughness={0.4} emissive={0.15} {...p} />
      {/* fin stack peeking out of the shroud */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Box
          key={i}
          size={[width * 0.9, mm(1.2), len * 0.9]}
          position={[-width / 2, -thick * 0.36 + i * mm(2.4), cz]}
          color={COL.heatsink}
          metalness={0.9}
          roughness={0.3}
          {...p}
        />
      ))}
      {/* downward-facing fans */}
      {Array.from({ length: fans }).map((_, i) => {
        const span = len * 0.94;
        const size = Math.min(width * 0.86, span / fans);
        return (
          <group
            key={i}
            position={[-width / 2, -thick / 2 - mm(1), cz + (i - (fans - 1) / 2) * (span / fans)]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <FanUnit size={size} accent={accent} {...p} />
          </group>
        );
      })}
      {/* I/O bracket at the rear */}
      <Box size={[width * 0.95, mm(112), mm(2)]} position={[-width / 2, -mm(20), mm(2)]} color={COL.metal} metalness={0.95} roughness={0.25} {...p} />
      {[0, 1, 2].map((i) => (
        <Box key={i} size={[mm(18), mm(8), mm(4)]} position={[-width * 0.28 - i * mm(24), -mm(24), mm(4)]} color={COL.black} {...p} />
      ))}
      {/* power connectors on the top edge */}
      {vhpwr ? (
        <Box size={[mm(26), mm(12), mm(14)]} position={[-width * 0.45, thick / 2 + mm(5), cz + len * 0.18]} color={COL.black} {...p} />
      ) : (
        Array.from({ length: Math.max(1, pin8) }).map((_, i) => (
          <Box key={i} size={[mm(22), mm(12), mm(11)]} position={[-width * 0.45, thick / 2 + mm(5), cz + len * 0.2 - i * mm(14)]} color={COL.black} {...p} />
        ))
      )}
    </group>
  );
}

/* ---------------- Storage ---------------- */

export function StorageModel({ part, ...p }: { part?: StoragePart } & MeshProps) {
  const iface = part?.interface ?? "M.2 NVMe";
  const accent = brandAccent(part);
  if (iface.startsWith("M.2")) {
    // lies flat on the board: length along Z, width along Y, thickness along X
    return (
      <group>
        <Box size={[mm(2.4), mm(22), mm(80)]} position={[-mm(1.2), 0, 0]} color={COL.pcbLight} metalness={0.2} roughness={0.8} {...p} />
        <Box size={[mm(1.6), mm(16), mm(20)]} position={[-mm(3), 0, mm(14)]} color={COL.black} {...p} />
        <Box size={[mm(1.6), mm(16), mm(20)]} position={[-mm(3), 0, -mm(12)]} color={COL.black} {...p} />
        <Box size={[mm(1.4), mm(12), mm(12)]} position={[-mm(3), 0, mm(34)]} color={COL.metal} metalness={0.9} {...p} />
        <Box size={[mm(0.6), mm(14), mm(26)]} position={[-mm(3.9), 0, 0]} color={accent} metalness={0.3} roughness={0.4} {...p} />
        <Box size={[mm(2), mm(10), mm(4)]} position={[-mm(1.2), -mm(4), -mm(38)]} color={COL.gold} metalness={1} roughness={0.25} {...p} />
      </group>
    );
  }
  // 2.5" SATA drive: 100 x 70 x 7
  return (
    <group>
      <Box size={[mm(7), mm(70), mm(100)]} color={COL.metal} metalness={0.9} roughness={0.35} {...p} />
      <Box size={[mm(0.6), mm(46), mm(70)]} position={[-mm(3.8), 0, 0]} color={COL.label} metalness={0.05} roughness={0.9} {...p} />
      <Box size={[mm(0.8), mm(6), mm(34)]} position={[-mm(4.1), mm(16), 0]} color={accent} {...p} />
      <Box size={[mm(5), mm(10), mm(38)]} position={[0, -mm(24), mm(52)]} color={COL.black} {...p} />
    </group>
  );
}

/* ---------------- PSU ---------------- */

export function PsuModel({ part, ...p }: { part?: PsuPart } & MeshProps) {
  const { w, h, d } = psuDims(part);
  const accent = brandAccent(part);
  const modular = (part?.modular ?? "Full") !== "None";
  return (
    <group>
      <Box size={[w, h, d]} color={COL.darkMetal} metalness={0.85} roughness={0.4} {...p} />
      {/* intake fan on top */}
      <group position={[0, h / 2 + mm(0.5), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <FanUnit size={Math.min(w, d) * 0.82} accent={accent} {...p} />
      </group>
      {/* efficiency label on the visible side */}
      <Box size={[mm(1), h * 0.6, d * 0.6]} position={[-w / 2 - mm(0.5), 0, 0]} color={COL.label} metalness={0.05} roughness={0.9} {...p} />
      <Box size={[mm(1.2), h * 0.12, d * 0.4]} position={[-w / 2 - mm(1), h * 0.18, 0]} color={accent} {...p} />
      {/* AC inlet + switch at the rear */}
      <Box size={[w * 0.3, h * 0.4, mm(4)]} position={[w * 0.22, -h * 0.1, d / 2 + mm(2)]} color={COL.black} {...p} />
      {/* modular connector panel at the front */}
      {modular &&
        Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            size={[w * 0.18, h * 0.18, mm(4)]}
            position={[(i % 3) * w * 0.24 - w * 0.24, i < 3 ? h * 0.2 : -h * 0.16, -d / 2 - mm(2)]}
            color={COL.black}
            {...p}
          />
        ))}
    </group>
  );
}

/* ---------------- Case ---------------- */

export function CaseModel({ part, ...p }: { part?: CasePart } & MeshProps) {
  const { w, h, d } = caseDims(part);
  const accent = brandAccent(part);
  const t = mm(8);
  const mesh = /mesh|air|flow|4000d|h5 flow|pop air|north/.test(txt(part));
  const glass = !/silent|solid|pure base 500 (?!dx)/.test(txt(part));
  return (
    <group>
      {/* floor / roof / rear / tray-side panels */}
      <Box size={[w, t, d]} position={[0, -h / 2, 0]} color={COL.darkMetal} metalness={0.8} roughness={0.5} {...p} />
      <Box size={[w, t, d]} position={[0, h / 2, 0]} color={COL.darkMetal} metalness={0.8} roughness={0.5} {...p} />
      <Box size={[t, h, d]} position={[w / 2, 0, 0]} color={COL.plastic} metalness={0.6} roughness={0.6} {...p} />
      <Box size={[w, h, t]} position={[0, 0, d / 2]} color={COL.plastic} metalness={0.7} roughness={0.5} {...p} />
      {/* front panel: mesh grille or solid */}
      <Box size={[w * 0.98, h * 0.98, t * 0.6]} position={[0, 0, -d / 2]} color={mesh ? COL.fan : COL.plastic} metalness={0.4} roughness={0.75} {...p} />
      {mesh &&
        Array.from({ length: 10 }).map((_, i) => (
          <Box key={i} size={[w * 0.8, mm(4), mm(2)]} position={[0, h * 0.42 - i * (h * 0.09), -d / 2 - mm(3)]} color={COL.black} {...p} />
        ))}
      {/* front accent light bar */}
      <Box size={[mm(6), h * 0.8, mm(3)]} position={[-w * 0.44, 0, -d / 2 - mm(3)]} color={accent} emissive={0.5} {...p} />
      {/* tempered glass side */}
      {glass && (
        <mesh position={[-w / 2, 0, 0]}>
          <boxGeometry args={[mm(4), h * 0.96, d * 0.96]} />
          <meshStandardMaterial
            color={COL.glass}
            transparent
            opacity={p.ghost ? 0.05 : 0.12}
            metalness={0.2}
            roughness={0.05}
          />
        </mesh>
      )}
      {!glass && <Box size={[mm(4), h * 0.96, d * 0.96]} position={[-w / 2, 0, 0]} color={COL.plastic} metalness={0.6} roughness={0.6} {...p} />}
      {/* PSU shroud */}
      <Box size={[w * 0.92, mm(6), d * 0.62]} position={[0, -h / 2 + mm(110), d * 0.12]} color={COL.plastic} metalness={0.5} roughness={0.7} {...p} />
      {/* front intake fans */}
      {[0, 1].map((i) => (
        <group key={i} position={[0, h * 0.22 - i * mm(130), -d / 2 + mm(28)]}>
          <FanUnit size={mm(120)} accent={accent} {...p} />
        </group>
      ))}
      {/* rear exhaust fan */}
      <group position={[0, h * 0.3, d / 2 - mm(26)]}>
        <FanUnit size={mm(120)} accent={accent} {...p} />
      </group>
      {/* feet */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            size={[mm(20), mm(16), mm(20)]}
            position={[sx * (w / 2 - mm(24)), -h / 2 - mm(12), sz * (d / 2 - mm(30))]}
            color={COL.black}
            {...p}
          />
        )),
      )}
    </group>
  );
}

/* ---------------- Cooler ---------------- */

/** Air tower / AIO pump block. Authored on the board face at x = 0, growing toward -X. */
export function CoolerBlockModel({ part, ...p }: { part?: CoolerPart } & MeshProps) {
  const aio = (part?.type ?? "Air") === "AIO";
  const accent = brandAccent(part);
  if (aio) {
    return (
      <group>
        <Cyl args={[mm(38), mm(38), mm(52), 28]} rotation={[0, 0, Math.PI / 2]} position={[-mm(26), 0, 0]} color={COL.black} metalness={0.6} roughness={0.4} {...p} />
        <Cyl args={[mm(30), mm(30), mm(4), 28]} rotation={[0, 0, Math.PI / 2]} position={[-mm(53), 0, 0]} color={accent} metalness={0.3} roughness={0.3} {...p} />
        {/* tubes leaving the block toward the top of the case */}
        {[-1, 1].map((s) => (
          <Cyl key={s} args={[mm(9), mm(9), mm(120), 12]} position={[-mm(30), mm(60), s * mm(18)]} color={COL.plastic} metalness={0.3} roughness={0.7} {...p} />
        ))}
      </group>
    );
  }
  const height = mm(Math.max(60, Math.min(part?.heightMm || 158, 175)));
  const dual = (part?.tdpRating ?? 200) >= 250 || /dark rock pro|d15|dual tower|ak620|se-226/.test(txt(part));
  const fins = 26;
  return (
    <group>
      {/* mounting base + cold plate */}
      <Box size={[mm(14), mm(60), mm(60)]} position={[-mm(7), 0, 0]} color={COL.metal} metalness={0.95} roughness={0.2} {...p} />
      {/* heatpipes */}
      {[-24, -8, 8, 24].map((z) => (
        <Cyl key={z} args={[mm(3), mm(3), height - mm(20), 10]} rotation={[0, 0, Math.PI / 2]} position={[-height / 2, 0, mm(z)]} color={COL.metal} metalness={0.95} roughness={0.25} {...p} />
      ))}
      {/* fin stack(s): plates perpendicular to X */}
      {(dual ? [-1, 1] : [0]).map((tower) =>
        Array.from({ length: fins }).map((_, i) => (
          <Box
            key={`${tower}-${i}`}
            size={[mm(0.6), mm(130), mm(dual ? 42 : 52)]}
            position={[-mm(28) - i * ((height - mm(40)) / fins), mm(16), tower * mm(28)]}
            color={COL.heatsink}
            metalness={0.9}
            roughness={0.3}
            {...p}
          />
        )),
      )}
      {/* top plate */}
      <Box size={[height - mm(30), mm(6), mm(dual ? 116 : 56)]} position={[-height / 2 - mm(6), mm(80), 0]} color={COL.darkMetal} metalness={0.85} roughness={0.35} {...p} />
      <Box size={[height * 0.5, mm(2), mm(30)]} position={[-height / 2 - mm(6), mm(83.5), 0]} color={accent} emissive={0.3} {...p} />
      {/* front fan (blows front-to-back) */}
      <group position={[-height * 0.55, mm(14), -mm(dual ? 62 : 36)]}>
        <FanUnit size={mm(125)} accent={accent} {...p} />
      </group>
      {dual && (
        <group position={[-height * 0.55, mm(14), mm(62)]}>
          <FanUnit size={mm(125)} accent={accent} {...p} />
        </group>
      )}
    </group>
  );
}

/** AIO radiator + fans, authored lying flat with its length along Z (roof mount). */
export function AioRadiatorModel({ part, ...p }: { part?: CoolerPart } & MeshProps) {
  const rad = part?.radiatorMm ?? 240;
  const fans = Math.max(1, Math.round(rad / 120));
  const accent = brandAccent(part);
  const len = mm(fans * 122);
  return (
    <group>
      <Box size={[mm(120), mm(28), len]} color={COL.metal} metalness={0.9} roughness={0.35} {...p} />
      {Array.from({ length: 14 }).map((_, i) => (
        <Box key={i} size={[mm(116), mm(24), mm(2)]} position={[0, 0, -len / 2 + mm(10) + i * (len - mm(20)) / 13]} color={COL.darkMetal} metalness={0.8} {...p} />
      ))}
      {Array.from({ length: fans }).map((_, i) => (
        <group key={i} position={[0, -mm(28), (i - (fans - 1) / 2) * mm(122)]} rotation={[Math.PI / 2, 0, 0]}>
          <FanUnit size={mm(118)} accent={accent} {...p} />
        </group>
      ))}
    </group>
  );
}

export function CoolerModel({ part, ...p }: { part?: CoolerPart } & MeshProps) {
  const aio = (part?.type ?? "Air") === "AIO";
  return (
    <group>
      <CoolerBlockModel part={part} {...p} />
      {aio && (
        <group position={[-mm(30), mm(170), 0]}>
          <AioRadiatorModel part={part} {...p} />
        </group>
      )}
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
