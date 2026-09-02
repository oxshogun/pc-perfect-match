# Finish clickable part details in the 3D builder

The fit/clamp work and the details card are already built. What's left is wiring so clicking a part in explode mode actually shows its details.

## What you'll get

- In explode mode, clicking any part in the 3D rig opens a details card: name, brand, price, what the part does, key fit specs, how it connects to the rest of the rig, and any compatibility warnings for that part.
- Works in both the small floating panel (card overlays the bottom of the panel) and the fullscreen view (card sits as a side panel).
- Clicking empty space or leaving explode mode closes the card.

## Technical steps

1. `src/components/pc/three/BuildPreviewPanel.tsx`
   - Add an `issues?: CompatIssue[]` prop.
   - Add `selected` state (`PartCategory | null`); pass `selected` and `onSelect` into both `BuildViewer` instances.
   - Render `PartDetailsCard` when `selected && explode`: absolutely positioned over the small panel, and in a right-side column in fullscreen.
   - Clear `selected` whenever `explode` is toggled off and when fullscreen closes.
2. `src/routes/_authenticated/index.tsx` (~line 240)
   - Keep the existing `faults` prop, add `issues={issues}` to `<BuildPreviewPanel />`.
3. Typecheck with `tsgo` and verify in the browser: enter explode mode, click a part, confirm the card renders with specs and issues.

No changes to the compatibility engine, data model, database, or routes.
