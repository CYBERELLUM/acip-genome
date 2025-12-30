import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Simplified amino acid properties for coloring
const aminoAcidColors: Record<string, string> = {
  // Hydrophobic - orange
  A: "#f97316", L: "#f97316", I: "#f97316", V: "#f97316", M: "#f97316", F: "#f97316", W: "#f97316", P: "#f97316",
  // Polar - green
  S: "#22c55e", T: "#22c55e", N: "#22c55e", Q: "#22c55e", Y: "#22c55e", C: "#22c55e",
  // Positive - blue
  K: "#3b82f6", R: "#3b82f6", H: "#3b82f6",
  // Negative - red
  D: "#ef4444", E: "#ef4444",
  // Special
  G: "#a855f7",
};

interface AtomProps {
  position: [number, number, number];
  color: string;
  size: number;
}

const Atom = ({ position, color, size }: AtomProps) => (
  <mesh position={position}>
    <sphereGeometry args={[size, 16, 16]} />
    <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
  </mesh>
);

interface RibbonSegmentProps {
  points: THREE.Vector3[];
  color: string;
}

const RibbonSegment = ({ points, color }: RibbonSegmentProps) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 50, 0.15, 8, false]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
    </mesh>
  );
};

interface ProteinSceneProps {
  sequence: string;
  viewMode: "ribbon" | "spheres" | "backbone";
  autoRotate: boolean;
  colorBy: "residue" | "structure" | "chain";
}

const ProteinScene = ({ sequence, viewMode, autoRotate, colorBy }: ProteinSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Generate a mock 3D structure from sequence (in reality would come from PDB)
  const structure = useMemo(() => {
    const residues: { position: THREE.Vector3; aa: string; index: number }[] = [];
    const upperSeq = sequence.toUpperCase().replace(/[^A-Z]/g, "");

    // Create a helical fold pattern for visualization
    for (let i = 0; i < Math.min(upperSeq.length, 100); i++) {
      const t = i * 0.2;
      const radius = 2 + Math.sin(i * 0.1) * 0.5;
      const x = radius * Math.cos(t);
      const y = i * 0.15 - (Math.min(upperSeq.length, 100) * 0.15) / 2;
      const z = radius * Math.sin(t);

      residues.push({
        position: new THREE.Vector3(x, y, z),
        aa: upperSeq[i] || "G",
        index: i,
      });
    }

    return residues;
  }, [sequence]);

  const ribbonPoints = useMemo(() => structure.map((r) => r.position), [structure]);

  const getColor = (aa: string, index: number): string => {
    if (colorBy === "residue") {
      return aminoAcidColors[aa] || "#94a3b8";
    } else if (colorBy === "structure") {
      // Simulate secondary structure coloring
      const section = Math.floor(index / 10) % 3;
      if (section === 0) return "#ef4444"; // Helix - red
      if (section === 1) return "#3b82f6"; // Sheet - blue
      return "#22c55e"; // Coil - green
    } else {
      return "#6366f1"; // Single chain color
    }
  };

  return (
    <group ref={groupRef}>
      {viewMode === "ribbon" && ribbonPoints.length > 2 && (
        <RibbonSegment points={ribbonPoints} color="#6366f1" />
      )}

      {viewMode === "spheres" &&
        structure.map((residue, i) => (
          <Atom
            key={i}
            position={[residue.position.x, residue.position.y, residue.position.z]}
            color={getColor(residue.aa, i)}
            size={0.3}
          />
        ))}

      {viewMode === "backbone" && (
        <>
          {ribbonPoints.length > 2 && <RibbonSegment points={ribbonPoints} color="#94a3b8" />}
          {structure.map((residue, i) => (
            <Atom
              key={i}
              position={[residue.position.x, residue.position.y, residue.position.z]}
              color={getColor(residue.aa, i)}
              size={0.15}
            />
          ))}
        </>
      )}
    </group>
  );
};

interface ProteinViewer3DProps {
  sequence?: string;
  autoRotate?: boolean;
}

const ProteinViewer3D = ({
  sequence = "MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQQIA",
  autoRotate = true,
}: ProteinViewer3DProps) => {
  const [viewMode, setViewMode] = useState<"ribbon" | "spheres" | "backbone">("ribbon");
  const [colorBy, setColorBy] = useState<"residue" | "structure" | "chain">("structure");

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-mono">View Mode</label>
          <div className="flex gap-1">
            {(["ribbon", "spheres", "backbone"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                  viewMode === mode
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-mono">Color By</label>
          <div className="flex gap-1">
            {(["residue", "structure", "chain"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorBy(mode)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                  colorBy === mode
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <pointLight position={[0, 5, 5]} intensity={0.5} color="#6366f1" />

          <ProteinScene
            sequence={sequence}
            viewMode={viewMode}
            autoRotate={autoRotate}
            colorBy={colorBy}
          />

          <OrbitControls enableZoom enablePan enableRotate />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {colorBy === "residue" && (
          <>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" /> Hydrophobic
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" /> Polar
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" /> Positive
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" /> Negative
            </span>
          </>
        )}
        {colorBy === "structure" && (
          <>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" /> α-Helix
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" /> β-Sheet
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" /> Coil
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ProteinViewer3D;
