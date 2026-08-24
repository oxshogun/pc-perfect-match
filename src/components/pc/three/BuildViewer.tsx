import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

interface Props {
  resolved: ResolvedBuild;
  /** categories flagged with a compatibility error */
  faults?: PartCategory[];
}

function Rig({ resolved, faults = [] }: Props) {
  const f = (c: PartCategory) => faults.includes(c);
  const g = (has: boolean) => (has ? undefined : true);

  const C = caseDims(resolved.case);
  const L = mbLayout(resolved.motherboard);
  const G = gpuDims(resolved.gpu);
  const P = psuDims(resolved.psu);

  // Motherboard tray: mounting face a few mm inside the right panel,
  // board top-aligned under the roof, rear edge near the rear panel.
  const trayX = C.w / 2 - mm(30);
  const boardY = C.h / 2 - mm(40) - L.h / 2;
  const boardZ = C.d / 2 - mm(30) - L.d / 2;
  const onBoard = (localY: number, localZ: number): [number, number, number] => [
    trayX,
    boardY + localY,
    boardZ + localZ,
  ];

  const aio = (resolved.cooler?.type ?? "Air") === "AIO";
  const socket = onBoard(L.socket.y, L.socket.z);
  const slot0 = L.pcie[0];

  return (
    <group>
      <CaseModel part={resolved.case} ghost={g(!!resolved.case)} fault={f("case")} />

      {/* Motherboard on the tray */}
      <group position={[trayX, boardY, boardZ]}>
        <MotherboardModel
          part={resolved.motherboard}
          ghost={g(!!resolved.motherboard)}
          fault={f("motherboard")}
        />
      </group>

      {/* CPU in the socket (sits just off the board face) */}
      <group position={[socket[0] - mm(5), socket[1], socket[2]]}>
        <CpuModel part={resolved.cpu} ghost={g(!!resolved.cpu)} fault={f("cpu")} />
      </group>

      {/* Cooler mounted on the CPU */}
      <group position={[socket[0] - mm(12), socket[1], socket[2]]}>
        <CoolerBlockModel
          part={resolved.cooler}
          ghost={g(!!resolved.cooler)}
          fault={f("cooler")}
        />
      </group>

      {/* AIO radiator on the roof */}
      {aio && (
        <group position={[trayX - mm(90), C.h / 2 - mm(40), boardZ + L.socket.z - mm(30)]}>
          <AioRadiatorModel part={resolved.cooler} fault={f("cooler")} />
        </group>
      )}

      {/* RAM in the DIMM slots */}
      <group position={onBoard(L.dimm.y + mm(66), L.dimm.z)}>
        <RamModel part={resolved.ram[0]} ghost={g(resolved.ram.length > 0)} fault={f("ram")} />
      </group>

      {/* GPU in the top PCIe x16 slot, bracket at the rear panel */}
      <group position={[trayX - mm(6), boardY + slot0.y - mm(10), boardZ + slot0.z + mm(40)]}>
        <GpuModel part={resolved.gpu} ghost={g(!!resolved.gpu)} fault={f("gpu")} />
      </group>

      {/* PSU in the basement, under the shroud */}
      <group position={[0, -C.h / 2 + mm(20) + P.h / 2, C.d / 2 - mm(30) - P.d / 2]}>
        <PsuModel part={resolved.psu} ghost={g(!!resolved.psu)} fault={f("psu")} />
      </group>

      {/* Storage: M.2 on the board, SATA drives on the shroud */}
      {[0, 1, 2].map((i) => {
        const part = resolved.storage[i];
        const isM2 = (part?.interface ?? "M.2 NVMe").startsWith("M.2");
        const anchor = L.m2[Math.min(i, L.m2.length - 1)];
        const pos: [number, number, number] = isM2
          ? [trayX - mm(4), boardY + anchor.y, boardZ + anchor.z]
          : [-C.w / 2 + mm(60) + i * mm(20), -C.h / 2 + mm(122), C.d * 0.1];
        return (
          <group key={i} position={pos}>
            <StorageModel
              part={part}
              ghost={g(resolved.storage.length > i)}
              fault={f("storage")}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function BuildViewer({ resolved, faults }: Props) {
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
      <Rig resolved={resolved} faults={faults} />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minDistance={span * 1.2}
        maxDistance={span * 5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
