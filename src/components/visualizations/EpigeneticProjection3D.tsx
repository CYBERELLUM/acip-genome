import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, PerspectiveCamera, Line } from "@react-three/drei";
import * as THREE from "three";

interface MethylationSite {
  position: number;
  level: number; // 0-1 methylation level
  gene: string;
  isProjected?: boolean;
}

interface EpigeneticProjection3DProps {
  methylationData?: MethylationSite[];
  projectionYears?: number;
  showProjection?: boolean;
  autoRotate?: boolean;
  viewMode?: "landscape" | "timeline" | "comparison";
}

// Methylation marker on DNA
const MethylationMarker = ({ 
  position, 
  level, 
  isProjected,
  gene 
}: { 
  position: [number, number, number]; 
  level: number; 
  isProjected: boolean;
  gene: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isProjected) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  // Color based on methylation level (high = red/aged, low = green/young)
  const color = new THREE.Color().lerpColors(
    new THREE.Color("#22c55e"), // Young/unmethylated
    new THREE.Color("#ef4444"), // Aged/methylated
    level
  );

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15 + level * 0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.3}
          roughness={0.4}
          transparent={isProjected}
          opacity={isProjected ? 0.7 : 1}
          emissive={color}
          emissiveIntensity={isProjected ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Methylation group (CH3) representation */}
      <mesh position={[0, 0.25, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial 
          color="#fbbf24"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

// Epigenetic clock visualization
const EpigeneticClock = ({ 
  biologicalAge, 
  chronologicalAge,
  projectedAge 
}: { 
  biologicalAge: number; 
  chronologicalAge: number;
  projectedAge: number;
}) => {
  const clockRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (clockRef.current) {
      clockRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  });

  const bioAngle = (biologicalAge / 100) * Math.PI * 2;
  const chronoAngle = (chronologicalAge / 100) * Math.PI * 2;
  const projAngle = (projectedAge / 100) * Math.PI * 2;

  return (
    <group position={[5, 0, 0]}>
      {/* Clock face */}
      <mesh>
        <ringGeometry args={[1.8, 2, 64]} />
        <meshStandardMaterial color="#374151" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Clock markings */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0.1]}>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        );
      })}

      {/* Chronological age hand (gray) */}
      <mesh position={[Math.cos(chronoAngle - Math.PI/2) * 0.7, Math.sin(chronoAngle - Math.PI/2) * 0.7, 0.1]} rotation={[0, 0, chronoAngle]}>
        <boxGeometry args={[1.4, 0.08, 0.05]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Biological age hand (colored by health) */}
      <mesh position={[Math.cos(bioAngle - Math.PI/2) * 0.6, Math.sin(bioAngle - Math.PI/2) * 0.6, 0.15]} rotation={[0, 0, bioAngle]}>
        <boxGeometry args={[1.2, 0.1, 0.05]} />
        <meshStandardMaterial 
          color={biologicalAge < chronologicalAge ? "#22c55e" : "#ef4444"}
          emissive={biologicalAge < chronologicalAge ? "#22c55e" : "#ef4444"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Projected age hand (dashed effect) */}
      <mesh position={[Math.cos(projAngle - Math.PI/2) * 0.5, Math.sin(projAngle - Math.PI/2) * 0.5, 0.2]} rotation={[0, 0, projAngle]}>
        <boxGeometry args={[1.0, 0.06, 0.05]} />
        <meshStandardMaterial 
          color="#a855f7"
          transparent
          opacity={0.6}
          emissive="#a855f7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Center */}
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} />
      </mesh>

      {/* Labels */}
      <Text position={[0, -2.5, 0]} fontSize={0.2} color="#9ca3af">
        Epigenetic Clock
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.15} color="#6b7280">
        Bio: {biologicalAge}y | Chrono: {chronologicalAge}y
      </Text>
    </group>
  );
};

// DNA strand with methylation sites
const EpigeneticDNA = ({ 
  methylationData,
  showProjection 
}: { 
  methylationData: MethylationSite[];
  showProjection: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create DNA backbone curve
  const backbonePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const y = t * 10 - 5;
      points.push(new THREE.Vector3(Math.sin(t * Math.PI * 4) * 0.5, y, Math.cos(t * Math.PI * 4) * 0.5));
    }
    return points;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(backbonePoints), [backbonePoints]);

  return (
    <group ref={groupRef} position={[-3, 0, 0]}>
      {/* DNA backbone */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.08, 8, false]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Methylation markers */}
      {methylationData.map((site, i) => {
        const t = (site.position % 50) / 50;
        const y = t * 10 - 5;
        const x = Math.sin(t * Math.PI * 4) * 0.5;
        const z = Math.cos(t * Math.PI * 4) * 0.5;
        
        return (
          <MethylationMarker
            key={i}
            position={[x + 0.3, y, z]}
            level={site.level}
            isProjected={site.isProjected || false}
            gene={site.gene}
          />
        );
      })}

      {/* Labels */}
      <Text position={[0, -6, 0]} fontSize={0.2} color="#a855f7">
        Methylation Landscape
      </Text>
    </group>
  );
};

// Projection timeline graph
const ProjectionTimeline = ({ 
  currentAge,
  projectionYears,
  methylationTrend 
}: { 
  currentAge: number;
  projectionYears: number;
  methylationTrend: number; // positive = aging faster, negative = aging slower
}) => {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= projectionYears; i++) {
      const x = (i / projectionYears) * 6 - 3;
      const baseY = (currentAge + i) / 100 * 3 - 1.5;
      const trendEffect = methylationTrend * i * 0.1;
      pts.push([x, baseY + trendEffect, 0]);
    }
    return pts;
  }, [currentAge, projectionYears, methylationTrend]);

  return (
    <group position={[0, -4, 0]}>
      {/* Axis */}
      <Line 
        points={[[-3.5, 0, 0], [3.5, 0, 0]]} 
        color="#6b7280" 
        lineWidth={2}
      />
      <Line 
        points={[[-3, -1.5, 0], [-3, 2, 0]]} 
        color="#6b7280" 
        lineWidth={2}
      />

      {/* Projection line */}
      <Line 
        points={points} 
        color="#a855f7" 
        lineWidth={3}
      />

      {/* Ideal aging line */}
      <Line 
        points={[[-3, -1, 0], [3, 1, 0]]} 
        color="#22c55e" 
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />

      {/* Labels */}
      <Text position={[0, -0.5, 0]} fontSize={0.15} color="#9ca3af">
        Years from now
      </Text>
      <Text position={[-3.8, 0, 0]} fontSize={0.12} color="#9ca3af" rotation={[0, 0, Math.PI/2]}>
        Bio Age
      </Text>
    </group>
  );
};

interface EpigeneticSceneProps {
  methylationData: MethylationSite[];
  projectionYears: number;
  showProjection: boolean;
  autoRotate: boolean;
  biologicalAge: number;
  chronologicalAge: number;
}

const EpigeneticScene = ({ 
  methylationData, 
  projectionYears, 
  showProjection, 
  autoRotate,
  biologicalAge,
  chronologicalAge
}: EpigeneticSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Calculate projected biological age based on methylation trend
  const avgMethylation = methylationData.reduce((sum, site) => sum + site.level, 0) / methylationData.length;
  const methylationTrend = avgMethylation > 0.5 ? 0.5 : -0.3;
  const projectedAge = biologicalAge + (projectionYears * (1 + methylationTrend));

  return (
    <group ref={groupRef}>
      <EpigeneticDNA 
        methylationData={methylationData} 
        showProjection={showProjection}
      />
      
      <EpigeneticClock 
        biologicalAge={biologicalAge}
        chronologicalAge={chronologicalAge}
        projectedAge={projectedAge}
      />

      {showProjection && (
        <ProjectionTimeline 
          currentAge={biologicalAge}
          projectionYears={projectionYears}
          methylationTrend={methylationTrend}
        />
      )}
    </group>
  );
};

// Default methylation data based on common aging biomarkers
const DEFAULT_METHYLATION_DATA: MethylationSite[] = [
  { position: 5, level: 0.3, gene: "ELOVL2" },
  { position: 10, level: 0.5, gene: "FHL2" },
  { position: 15, level: 0.7, gene: "KLF14" },
  { position: 20, level: 0.4, gene: "TRIM59" },
  { position: 25, level: 0.6, gene: "SIRT1", isProjected: true },
  { position: 30, level: 0.8, gene: "DNMT3A", isProjected: true },
  { position: 35, level: 0.5, gene: "TET2" },
  { position: 40, level: 0.3, gene: "FOXO3", isProjected: true },
  { position: 45, level: 0.65, gene: "TERT", isProjected: true },
];

const EpigeneticProjection3D = ({
  methylationData = DEFAULT_METHYLATION_DATA,
  projectionYears = 10,
  showProjection = true,
  autoRotate = true,
  viewMode = "landscape",
}: EpigeneticProjection3DProps) => {
  // Simulate biological vs chronological age
  const chronologicalAge = 45;
  const biologicalAge = 42; // Younger than chrono = healthy

  return (
    <div className="w-full h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 15]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.4} color="#a855f7" />
        <pointLight position={[5, 0, 0]} intensity={0.3} color="#22c55e" />
        
        <EpigeneticScene 
          methylationData={methylationData}
          projectionYears={projectionYears}
          showProjection={showProjection}
          autoRotate={autoRotate}
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
        />
        
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  );
};

export default EpigeneticProjection3D;