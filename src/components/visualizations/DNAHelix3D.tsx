import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface BasePairProps {
  position: [number, number, number];
  rotation: number;
  baseType: "AT" | "TA" | "GC" | "CG";
  index: number;
}

const baseColors = {
  A: "#22c55e", // Green - Adenine
  T: "#ef4444", // Red - Thymine
  G: "#f59e0b", // Amber - Guanine
  C: "#3b82f6", // Blue - Cytosine
};

const BasePair = ({ position, rotation, baseType, index }: BasePairProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [base1, base2] = baseType.split("") as ["A" | "T" | "G" | "C", "A" | "T" | "G" | "C"];

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Left backbone sphere */}
      <mesh position={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Right backbone sphere */}
      <mesh position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Left nucleotide */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color={baseColors[base1]} metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Right nucleotide */}
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color={baseColors[base2]} metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Hydrogen bonds (connecting lines) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#94a3b8" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#94a3b8" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};

interface BackboneStrandProps {
  points: THREE.Vector3[];
  color: string;
}

const BackboneStrand = ({ points, color }: BackboneStrandProps) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 100, 0.08, 8, false]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
    </mesh>
  );
};

interface DNAHelixSceneProps {
  sequence: string;
  autoRotate: boolean;
  showLabels: boolean;
}

const DNAHelixScene = ({ sequence, autoRotate, showLabels }: DNAHelixSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  const basePairs = useMemo(() => {
    const pairs: { type: "AT" | "TA" | "GC" | "CG"; position: [number, number, number]; rotation: number }[] = [];
    const upperSeq = sequence.toUpperCase();

    for (let i = 0; i < Math.min(upperSeq.length, 30); i++) {
      const base = upperSeq[i];
      let pairType: "AT" | "TA" | "GC" | "CG" = "AT";

      if (base === "A") pairType = "AT";
      else if (base === "T") pairType = "TA";
      else if (base === "G") pairType = "GC";
      else if (base === "C") pairType = "CG";

      const y = i * 0.4 - (Math.min(upperSeq.length, 30) * 0.4) / 2;
      const rotation = i * 0.6; // ~34 degrees per base pair (DNA twist)

      pairs.push({ type: pairType, position: [0, y, 0], rotation });
    }

    return pairs;
  }, [sequence]);

  const { leftBackbone, rightBackbone } = useMemo(() => {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];

    basePairs.forEach((pair, i) => {
      const y = pair.position[1];
      const rotation = pair.rotation;
      left.push(new THREE.Vector3(-1.2 * Math.cos(rotation), y, -1.2 * Math.sin(rotation)));
      right.push(new THREE.Vector3(1.2 * Math.cos(rotation), y, 1.2 * Math.sin(rotation)));
    });

    return { leftBackbone: left, rightBackbone: right };
  }, [basePairs]);

  return (
    <group ref={groupRef}>
      {/* Base pairs */}
      {basePairs.map((pair, i) => (
        <BasePair
          key={i}
          position={pair.position}
          rotation={pair.rotation}
          baseType={pair.type}
          index={i}
        />
      ))}

      {/* Backbone strands */}
      {leftBackbone.length > 1 && <BackboneStrand points={leftBackbone} color="#a855f7" />}
      {rightBackbone.length > 1 && <BackboneStrand points={rightBackbone} color="#a855f7" />}

      {/* Labels */}
      {showLabels && (
        <>
          <Text position={[-2, 0, 0]} fontSize={0.3} color="#22c55e">
            5'
          </Text>
          <Text position={[2, 0, 0]} fontSize={0.3} color="#ef4444">
            3'
          </Text>
        </>
      )}
    </group>
  );
};

interface DNAHelix3DProps {
  sequence?: string;
  autoRotate?: boolean;
  showLabels?: boolean;
}

const DNAHelix3D = ({
  sequence = "ATGCGATCGATCGATCGATCGATCGATCGA",
  autoRotate = true,
  showLabels = true,
}: DNAHelix3DProps) => {
  return (
    <div className="w-full h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#a855f7" />
        
        <DNAHelixScene sequence={sequence} autoRotate={autoRotate} showLabels={showLabels} />
        
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  );
};

export default DNAHelix3D;
