import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import type { Part, PartCategory } from "@/lib/pc/types";
import { PartModel } from "./partMeshes";

interface Props {
  part?: Part;
  category?: PartCategory;
  /** disable user interaction (tiny thumbs) */
  static?: boolean;
}

export default function PartModelViewer({ part, category, static: isStatic }: Props) {
  return (
    <Canvas camera={{ position: [3.2, 2.2, 3.6], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#0d1520"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#5fe4f0" />
      <Stage intensity={0.25} environment={null} adjustCamera={1.35} shadows={false}>
        <PartModel part={part} category={category} />
      </Stage>
      <OrbitControls
        enablePan={false}
        enableZoom={!isStatic}
        enableRotate={!isStatic}
        autoRotate
        autoRotateSpeed={isStatic ? 2.5 : 1.2}
      />
    </Canvas>
  );
}
