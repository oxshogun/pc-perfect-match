import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface Props {
  className?: string;
}

export function BuildGuide({ className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 md:p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          How to build a PC
        </h2>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          A PC is a set of parts that work together. The CPU and GPU handle the
          processing, RAM holds data the system is actively using, storage keeps
          your files and games, the motherboard connects everything, the PSU
          delivers power, and the case and cooler keep it all safe and cool.
        </p>
        <p>
          To build a complete PC you need one of each part shown below. Pick a
          part in each slot and the workbench will check compatibility, estimate
          wattage, and show you the finished rig in 3D.
        </p>
      </div>
    </div>
  );
}
