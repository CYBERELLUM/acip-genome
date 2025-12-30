import { Lightbulb, Dna, FlaskConical, BookOpen } from "lucide-react";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const prompts = [
  {
    icon: Dna,
    label: "CRISPR basics",
    prompt:
      "Explain the CRISPR-Cas9 mechanism and its applications in gene therapy.",
  },
  {
    icon: FlaskConical,
    label: "NGS pipelines",
    prompt:
      "What are the standard bioinformatics pipelines for next-generation sequencing data analysis?",
  },
  {
    icon: BookOpen,
    label: "Research trends",
    prompt:
      "What are the most significant recent breakthroughs in genomics and molecular biology?",
  },
  {
    icon: Lightbulb,
    label: "Experiment design",
    prompt:
      "Help me design a gene expression study using RNA-seq. What controls should I include?",
  },
];

export const QuickPrompts = ({ onSelect, disabled }: QuickPromptsProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-border/50">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider self-center mr-1">
        Quick
      </span>
      {prompts.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          <Icon className="w-3 h-3 text-primary" />
          {label}
        </button>
      ))}
    </div>
  );
};
