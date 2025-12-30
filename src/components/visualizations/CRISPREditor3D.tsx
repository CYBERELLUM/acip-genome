import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";

interface CRISPREditorProps {
  sequence: string;
  targetSite: number;
  autoRotate: boolean;
  editMode: "cut" | "insert" | "replace";
  onEdit?: (newSequence: string) => void;
}

const baseColors = {
  A: "#22c55e", // Green - Adenine
  T: "#ef4444", // Red - Thymine
  G: "#f59e0b", // Amber - Guanine
  C: "#3b82f6", // Blue - Cytosine
};

interface GuideRNAProps {
  position: [number, number, number];
  rotation: number;
  isActive: boolean;
}

// CRISPR Cas9 protein visualization
const Cas9Protein = ({ position, isActive }: { position: [number, number, number]; isActive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle pulsing when active
      const scale = isActive ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05 : 1;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Cas9 body */}
      <mesh>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial 
          color={isActive ? "#dc2626" : "#991b1b"} 
          metalness={0.4} 
          roughness={0.3}
          emissive={isActive ? "#dc2626" : "#000000"}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {/* Recognition domain */}
      <mesh position={[0.6, 0.3, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* Cutting domain (HNH) */}
      <mesh position={[-0.4, -0.3, 0.3]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial 
          color={isActive ? "#22c55e" : "#166534"} 
          metalness={0.5} 
          roughness={0.3}
          emissive={isActive ? "#22c55e" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
      
      {/* RuvC domain */}
      <mesh position={[0.4, -0.3, -0.3]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial 
          color={isActive ? "#22c55e" : "#166534"} 
          metalness={0.5} 
          roughness={0.3}
          emissive={isActive ? "#22c55e" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
};

// Guide RNA strand
const GuideRNA = ({ position, rotation, isActive }: GuideRNAProps) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      pts.push(new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * 0.3,
        t * 2 - 1,
        Math.cos(t * Math.PI * 2) * 0.3
      ));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <tubeGeometry args={[curve, 50, 0.05, 8, false]} />
        <meshStandardMaterial 
          color={isActive ? "#f97316" : "#ea580c"} 
          metalness={0.3} 
          roughness={0.4}
          emissive={isActive ? "#f97316" : "#000000"}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
};

// DNA strand with CRISPR target site highlighted
interface TargetDNAProps {
  sequence: string;
  targetSite: number;
  editMode: "cut" | "insert" | "replace";
  isEditing: boolean;
}

const TargetDNA = ({ sequence, targetSite, editMode, isEditing }: TargetDNAProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const basePairs = useMemo(() => {
    const pairs: { 
      base: string; 
      position: [number, number, number]; 
      rotation: number;
      isTarget: boolean;
      isCut: boolean;
    }[] = [];
    
    const upperSeq = sequence.toUpperCase();
    const PAM_LENGTH = 3; // PAM sequence length (NGG)
    const GUIDE_LENGTH = 20; // Guide RNA length

    for (let i = 0; i < Math.min(upperSeq.length, 40); i++) {
      const base = upperSeq[i];
      const y = i * 0.35 - (Math.min(upperSeq.length, 40) * 0.35) / 2;
      const rotation = i * 0.5;
      
      // Determine if this is in the target region
      const isTarget = i >= targetSite && i < targetSite + GUIDE_LENGTH;
      const isCut = editMode === "cut" && isEditing && i >= targetSite + 17 && i <= targetSite + 18;

      pairs.push({ base, position: [0, y, 0], rotation, isTarget, isCut });
    }

    return pairs;
  }, [sequence, targetSite, editMode, isEditing]);

  return (
    <group ref={groupRef}>
      {basePairs.map((pair, i) => {
        const complement = pair.base === 'A' ? 'T' : pair.base === 'T' ? 'A' : pair.base === 'G' ? 'C' : 'G';
        
        return (
          <group key={i} position={pair.position} rotation={[0, pair.rotation, 0]}>
            {/* Left backbone */}
            <mesh position={[-1.0, 0, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial 
                color={pair.isTarget ? "#7c3aed" : "#6366f1"} 
                metalness={0.3} 
                roughness={0.4}
              />
            </mesh>

            {/* Right backbone */}
            <mesh position={[1.0, 0, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial 
                color={pair.isTarget ? "#7c3aed" : "#6366f1"} 
                metalness={0.3} 
                roughness={0.4}
              />
            </mesh>

            {/* Left nucleotide */}
            {!pair.isCut && (
              <mesh position={[-0.5, 0, 0]}>
                <boxGeometry args={[0.3, 0.15, 0.25]} />
                <meshStandardMaterial 
                  color={baseColors[pair.base as keyof typeof baseColors] || "#888"}
                  metalness={0.2}
                  roughness={0.5}
                  emissive={pair.isTarget ? baseColors[pair.base as keyof typeof baseColors] : "#000000"}
                  emissiveIntensity={pair.isTarget ? 0.3 : 0}
                />
              </mesh>
            )}

            {/* Right nucleotide */}
            {!pair.isCut && (
              <mesh position={[0.5, 0, 0]}>
                <boxGeometry args={[0.3, 0.15, 0.25]} />
                <meshStandardMaterial 
                  color={baseColors[complement as keyof typeof baseColors] || "#888"}
                  metalness={0.2}
                  roughness={0.5}
                  emissive={pair.isTarget ? baseColors[complement as keyof typeof baseColors] : "#000000"}
                  emissiveIntensity={pair.isTarget ? 0.3 : 0}
                />
              </mesh>
            )}

            {/* Hydrogen bonds - break if cut */}
            {!pair.isCut && (
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
                <meshStandardMaterial 
                  color={pair.isTarget ? "#a855f7" : "#94a3b8"} 
                  opacity={0.6} 
                  transparent 
                />
              </mesh>
            )}

            {/* Cut visualization */}
            {pair.isCut && (
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.3, 0.05, 8, 16]} />
                <meshStandardMaterial 
                  color="#ef4444" 
                  emissive="#ef4444"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

interface CRISPRSceneProps {
  sequence: string;
  targetSite: number;
  autoRotate: boolean;
  editMode: "cut" | "insert" | "replace";
  isEditing: boolean;
}

const CRISPRScene = ({ sequence, targetSite, autoRotate, editMode, isEditing }: CRISPRSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cas9Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
    
    // Animate Cas9 approaching target
    if (cas9Ref.current) {
      const targetY = (targetSite * 0.35) - (Math.min(sequence.length, 40) * 0.35) / 2 + 3;
      const approachProgress = isEditing ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + 0.5;
      cas9Ref.current.position.y = THREE.MathUtils.lerp(targetY + 2, targetY, isEditing ? 1 : approachProgress);
      cas9Ref.current.position.x = isEditing ? 2.5 : 3 + approachProgress;
    }
  });

  const cas9Position: [number, number, number] = [
    3, 
    (targetSite * 0.35) - (Math.min(sequence.length, 40) * 0.35) / 2 + 3,
    0
  ];

  return (
    <group ref={groupRef}>
      <TargetDNA 
        sequence={sequence} 
        targetSite={targetSite} 
        editMode={editMode}
        isEditing={isEditing}
      />
      
      <group ref={cas9Ref}>
        <Cas9Protein position={[0, 0, 0]} isActive={isEditing} />
        <GuideRNA 
          position={[-0.8, -0.5, 0]} 
          rotation={Math.PI / 4} 
          isActive={isEditing}
        />
      </group>

      {/* Labels */}
      <Text position={[-2.5, 0, 0]} fontSize={0.25} color="#a855f7">
        Target Site
      </Text>
      <Text position={[4, cas9Position[1], 0]} fontSize={0.2} color="#dc2626">
        Cas9
      </Text>
      <Text position={[4, cas9Position[1] - 0.4, 0]} fontSize={0.15} color="#f97316">
        gRNA
      </Text>
    </group>
  );
};

interface CRISPREditor3DProps {
  sequence?: string;
  targetSite?: number;
  autoRotate?: boolean;
  editMode?: "cut" | "insert" | "replace";
  isEditing?: boolean;
}

const CRISPREditor3D = ({
  sequence = "ATGCGATCGATCGATCGATCGATCGATCGATCGATCGA",
  targetSite = 10,
  autoRotate = true,
  editMode = "cut",
  isEditing = false,
}: CRISPREditor3DProps) => {
  return (
    <div className="w-full h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[5, 0, 0]} intensity={0.5} color="#dc2626" />
        <pointLight position={[-5, 0, 0]} intensity={0.3} color="#a855f7" />
        
        <CRISPRScene 
          sequence={sequence} 
          targetSite={targetSite}
          autoRotate={autoRotate} 
          editMode={editMode}
          isEditing={isEditing}
        />
        
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  );
};

export default CRISPREditor3D;