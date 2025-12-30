import ReactMarkdown from "react-markdown";
import { Bot, User, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  onOpenSources?: (sources: string[]) => void;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  sources,
  onOpenSources,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn("flex gap-3", role === "user" && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm",
          role === "user"
            ? "bg-accent/20 text-accent ring-1 ring-accent/30"
            : "bg-primary/20 text-primary ring-1 ring-primary/30"
        )}
      >
        {role === "user" ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message bubble */}
      <div className={cn("max-w-[85%] group", role === "user" && "text-right")}>
        <div
          className={cn(
            "inline-block p-4 rounded-xl shadow-sm",
            role === "user"
              ? "bg-accent/10 border border-accent/30"
              : "bg-secondary/80 border border-border"
          )}
        >
          {/* Markdown content */}
          <div className="prose prose-sm prose-invert max-w-none text-foreground leading-relaxed prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/60 prose-pre:border prose-pre:border-border/50 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Sources badge row */}
          {sources && sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <button
                onClick={() => onOpenSources?.(sources)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                {sources.length} source{sources.length > 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>

        {/* Copy + timestamp row */}
        <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {role === "assistant" && (
            <button
              onClick={copyToClipboard}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
          <span className="text-[10px] text-muted-foreground font-mono">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
