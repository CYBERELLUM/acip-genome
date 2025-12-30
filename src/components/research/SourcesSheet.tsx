import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, Sparkles } from "lucide-react";

interface SourcesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: string[];
}

export const SourcesSheet = ({
  open,
  onOpenChange,
  sources,
}: SourcesSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[360px] sm:w-[420px] bg-background/95 backdrop-blur-xl border-l border-border">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Sources
          </SheetTitle>
          <SheetDescription>
            Providers that contributed to this response
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {sources.map((source, idx) => (
            <div
              key={source + idx}
              className="flex items-center gap-3 p-4 rounded-lg bg-secondary/60 border border-border hover:border-primary/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{source}</p>
                <p className="text-xs text-muted-foreground">AI Model</p>
              </div>
            </div>
          ))}

          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sources available for this message.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
