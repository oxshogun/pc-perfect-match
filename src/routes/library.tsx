import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CATEGORY_LABEL, CATEGORY_ORDER, type Part, type PartCategory } from "@/lib/pc/types";
import {
  applyPriceUpdates,
  deletePart,
  getLastPriceRefresh,
  isPriceRefreshDue,
  useAuthUser,
  useInvalidateAll,
  useIsAdmin,
  useParts,
} from "@/lib/pc/store";
import { fetchAmazonPrices, fetchMyPrices } from "@/lib/prices.functions";
import { seedCatalog } from "@/lib/parts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartForm } from "@/components/pc/PartForm";
import { partSummary } from "@/components/pc/partSummary";
import { PartThumb } from "@/components/pc/PartThumb";
import { PriceEditDialog } from "@/components/pc/PriceEditDialog";
import { Search, Plus, Pencil, Trash2, RefreshCw, DollarSign } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Parts library — RIG.LAB" },
      { name: "description", content: "Manage your custom PC parts library." },
    ],
  }),
  component: LibraryPage,
});

function timeAgo(ts?: number) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}


function LibraryPage() {
  const parts = useParts();
  const auth = useAuthUser();
  const isAdmin = useIsAdmin();
  const invalidateAll = useInvalidateAll();
  const [filter, setFilter] = useState<PartCategory | "all">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Part | null>(null);
  const [creating, setCreating] = useState<PartCategory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Part | null>(null);
  const [pricing, setPricing] = useState<Part | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const refresh = useServerFn(fetchAmazonPrices);
  const refreshMine = useServerFn(fetchMyPrices);
  const seed = useServerFn(seedCatalog);
  const autoRan = useRef(false);
  const isSignedIn = Boolean(auth.data);

  const catalogCount = useMemo(() => parts.filter((p) => p.visibility === "catalog").length, [parts]);
  const privateCount = parts.length - catalogCount;

  const partsWithAsin = useMemo(
    () => parts.filter((p) => p.asin && /^[A-Z0-9]{10}$/i.test(p.asin)),
    [parts],
  );

  async function runRefresh(silent = false) {
    if (refreshing) return;
    if (!isSignedIn) return;
    if (partsWithAsin.length === 0) {
      if (!silent) toast.info("Add an Amazon ASIN to a part first");
      return;
    }
    setRefreshing(true);
    try {
      const call = isAdmin ? refresh : refreshMine;
      const { results } = await call({
        data: { items: partsWithAsin.map((p) => ({ id: p.id, asin: p.asin! })) },
      });
      applyPriceUpdates(results);
      invalidateAll();
      setLastRefresh(getLastPriceRefresh());
      const ok = results.filter((r) => r.price != null).length;
      const failed = results.length - ok;
      if (!silent || ok > 0) {
        toast.success(
          `Updated ${ok} price${ok === 1 ? "" : "s"}${failed ? ` · ${failed} failed` : ""}`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  async function runSeed() {
    if (seeding) return;
    setSeeding(true);
    try {
      const result = await seed();
      invalidateAll();
      toast.success(result.inserted ? `Loaded ${result.inserted} catalog parts` : "Catalog already loaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Catalog seed failed");
    } finally {
      setSeeding(false);
    }
  }

  // Auto-refresh once per 24h when the library is opened.
  useEffect(() => {
    setLastRefresh(getLastPriceRefresh());
    if (autoRan.current) return;
    autoRan.current = true;
    if (isSignedIn && isPriceRefreshDue() && parts.some((p) => p.asin)) {
      void runRefresh(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const filtered = useMemo(() => {
    return parts.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return p.name.toLowerCase().includes(needle) || (p.brand ?? "").toLowerCase().includes(needle);
    });
  }, [parts, filter, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Inventory</p>
          <h1 className="text-3xl font-bold tracking-tight">Parts library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {catalogCount} catalog parts{privateCount ? ` · ${privateCount} private` : ""}
            {lastRefresh ? ` · prices ${timeAgo(lastRefresh)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && catalogCount === 0 && (
            <Button variant="outline" onClick={runSeed} disabled={seeding}>
              <Plus className="h-4 w-4 mr-1" /> {seeding ? "Loading…" : "Load default catalog"}
            </Button>
          )}
          {isSignedIn && (
            <Button
              variant="outline"
              onClick={() => runRefresh(false)}
              disabled={refreshing || partsWithAsin.length === 0}
              title={
                partsWithAsin.length === 0
                  ? "Add an Amazon ASIN to a part to enable price updates"
                  : "Fetch latest Amazon prices"
              }
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing…" : isAdmin ? "Refresh prices" : "Update my prices"}
            </Button>
          )}
        </div>
      </div>


      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-widest border transition ${
            filter === "all"
              ? "bg-primary/15 border-primary/50 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All · {parts.length}
        </button>
        {CATEGORY_ORDER.map((c) => {
          const count = parts.filter((p) => p.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-widest border transition ${
                filter === c
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABEL[c]} · {count}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="pl-8"
          />
        </div>
        {filter !== "all" && isSignedIn && (
          <Button onClick={() => setCreating(filter)}>
            <Plus className="h-4 w-4 mr-1" /> Add {CATEGORY_LABEL[filter]}
          </Button>
        )}
        {filter !== "all" && !isSignedIn && (
          <Button asChild variant="outline">
            <Link to="/auth" search={{ next: "/library" }}>Sign in to add</Link>
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">Nothing here yet.</p>
          {filter !== "all" && isSignedIn && (
            <Button className="mt-3" onClick={() => setCreating(filter)}>
              <Plus className="h-4 w-4 mr-1" /> Add first {CATEGORY_LABEL[filter].toLowerCase()}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 transition"
            >
              <PartThumb category={p.category} src={p.imageUrl} alt={p.name} size="md" part={p} />
              <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest">
                {CATEGORY_LABEL[p.category]}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.brand && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {p.brand}
                    </span>
                  )}
                  <span className="font-medium truncate">{p.name}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{partSummary(p)}</p>
              </div>
              {p.price != null && (
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono text-sm text-primary">
                    ${p.price}
                    {p.hasOverride && <span className="ml-1 text-[9px] uppercase tracking-widest text-muted-foreground">yours</span>}
                  </span>
                  {p.priceUpdatedAt && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {timeAgo(p.priceUpdatedAt)}
                    </span>
                  )}
                </div>
              )}

              {isSignedIn && p.visibility === "catalog" && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Set your own price"
                  onClick={() => setPricing(p)}
                  className={p.hasOverride ? "text-primary" : ""}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}

              {(p.visibility !== "catalog" || isAdmin) && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete(p)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <Dialog open onOpenChange={(v) => !v && (setEditing(null), setCreating(null))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-sm">
                {editing ? "Edit" : "Add"} · {CATEGORY_LABEL[(editing?.category ?? creating)!]}
              </DialogTitle>
            </DialogHeader>
            <PartForm
              category={(editing?.category ?? creating)!}
              initial={editing ?? undefined}
              visibility={editing?.visibility ?? (isAdmin ? "catalog" : "private")}
              onCancel={() => {
                setEditing(null);
                setCreating(null);
              }}
              onSaved={() => {
                toast.success(editing ? "Part updated" : "Part added");
                setEditing(null);
                setCreating(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {pricing && <PriceEditDialog part={pricing} onClose={() => setPricing(null)} />}

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete part?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{confirmDelete?.name}” from the library and any builds using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  void deletePart(confirmDelete.id);
                  toast.success("Part deleted");
                }
                setConfirmDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
