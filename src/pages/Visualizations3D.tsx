import { Navigation } from "@/components/layout/Navigation";
import { ParallaxSection } from "@/components/layout/ParallaxSection";
import { useState, Suspense } from "react";
import { Dna, Box, Layers, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Lazy load heavy 3D components
import DNAHelix3D from "@/components/visualizations/DNAHelix3D";
import ProteinViewer3D from "@/components/visualizations/ProteinViewer3D";
import ChromosomeBrowser3D from "@/components/visualizations/ChromosomeBrowser3D";

const tabs = [
  { id: "dna", label: "DNA Helix", icon: Dna },
  { id: "protein", label: "Protein Structure", icon: Box },
  { id: "chromosome", label: "Chromosome Browser", icon: Layers },
];

const Loader = () => (
  <div className="w-full h-[500px] bg-secondary/30 rounded-lg flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Visualizations3D = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dna" | "protein" | "chromosome">("dna");
  const [dnaSequence, setDnaSequence] = useState("ATGCGATCGATCGATCGATCGATCGATCGA");
  const [proteinSequence, setProteinSequence] = useState("MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQQIA");
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ParallaxSection className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Box className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">3D Visualizations</h1>
            <p className="text-muted-foreground">Please sign in to access 3D visualization tools.</p>
          </div>
        </ParallaxSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <ParallaxSection className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6">
              <Box className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-accent">Molecular Visualization</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              3D <span className="text-gradient-accent">Visualizations</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore DNA structures, protein folds, and chromosomes in interactive 3D.
              Rotate, zoom, and analyze molecular structures.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="card-scientific mb-8">
            <div className="flex flex-wrap gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Auto-rotate</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Show labels</span>
              </label>

              {activeTab === "dna" && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-muted-foreground mb-1 font-mono">DNA Sequence</label>
                  <input
                    type="text"
                    value={dnaSequence}
                    onChange={(e) => setDnaSequence(e.target.value.toUpperCase().replace(/[^ATGC]/g, ""))}
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Enter DNA sequence (A, T, G, C)"
                  />
                </div>
              )}

              {activeTab === "protein" && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-muted-foreground mb-1 font-mono">Protein Sequence</label>
                  <input
                    type="text"
                    value={proteinSequence}
                    onChange={(e) => setProteinSequence(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Enter amino acid sequence"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="card-scientific">
            <Suspense fallback={<Loader />}>
              {activeTab === "dna" && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Dna className="w-5 h-5 text-primary" />
                    DNA Double Helix
                  </h3>
                  <DNAHelix3D sequence={dnaSequence} autoRotate={autoRotate} showLabels={showLabels} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Showing {Math.min(dnaSequence.length, 30)} base pairs. Drag to rotate, scroll to zoom.
                  </p>
                </div>
              )}

              {activeTab === "protein" && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-primary" />
                    Protein Structure
                  </h3>
                  <ProteinViewer3D sequence={proteinSequence} autoRotate={autoRotate} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Showing {Math.min(proteinSequence.length, 100)} residues. Choose view mode and color scheme above.
                  </p>
                </div>
              )}

              {activeTab === "chromosome" && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Human Chromosome Browser
                  </h3>
                  <ChromosomeBrowser3D autoRotate={autoRotate} showLabels={showLabels} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Showing all 24 human chromosomes (1-22, X, Y). Click to select and view details.
                  </p>
                </div>
              )}
            </Suspense>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card-scientific text-center">
              <Dna className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">DNA Helix</h4>
              <p className="text-sm text-muted-foreground">
                Visualize the iconic double helix structure with color-coded base pairs (A-T, G-C).
              </p>
            </div>
            <div className="card-scientific text-center">
              <Box className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">Protein Viewer</h4>
              <p className="text-sm text-muted-foreground">
                Explore protein folding patterns with ribbon, sphere, and backbone rendering modes.
              </p>
            </div>
            <div className="card-scientific text-center">
              <Layers className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">Chromosomes</h4>
              <p className="text-sm text-muted-foreground">
                Browse the complete set of human chromosomes with size-proportional visualization.
              </p>
            </div>
          </div>
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Visualizations3D;
