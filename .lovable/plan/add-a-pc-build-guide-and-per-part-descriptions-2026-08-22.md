# Add a PC build guide and per-part descriptions

## Goal
Add a short, non-technical guide to the top of the workbench, a one-line description under every part slot, and a placeholder box at the bottom for a future AI assistant. Keep the existing builder, 3D preview, and theme system untouched.

## Plan

1. **Create a reusable `BuildGuide` card**
   - New file: `src/components/pc/BuildGuide.tsx`
   - Render a compact card with a title like "How to build a PC" and 2–3 short paragraphs:
     - What a PC is at a high level (CPU, motherboard, RAM, GPU, storage, PSU, case, cooler).
     - How the parts work together (motherboard connects everything, PSU powers it, CPU/GPU process, RAM/storage hold data, case/cooler keep it safe and cool).
     - Note that the slots below are the parts needed for a complete build.
   - Use theme-aware classes (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`) so it recolors with the active theme.

2. **Add per-category descriptions**
   - New file: `src/lib/pc/guide.ts` (or extend `src/lib/pc/types.ts`)
   - Define a `CATEGORY_DESCRIPTION: Record<PartCategory, string>` with one short sentence per category describing what the part is and does, e.g.:
     - CPU: "The brain of the PC that runs programs and games."
     - GPU: "Renders images, video, and game frames."
     - etc.
   - Update `src/components/pc/PartSlot.tsx` to show the description under the slot header in small muted text, so it appears whether the slot is empty or filled.

3. **Insert the guide on the builder page**
   - Edit `src/routes/_authenticated/index.tsx`
   - Place `<BuildGuide />` directly above the stat strip / part-selection grid so it is the first thing under the header.
   - Keep the stat strip, part slots, right-side compat/wattage panel, and floating 3D preview exactly as they are.

4. **Add the future AI assistant placeholder box**
   - New file: `src/components/pc/AiAssistantBox.tsx`
   - Render a full-width card at the bottom of the main content area (after the slots grid, before the floating 3D preview) with:
     - An icon (`Bot` or `Sparkles`), a "AI Build Assistant" label, and a short message like "Coming soon — this assistant will suggest parts based on your build."
   - Keep it non-functional; no wiring to models or server functions.
   - Edit `src/routes/_authenticated/index.tsx` to place `<AiAssistantBox />` after the slots grid.

5. **Verify styling and responsiveness**
   - Ensure the guide and AI box use the existing card/border/surface utilities and look correct on mobile and desktop.
   - Confirm the new sections do not overlap the floating `BuildPreviewPanel`.

## Files to change
- `src/routes/_authenticated/index.tsx` — insert `<BuildGuide />` and `<AiAssistantBox />`
- `src/components/pc/PartSlot.tsx` — show per-category description
- `src/lib/pc/guide.ts` — new description map
- `src/components/pc/BuildGuide.tsx` — new component
- `src/components/pc/AiAssistantBox.tsx` — new component
