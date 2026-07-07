import type { CompatIssue } from "@/lib/pc/types";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompatibilityPanel({ issues }: { issues: CompatIssue[] }) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");

  const status = errors.length
    ? { label: "Incompatible", tone: "destructive" as const, icon: XCircle }
    : warnings.length
    ? { label: "Compatible w/ warnings", tone: "warning" as const, icon: AlertTriangle }
    : { label: "All clear", tone: "success" as const, icon: CheckCircle2 };

  const StatusIcon = status.icon;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 border-b border-border",
          status.tone === "destructive" && "bg-destructive/10",
          status.tone === "warning" && "bg-warning/10",
          status.tone === "success" && "bg-success/10",
        )}
      >
        <StatusIcon
          className={cn(
            "h-5 w-5",
            status.tone === "destructive" && "text-destructive",
            status.tone === "warning" && "text-warning",
            status.tone === "success" && "text-success",
          )}
        />
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Compatibility scan
          </p>
          <p
            className={cn(
              "font-semibold",
              status.tone === "destructive" && "text-destructive",
              status.tone === "warning" && "text-warning",
              status.tone === "success" && "text-success",
            )}
          >
            {status.label}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <Counter label="err" count={errors.length} tone="destructive" />
          <Counter label="warn" count={warnings.length} tone="warning" />
          <Counter label="info" count={infos.length} tone="muted" />
        </div>
      </div>

      <ul className="divide-y divide-border max-h-[420px] overflow-y-auto">
        {issues.length === 0 ? (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Add some parts to run the compatibility engine.
          </li>
        ) : (
          issues.map((i) => <IssueRow key={i.id} issue={i} />)
        )}
      </ul>
    </div>
  );
}

function Counter({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "destructive" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5",
        tone === "destructive" && "border-destructive/40 text-destructive",
        tone === "warning" && "border-warning/40 text-warning",
        tone === "muted" && "border-border text-muted-foreground",
      )}
    >
      <span className="tabular-nums">{count}</span>
      <span className="uppercase tracking-widest text-[9px]">{label}</span>
    </span>
  );
}

function IssueRow({ issue }: { issue: CompatIssue }) {
  const Icon =
    issue.level === "error" ? XCircle : issue.level === "warning" ? AlertTriangle : Info;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon
        className={cn(
          "h-4 w-4 mt-0.5 shrink-0",
          issue.level === "error" && "text-destructive",
          issue.level === "warning" && "text-warning",
          issue.level === "info" && "text-muted-foreground",
        )}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{issue.title}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1">
            {issue.category}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{issue.detail}</p>
      </div>
    </li>
  );
}
