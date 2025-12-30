import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";

// Human chromosome approximate sizes (in Mb, scaled)
const chromosomeSizes = [
  248.96, 242.19, 198.3, 190.21, 181.54, 170.81, 159.35, 145.14,
  138.39, 133.8, 135.09, 133.28, 114.36, 107.04, 101.99, 90.34,
  83.26, 80.37, 58.62, 64.44, 46.71, 50.82, 156.04, 57.23
];

const chromosomeNames = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"
];

interface ChromosomeProps {
  index: number;
  size: number;
  position: [number, number, number];
  selected: boolean;
  onSelect: (index: number) => void;
  showLabels: boolean;
}

const Chromosome = ({ index, size, position, selected, onSelect, showLabels }: ChromosomeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const scale = size / 250; // Normalize to largest chromosome
  const height = 2 + scale * 3;

  // Centromere position (varies by chromosome)
  const centromerePos = 0.3 + (index % 5) * 0.1;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(index);
  };

  return (
    <group position={position}>
      {/* P arm (short arm) */}
      <mesh
        ref={meshRef}
        position={[0, height * centromerePos / 2, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <capsuleGeometry args={[0.2, height * centromerePos, 8, 16]} />
        <meshStandardMaterial
          color={selected ? "#a855f7" : hovered ? "#6366f1" : "#4f46e5"}
          metalness={0.2}
          roughness={0.6}
          emissive={selected ? "#a855f7" : hovered ? "#6366f1" : "#000000"}
          emissiveIntensity={selected ? 0.3 : hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Centromere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Q arm (long arm) */}
      <mesh
        position={[0, -height * (1 - centromerePos) / 2, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <capsuleGeometry args={[0.2, height * (1 - centromerePos), 8, 16]} />
        <meshStandardMaterial
          color={selected ? "#a855f7" : hovered ? "#6366f1" : "#4f46e5"}
          metalness={0.2}
          roughness={0.6}
          emissive={selected ? "#a855f7" : hovered ? "#6366f1" : "#000000"}
          emissiveIntensity={selected ? 0.3 : hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Label */}
      {showLabels && (
        <Text
          position={[0, height * centromerePos + 0.8, 0]}
          fontSize={0.3}
          color={selected ? "#a855f7" : "#94a3b8"}
          anchorX="center"
          anchorY="bottom"
        >
          {chromosomeNames[index]}
        </Text>
      )}
    </group>
  );
};

interface ChromosomeSceneProps {
  selectedChromosome: number | null;
  onSelectChromosome: (index: number) => void;
  autoRotate: boolean;
  showLabels: boolean;
}

const ChromosomeScene = ({ selectedChromosome, onSelectChromosome, autoRotate, showLabels }: ChromosomeSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const cols = 6;
    const spacing = 1.2;

    chromosomeSizes.forEach((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos.push([
        (col - cols / 2 + 0.5) * spacing,
        0,
        (row - 2) * spacing * 1.5
      ]);
    });

    return pos;
  }, []);

  return (
    <group ref={groupRef}>
      {chromosomeSizes.map((size, i) => (
        <Chromosome
          key={i}
          index={i}
          size={size}
          position={positions[i]}
          selected={selectedChromosome === i}
          onSelect={onSelectChromosome}
          showLabels={showLabels}
        />
      ))}
    </group>
  );
};

interface ChromosomeBrowser3DProps {
  autoRotate?: boolean;
  showLabels?: boolean;
}

const ChromosomeBrowser3D = ({
  autoRotate = false,
  showLabels = true,
}: ChromosomeBrowser3DProps) => {
  const [selectedChromosome, setSelectedChromosome] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Selected chromosome info */}
      {selectedChromosome !== null && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">
                Chromosome {chromosomeNames[selectedChromosome]}
              </h4>
              <p className="text-sm text-muted-foreground">
                Size: ~{chromosomeSizes[selectedChromosome].toFixed(2)} Mb
              </p>
            </div>
            <button
              onClick={() => setSelectedChromosome(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="w-full h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 8, 10]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, 10, -5]} intensity={0.4} />
          <pointLight position={[0, 5, 0]} intensity={0.3} color="#a855f7" />

          <ChromosomeScene
            selectedChromosome={selectedChromosome}
            onSelectChromosome={setSelectedChromosome}
            autoRotate={autoRotate}
            showLabels={showLabels}
          />

          <OrbitControls enableZoom enablePan enableRotate />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-indigo-500" /> Chromosome arms
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" /> Centromere
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500" /> Selected
        </span>
        <span className="ml-auto">Click a chromosome to select</span>
      </div>
    </div>
  );
};

export default ChromosomeBrowser3D;
