# Fix up the 3D builder

Two problems today: parts are placed with hand-tuned offsets that don't line up (motherboard floats, GPU doesn't sit in a slot, cooler isn't on the CPU, drives hang outside the chassis), and the models look generic — a 4090 looks like a 3050, an AMD chip looks like an Intel one.

## 1. Rebuild the assembly so parts actually fit

Replace the guesswork offsets with a single shared layout system driven by the selected case and motherboard:

- Case defines the internal volume (width, height, depth) from its supported form factors. Everything else is positioned relative to that volume, not absolute numbers.
- Motherboard mounts flat against the right interior panel, top-aligned like a real tray, and its size comes from its form factor (Mini-ITX / Micro-ATX / ATX / E-ATX).
- CPU sits in the board's socket position; the cooler mounts directly on top of the CPU (air tower rises off the socket, AIO pump on the socket with the radiator on the top or front fan mount).
- RAM sticks stand in the board's DIMM slots, to the right of the socket, using the stick count of the selected kit.
- GPU inserts into the top PCIe x16 slot, bracket at the rear I/O, length running front-to-back — and is scaled so a long card visibly fills the case.
- PSU sits in the basement shroud on the case floor; storage drives mount on the tray behind the board (2.5"/3.5") or flat on the board (M.2).
- Camera and orbit target auto-frame the case size so small and full-tower builds both fill the panel.
- Fault highlighting and the ghost/placeholder state for empty slots stay exactly as they are.

## 2. Make models resemble the actual part picked

Add brand/tier detection from each part's brand and name, then vary the models:

- CPU: Intel LGA (square silver IHS, no exposed pins) vs AMD AM5 (smaller IHS with the notched corners and cutouts) vs AM4 (pin grid underside). Blue accent for Intel, red for AMD.
- GPU: fan count and thickness scale with card length and power draw; NVIDIA cards get a dark shroud with green accent, AMD red, Intel blue. Flagships get a thicker triple-fan body and a 12VHPWR connector; small cards get a single-fan low-profile look.
- Motherboard: colored accent heatsinks and the correct number of DIMM slots, PCIe slots, and M.2 shields per the selected board's specs; chipset shroud size scales with form factor.
- RAM: heatspreader profile and RGB bar depend on whether the kit is an RGB model; brand-tinted accent (Corsair, G.Skill, Kingston, Crucial).
- Cooler: air towers vary height and single/dual tower by the part's height spec; AIOs vary radiator length (120/240/280/360) with matching fan counts.
- Case: glass panel only for tempered-glass cases, mesh front for airflow cases, size from form factor support.
- PSU/storage: modular connector panel and label colors keyed to brand; SATA vs M.2 shapes as today, refined.

## 3. Also flows through the part cards

The per-part 3D toggle on each part thumbnail uses the same models, so every improvement shows up in the picker and the part list too — no separate work needed.

## Technical notes

- Edits stay in `src/components/pc/three/partMeshes.tsx` (model detail + a new brand/tier helper) and `src/components/pc/three/BuildViewer.tsx` (layout math), plus small camera-framing tweaks in `BuildPreviewPanel.tsx`.
- No changes to compatibility logic, data model, database, or routes.
- Geometry stays procedural and low-poly (no downloaded assets), so load time and bundle size don't change meaningfully.
