import { useState } from "react";
import type { Part } from "@/lib/pc/types";
import { clearMyPrice, setMyPrice } from "@/lib/pc/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  part: Part;
  onClose: () => void;
}

export function PriceEditDialog({ part, onClose }: Props) {
  const [price, setPrice] = useState(part.price != null ? String(part.price) : "");
  const [asin, setAsin] = useState(part.asin ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = price.trim() === "" ? null : Number(price);
    if (parsed != null && (!Number.isFinite(parsed) || parsed < 0)) {
      toast.error("Enter a valid price");
      return;
    }
    const code = asin.trim().toUpperCase();
    if (code && !/^[A-Z0-9]{10}$/.test(code)) {
      toast.error("Amazon product code must be 10 letters or numbers");
      return;
    }
    setSaving(true);
    try {
      await setMyPrice(part.id, parsed, code || null);
      toast.success("Your price saved");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      await clearMyPrice(part.id);
      toast.success("Back to the shared price");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-sm">Your price</DialogTitle>
          <DialogDescription>
            {part.name} — only you see this price. The shared list stays unchanged.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="own-price">Price (USD)</Label>
            <Input
              id="own-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 429"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="own-asin">Amazon product code (optional)</Label>
            <Input
              id="own-asin"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              placeholder="10 letters/numbers from the Amazon link"
            />
            <p className="text-xs text-muted-foreground">
              Add this and “Update my prices” can pull the current price in for you.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={reset} disabled={saving || !part.hasOverride}>
            Reset to shared price
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
