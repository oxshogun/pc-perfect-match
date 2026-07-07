import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, type Part, type PartCategory } from "@/lib/pc/types";
import { useParts } from "@/lib/pc/store";
import { PartForm } from "./PartForm";
import { Plus, Search, Package } from "lucide-react";
import { partSummary } from "./partSummary";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: PartCategory;
  onPick: (part: Part) => void;
  multiple?: boolean;
}

export function PartPickerDialog({ open, onOpenChange, category, onPick, multiple }: Props) {
  const parts = useParts();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"browse" | "create">("browse");

  const list = useMemo(() => {
    const filtered = parts.filter((p) => p.category === category);
    if (!q.trim()) return filtered;
    const needle = q.toLowerCase();
    return filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.brand ?? "").toLowerCase().includes(needle),
    );
  }, [parts, category, q]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setMode("browse");
      }}
    >
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-widest text-sm">
            <Package className="h-4 w-4 text-primary" />
            {mode === "create" ? "Add" : "Select"} · {CATEGORY_LABEL[category]}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Enter specs — used for compatibility checks."
              : `${list.length} in library. ${multiple ? "You can add multiple." : ""}`}
          </DialogDescription>
        </DialogHeader>

        {mode === "browse" ? (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name or brand"
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={() => setMode("create")}>
                <Plus className="h-4 w-4 mr-1" /> New part
              </Button>
            </div>

            <div className="max-h-[420px] overflow-y-auto -mx-1 px-1 space-y-1.5">
              {list.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    No {CATEGORY_LABEL[category].toLowerCase()} in library yet.
                  </p>
                  <Button className="mt-3" onClick={() => setMode("create")}>
                    <Plus className="h-4 w-4 mr-1" /> Add first part
                  </Button>
                </div>
              ) : (
                list.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onPick(p);
                      if (!multiple) onOpenChange(false);
                    }}
                    className="w-full text-left rounded-md border border-border bg-surface hover:border-primary/60 hover:bg-surface-elevated transition-colors p-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {p.brand && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase tracking-wider"
                            >
                              {p.brand}
                            </Badge>
                          )}
                          <span className="font-medium text-foreground truncate">{p.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground font-mono">
                          {partSummary(p)}
                        </p>
                      </div>
                      {p.price != null && (
                        <span className="font-mono text-sm text-primary shrink-0">
                          ${p.price}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <PartForm
            category={category}
            onCancel={() => setMode("browse")}
            onSaved={(p) => {
              setMode("browse");
              onPick(p);
              if (!multiple) onOpenChange(false);
            }}
          />
        )}

        {mode === "browse" && (
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
