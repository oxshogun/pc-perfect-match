import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ResolvedBuild } from "@/lib/pc/compat";
import type { PartCategory } from "@/lib/pc/types";
import {
  CaseModel,
  CoolerModel,
  CpuModel,
  GpuModel,
  MotherboardModel,
  PsuModel,
  RamModel,
  StorageModel,
} from "./partMeshes";

interface Props {
  resolved: ResolvedBuild;
  /** categories flagged with a compatibility error */
  faults?: PartCategory[];
}

function Rig({ resolved, faults = [] }: Props) {
  const f = (c: PartCategory) => faults.includes(c);
  const g = (has: boolean) => (has ? undefined : true);

  return (
    <group position={[0, -0.1, 0]}>
      {/* Chassis */}
      <group>
        <CaseModel part={resolved.case} ghost={g(!!resolved.case)} fault={f("case")} />
      </group>

      {/* Motherboard standing against the right panel */}
      <group position={[0.42, 0.2, 0.1]} rotation={[0, 0, Math.PI / 2]} scale={0.62}>
        <MotherboardModel
          part={resolved.motherboard}
          ghost={g(!!resolved.motherboard)}
          fault={f("motherboard")}
        />
      </group>

      {/* CPU on the board */}
      <group position={[0.3, 0.62, -0.25]} rotation={[0, 0, Math.PI / 2]} scale={0.3}>
        <CpuModel part={resolved.cpu} ghost={g(!!resolved.cpu)} fault={f("cpu")} />
      </group>

      {/* Cooler above the CPU */}
      <group position={[0.05, 0.62, -0.25]} rotation={[0, 0, Math.PI / 2]} scale={0.34}>
        <CoolerModel part={resolved.cooler} ghost={g(!!resolved.cooler)} fault={f("cooler")} />
      </group>

      {/* RAM sticks */}
      <group position={[0.2, 0.72, 0.28]} rotation={[0, Math.PI / 2, 0]} scale={0.34}>
        <RamModel part={resolved.ram[0]} ghost={g(resolved.ram.length > 0)} fault={f("ram")} />
      </group>

      {/* GPU in the top PCIe slot, length front-to-back */}
      <group position={[0.02, -0.05, 0.1]} rotation={[0, Math.PI / 2, 0]} scale={0.42}>
        <GpuModel part={resolved.gpu} ghost={g(!!resolved.gpu)} fault={f("gpu")} />
      </group>

      {/* PSU in the basement */}
      <group position={[0, -0.95, 0.35]} scale={0.44}>
        <PsuModel part={resolved.psu} ghost={g(!!resolved.psu)} fault={f("psu")} />
      </group>

      {/* Drives on the side tray */}
      {[0, 1].map((i) => (
        <group
          key={i}
          position={[0.3, -0.55 + i * 0.22, -0.55]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.24}
        >
          <StorageModel
            part={resolved.storage[i]}
            ghost={g(resolved.storage.length > i)}
            fault={f("storage")}
          />
        </group>
      ))}
    </group>
  );
}

export default function BuildViewer({ resolved, faults }: Props) {
  return (
    <Canvas
      camera={{ position: [-3.4, 1.9, 3.8], fov: 38 }}
      dpr={[1, 1.75]}
      style={{ background: "#0b1219" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 5, 5]} intensity={1.4} />
      <directionalLight position={[4, -1, -4]} intensity={0.6} color="#5fe4f0" />
      <pointLight position={[-1, 0.4, 1.2]} intensity={2.5} color="#5fe4f0" distance={4} />
      <Rig resolved={resolved} faults={faults} />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minDistance={3}
        maxDistance={9}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
