import { useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ResolvedBuild } from "@/lib/pc/compat";
import type { PartCategory } from "@/lib/pc/types";
import {
  AioRadiatorModel,
  CaseModel,
  CoolerBlockModel,
  CpuModel,
  GpuModel,
  MotherboardModel,
  PsuModel,
  RamModel,
  StorageModel,
  caseDims,
  caseInterior,
  mbLayout,
  psuDims,
  radiatorPlan,
  S,
} from "./partMeshes";

const mm = (v: number) => v * S;
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

type Vec3 = [number, number, number];

interface Props {
  resolved: ResolvedBuild;
  /** categories flagged with a compatibility error */
  faults?: PartCategory[];
  /** when true, parts drift apart along their install direction */
  explode?: boolean;
  /** currently selected part category (explode mode) */
  selected?: PartCategory | null;
  onSelect?: (c: PartCategory | null) => void;
}

/** eased explode amount, shared by every part group */
function useExplodeDriver(target: number) {
  const t = useRef(0);
  const goal = useRef(target);
  goal.current = target;
  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.001, delta); // smooth, frame-rate independent
    t.current += (goal.current - t.current) * k;
  });
  return t;
}

/** Positions children at `base`, drifting toward `base + offset` as explode ramps up. */
function Slot({
  base,
  offset,
  t,
  category,
  selectable,
  onSelect,
  children,
}: {
  base: Vec3;
  offset: Vec3;
  t: React.MutableRefObject<number>;
  category?: PartCategory;
  selectable?: boolean;
  onSelect?: (c: PartCategory | null) => void;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const [hover, setHover] = useState(false);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.set(
      base[0] + offset[0] * t.current,
      base[1] + offset[1] * t.current,
      base[2] + offset[2] * t.current,
    );
    const s = hover && selectable ? 1.04 : 1;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.25);
  });
  const pick = selectable && category && onSelect;
  return (
    <group
      ref={ref}
      position={base}
      onPointerOver={
        pick
          ? (e) => {
              e.stopPropagation();
              setHover(true);
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        pick
          ? () => {
              setHover(false);
              document.body.style.cursor = "";
            }
          : undefined
      }
      onClick={
        pick
          ? (e) => {
              e.stopPropagation();
              onSelect(category);
            }
          : undefined
      }
    >
      {children}
    </group>
  );
}

function Rig({ resolved, faults = [], explode = false, selected, onSelect }: Props) {
  const f = (c: PartCategory) => faults.includes(c);
  const dim = (c: PartCategory) => !!selected && selected !== c;
  const g = (has: boolean, c: PartCategory) => (!has || dim(c) ? true : undefined);
  const t = useExplodeDriver(explode ? 1 : 0);

  const C = caseDims(resolved.case);
  const I = caseInterior(resolved.case);
  const L = mbLayout(resolved.motherboard);
  const P = psuDims(resolved.psu);
  const rad = radiatorPlan(resolved.cooler, resolved.case);

  // Motherboard tray: mounting face just inside the right panel,
  // board top-aligned under the roof, rear edge near the rear panel.
  const trayX = I.hx - mm(8);
  const boardY = clamp(I.hy - mm(30) - L.h / 2, -I.hy + L.h / 2, I.hy - L.h / 2);
  const boardZ = clamp(I.hz - mm(20) - L.d / 2, -I.hz + L.d / 2, I.hz - L.d / 2);
  const onBoard = (localY: number, localZ: number): Vec3 => [
    trayX,
    boardY + localY,
    boardZ + localZ,
  ];

  const aio = (resolved.cooler?.type ?? "Air") === "AIO";
  const socket = onBoard(L.socket.y, L.socket.z);

  // radiator anchor, kept fully inside the interior volume
  const radBase: Vec3 = aio
    ? rad.mount === "roof"
      ? [
          clamp(trayX - mm(70), -I.hx + mm(62), I.hx - mm(62)),
          I.hy - mm(18),
          clamp(boardZ + L.socket.z, -I.hz + rad.len / 2, I.hz - rad.len / 2),
        ]
      : [
          clamp(trayX - mm(70), -I.hx + mm(62), I.hx - mm(62)),
          clamp(0, -I.hy + rad.len / 2, I.hy - rad.len / 2),
          -I.hz + mm(48),
        ]
    : [0, 0, 0];

  const slot0 = L.pcie[0];
  const gpuBase: Vec3 = [
    trayX - mm(7),
    clamp(boardY + slot0.y - mm(8), -I.hy + mm(80), I.hy - mm(20)),
    I.hz - mm(8),
  ];

  // Explode directions: each subsystem pulls away along the axis it installs on,
  // in assembly order (board out of the case, then CPU, cooler, RAM, GPU, PSU, drives).
  const off = useMemo(
    () => ({
      motherboard: [-mm(130), mm(30), 0] as Vec3,
      cpu: [-mm(230), mm(120), 0] as Vec3,
      cooler: [-mm(330), mm(200), 0] as Vec3,
      radiator: [-mm(300), mm(260), -mm(60)] as Vec3,
      ram: [-mm(180), mm(210), mm(30)] as Vec3,
      gpu: [-mm(260), -mm(60), mm(120)] as Vec3,
      psu: [-mm(120), -mm(180), mm(60)] as Vec3,
      storageM2: [-mm(210), mm(40), -mm(140)] as Vec3,
      storageSata: [-mm(150), -mm(120), -mm(160)] as Vec3,
    }),
    [],
  );

  const sel = { selectable: explode, onSelect };

  return (
    <group>
      <CaseModel
        part={resolved.case}
        ghost={!resolved.case || explode || dim("case") ? true : undefined}
        fault={f("case")}
      />

      {/* Motherboard on the tray */}
      <Slot base={[trayX, boardY, boardZ]} offset={off.motherboard} t={t} category="motherboard" {...sel}>
        <MotherboardModel
          part={resolved.motherboard}
          ghost={g(!!resolved.motherboard, "motherboard")}
          fault={f("motherboard")}
        />
      </Slot>

      {/* CPU in the socket (sits just off the board face) */}
      <Slot base={[socket[0] - mm(5), socket[1], socket[2]]} offset={off.cpu} t={t} category="cpu" {...sel}>
        <CpuModel part={resolved.cpu} ghost={g(!!resolved.cpu, "cpu")} fault={f("cpu")} />
      </Slot>

      {/* Cooler mounted on the CPU, height capped by the case clearance */}
      <Slot base={[socket[0] - mm(12), socket[1], socket[2]]} offset={off.cooler} t={t} category="cooler" {...sel}>
        <CoolerBlockModel
          part={resolved.cooler}
          maxHeightMm={resolved.case?.maxCoolerHeightMm}
          ghost={g(!!resolved.cooler, "cooler")}
          fault={f("cooler")}
        />
      </Slot>

      {/* AIO radiator on the roof (or front, if the roof can't take it) */}
      {aio && (
        <Slot base={radBase} offset={off.radiator} t={t} category="cooler" {...sel}>
          <group rotation={rad.mount === "front" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
            <AioRadiatorModel
              part={resolved.cooler}
              fans={rad.fans}
              ghost={dim("cooler") ? true : undefined}
              fault={f("cooler") || !rad.fits}
            />
          </group>
        </Slot>
      )}

      {/* RAM seated in the DIMM slots */}
      <Slot
        base={[trayX - mm(6), boardY + L.dimm.y, boardZ + L.dimm.z]}
        offset={off.ram}
        t={t}
        category="ram"
        {...sel}
      >
        <RamModel
          part={resolved.ram[0]}
          step={L.dimm.step}
          slots={L.dimm.count}
          ghost={g(resolved.ram.length > 0, "ram")}
          fault={f("ram")}
        />
      </Slot>

      {/* GPU in the top PCIe x16 slot, bracket at the rear panel */}
      <Slot base={gpuBase} offset={off.gpu} t={t} category="gpu" {...sel}>
        <GpuModel
          part={resolved.gpu}
          maxLenMm={resolved.case?.maxGpuLengthMm}
          ghost={g(!!resolved.gpu, "gpu")}
          fault={f("gpu")}
        />
      </Slot>

      {/* PSU in the basement, under the shroud */}
      <Slot
        base={[
          clamp(0, -I.hx + P.w / 2, I.hx - P.w / 2),
          -I.hy + P.h / 2 + mm(4),
          clamp(I.hz - mm(12) - P.d / 2, -I.hz + P.d / 2, I.hz - P.d / 2),
        ]}
        offset={off.psu}
        t={t}
        category="psu"
        {...sel}
      >
        <PsuModel part={resolved.psu} ghost={g(!!resolved.psu, "psu")} fault={f("psu")} />
      </Slot>

      {/* Storage: M.2 on the board, SATA drives on the shroud */}
      {[0, 1, 2].map((i) => {
        const part = resolved.storage[i];
        const isM2 = (part?.interface ?? "M.2 NVMe").startsWith("M.2");
        const anchor = L.m2[Math.min(i, L.m2.length - 1)];
        const base: Vec3 = isM2
          ? [trayX - mm(4), boardY + anchor.y, boardZ + anchor.z]
          : [
              clamp(-I.hx + mm(40) + i * mm(12), -I.hx + mm(12), I.hx - mm(12)),
              clamp(-I.hy + mm(160), -I.hy + mm(40), I.hy - mm(40)),
              clamp(-mm(20), -I.hz + mm(55), I.hz - mm(55)),
            ];
        const dir = isM2 ? off.storageM2 : off.storageSata;
        const spread: Vec3 = [dir[0], dir[1] - i * mm(45), dir[2] - i * mm(35)];
        return (
          <Slot key={i} base={base} offset={spread} t={t} category="storage" {...sel}>
            <StorageModel
              part={part}
              ghost={g(resolved.storage.length > i, "storage")}
              fault={f("storage")}
            />
          </Slot>
        );
      })}
    </group>
  );
}

export default function BuildViewer({
  resolved,
  faults,
  explode,
  selected,
  onSelect,
  controlsRef,
}: Props & { controlsRef?: React.Ref<OrbitControlsImpl> }) {
  const C = caseDims(resolved.case);
  const span = Math.max(C.h, C.d);
  const dist = span * 2.1;

  return (
    <Canvas
      camera={{ position: [-dist * 0.62, span * 0.42, dist * 0.72], fov: 38 }}
      dpr={[1, 1.75]}
      style={{ background: "#0b1219" }}
      onPointerMissed={() => onSelect?.(null)}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[-4, 5, 5]} intensity={1.4} />
      <directionalLight position={[4, -1, -4]} intensity={0.6} color="#5fe4f0" />
      <pointLight position={[-0.6, 0.2, -0.4]} intensity={2.2} color="#5fe4f0" distance={3} />
      <Rig
        resolved={resolved}
        faults={faults}
        explode={explode}
        selected={selected}
        onSelect={onSelect}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        autoRotate={!selected}
        autoRotateSpeed={0.8}
        minDistance={span * 1.2}
        maxDistance={span * 6}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
