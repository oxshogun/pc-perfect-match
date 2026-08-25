# Fix 3D fit + clickable part details in explode view

## 1. Keep every part inside the case

Today several parts are placed with hand-picked offsets that ignore the case walls and the board's real slot positions, so an AIO radiator can push through the roof and RAM floats above the DIMM slots.

Changes:

- Introduce a single "interior volume" for the selected case (inner width/height/depth after panel thickness), and clamp every placed subsystem into it. Anything that would exceed the volume is scaled or repositioned to the nearest legal mount instead of sticking out.
- AIO radiator: mount it fully under the roof — its thickness plus fan depth is subtracted from the ceiling, and its length is checked against the case's roof mount. If a 360mm rad doesn't fit the roof, it moves to the front mount (rotated) and, if that doesn't fit either, it shrinks to the largest supported size and the cooler is flagged as a fit fault (same red highlight already used).
- RAM: seat the sticks in the actual DIMM slot anchors instead of a fixed vertical offset — contacts at the slot plane, sticks standing off the board face, spaced by real slot pitch, and slot count taken from the board. Add a matching DIMM slot body on the motherboard model so the sticks visibly sit in something.
- CPU/cooler: the air tower's height is checked against the case's max cooler clearance; too-tall coolers get flagged rather than clipping the side panel.
- GPU, PSU, drives: same clamping pass so a long GPU stops at the front panel and drives/PSU stay in the basement/tray.
- A small dev-time check verifies each part's bounding box is inside the interior volume, so future tweaks can't silently poke out again.

## 2. Click a part in explode view for details

In exploded view, parts become clickable:

- Hover highlights the part and shows its name; clicking selects it.
- A details card appears in the viewer (side panel in fullscreen, overlay in the small panel) with:
  - part name, brand, price
  - what this part does in the system (reuses the existing per-category descriptions already used in the builder)
  - key specs relevant to fit (socket, form factor, length, TDP, wattage, clearance)
  - how it connects: which part it plugs into and what it depends on (e.g. GPU → PCIe x16 on the motherboard; cooler → CPU socket; PSU → powers CPU/GPU)
  - any compatibility issues already reported for that part, in-place
- Clicking empty space or a close button deselects. Selecting a part also dims the others slightly so the highlighted one reads clearly.
- Outside explode mode, behaviour is unchanged (auto-rotate, orbit, zoom).

## Technical notes

- `partMeshes.tsx`: add case interior helper + slot geometry (DIMM slots on the board), radiator sizing/fallback logic, and clearance-aware cooler height.
- `BuildViewer.tsx`: replace ad-hoc offsets with clamped anchors derived from the interior volume; wrap each `Slot` in a clickable/hoverable group emitting the selected category + part.
- New `PartDetailsCard.tsx` rendering the details, fed by `resolved` parts, `@/lib/pc/guide.ts` descriptions, and the existing `analyze()` issues.
- `BuildPreviewPanel.tsx`: hold selection state, show the card, clear selection when explode is turned off.
- No changes to the compatibility engine, data model, database, or routes.
