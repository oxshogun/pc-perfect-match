import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface Props {
  className?: string;
}

export function AiAssistantBox({ className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 md:p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          AI Build Assistant
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Coming soon — ask the assistant for part suggestions, compatibility
        help, or upgrade advice based on the build above.
      </p>
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-muted-foreground/70">
        <span className="flex-1">Ask anything about your build...</span>
        <span className="text-xs font-mono uppercase tracking-wider">Soon</span>
      </div>
    </div>
  );
}
