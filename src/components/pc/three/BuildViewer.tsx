import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
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
  gpuDims,
  mbLayout,
  psuDims,
  S,
} from "./partMeshes";

const mm = (v: number) => v * S;

type Vec3 = [number, number, number];

interface Props {
  resolved: ResolvedBuild;
  /** categories flagged with a compatibility error */
  faults?: PartCategory[];
  /** when true, parts drift apart along their install direction */
  explode?: boolean;
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
  children,
}: {
  base: Vec3;
  offset: Vec3;
  t: React.MutableRefObject<number>;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.position.set(
      base[0] + offset[0] * t.current,
      base[1] + offset[1] * t.current,
      base[2] + offset[2] * t.current,
    );
  });
  return (
    <group ref={ref} position={base}>
      {children}
    </group>
  );
}

function Rig({ resolved, faults = [], explode = false }: Props) {
  const f = (c: PartCategory) => faults.includes(c);
  const g = (has: boolean) => (has ? undefined : true);
  const t = useExplodeDriver(explode ? 1 : 0);

  const C = caseDims(resolved.case);
  const L = mbLayout(resolved.motherboard);
  const P = psuDims(resolved.psu);

  // Motherboard tray: mounting face a few mm inside the right panel,
  // board top-aligned under the roof, rear edge near the rear panel.
  const trayX = C.w / 2 - mm(30);
  const boardY = C.h / 2 - mm(40) - L.h / 2;
  const boardZ = C.d / 2 - mm(30) - L.d / 2;
  const onBoard = (localY: number, localZ: number): Vec3 => [
    trayX,
    boardY + localY,
    boardZ + localZ,
  ];

  const aio = (resolved.cooler?.type ?? "Air") === "AIO";
  const socket = onBoard(L.socket.y, L.socket.z);
  const slot0 = L.pcie[0];

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

  return (
    <group>
      <CaseModel part={resolved.case} ghost={g(!!resolved.case) ?? explode} fault={f("case")} />

      {/* Motherboard on the tray */}
      <Slot base={[trayX, boardY, boardZ]} offset={off.motherboard} t={t}>
        <MotherboardModel
          part={resolved.motherboard}
          ghost={g(!!resolved.motherboard)}
          fault={f("motherboard")}
        />
      </Slot>

      {/* CPU in the socket (sits just off the board face) */}
      <Slot base={[socket[0] - mm(5), socket[1], socket[2]]} offset={off.cpu} t={t}>
        <CpuModel part={resolved.cpu} ghost={g(!!resolved.cpu)} fault={f("cpu")} />
      </Slot>

      {/* Cooler mounted on the CPU */}
      <Slot base={[socket[0] - mm(12), socket[1], socket[2]]} offset={off.cooler} t={t}>
        <CoolerBlockModel
          part={resolved.cooler}
          ghost={g(!!resolved.cooler)}
          fault={f("cooler")}
        />
      </Slot>

      {/* AIO radiator on the roof */}
      {aio && (
        <Slot
          base={[trayX - mm(90), C.h / 2 - mm(40), boardZ + L.socket.z - mm(30)]}
          offset={off.radiator}
          t={t}
        >
          <AioRadiatorModel part={resolved.cooler} fault={f("cooler")} />
        </Slot>
      )}

      {/* RAM in the DIMM slots */}
      <Slot base={onBoard(L.dimm.y + mm(66), L.dimm.z)} offset={off.ram} t={t}>
        <RamModel part={resolved.ram[0]} ghost={g(resolved.ram.length > 0)} fault={f("ram")} />
      </Slot>

      {/* GPU in the top PCIe x16 slot, bracket at the rear panel */}
      <Slot
        base={[trayX - mm(6), boardY + slot0.y - mm(10), boardZ + slot0.z + mm(40)]}
        offset={off.gpu}
        t={t}
      >
        <GpuModel part={resolved.gpu} ghost={g(!!resolved.gpu)} fault={f("gpu")} />
      </Slot>

      {/* PSU in the basement, under the shroud */}
      <Slot
        base={[0, -C.h / 2 + mm(20) + P.h / 2, C.d / 2 - mm(30) - P.d / 2]}
        offset={off.psu}
        t={t}
      >
        <PsuModel part={resolved.psu} ghost={g(!!resolved.psu)} fault={f("psu")} />
      </Slot>

      {/* Storage: M.2 on the board, SATA drives on the shroud */}
      {[0, 1, 2].map((i) => {
        const part = resolved.storage[i];
        const isM2 = (part?.interface ?? "M.2 NVMe").startsWith("M.2");
        const anchor = L.m2[Math.min(i, L.m2.length - 1)];
        const base: Vec3 = isM2
          ? [trayX - mm(4), boardY + anchor.y, boardZ + anchor.z]
          : [-C.w / 2 + mm(60) + i * mm(20), -C.h / 2 + mm(122), C.d * 0.1];
        const dir = isM2 ? off.storageM2 : off.storageSata;
        const spread: Vec3 = [dir[0], dir[1] - i * mm(45), dir[2] - i * mm(35)];
        return (
          <Slot key={i} base={base} offset={spread} t={t}>
            <StorageModel
              part={part}
              ghost={g(resolved.storage.length > i)}
              fault={f("storage")}
            />
          </Slot>
        );
      })}
    </group>
  );
}

export default function BuildViewer({ resolved, faults, explode }: Props) {
  const C = caseDims(resolved.case);
  const span = Math.max(C.h, C.d);
  const dist = span * 2.1;

  return (
    <Canvas
      camera={{ position: [-dist * 0.62, span * 0.42, dist * 0.72], fov: 38 }}
      dpr={[1, 1.75]}
      style={{ background: "#0b1219" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[-4, 5, 5]} intensity={1.4} />
      <directionalLight position={[4, -1, -4]} intensity={0.6} color="#5fe4f0" />
      <pointLight position={[-0.6, 0.2, -0.4]} intensity={2.2} color="#5fe4f0" distance={3} />
      <Rig resolved={resolved} faults={faults} explode={explode} />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minDistance={span * 1.2}
        maxDistance={span * 6}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
