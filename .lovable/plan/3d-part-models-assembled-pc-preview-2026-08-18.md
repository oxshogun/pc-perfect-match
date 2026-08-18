# 3D part models + assembled PC preview

Add lightweight, code-generated 3D models for every part category, and a floating 3D preview of the full rig in the bottom-right of the builder.

## What you'll get

**3D part models**
- Every part category (CPU, cooler, motherboard, RAM, GPU, storage, PSU, case) gets a stylized low-poly 3D model built from simple shapes, colored with the app's dark hardware palette.
- Because they're generated in code, all 200+ catalog parts get a model instantly — no per-part 3D files, no extra load time.
- Model shape adapts to real specs where it's meaningful: GPU length, cooler height/AIO vs air, case form factor, RAM stick count, board size.

**Where they appear**
- Part picker dialog and builder slots: hovering/selecting a part shows a small rotating 3D model instead of the flat icon (existing Amazon photo still wins when one exists; 3D is the fallback and the "spin it" view).
- Library page: a "3D" toggle on each row to spin the model.

**Assembled PC preview (bottom-right)**
- Floating panel pinned bottom-right of the builder page: the case as a semi-transparent shell with the motherboard, CPU cooler, GPU, RAM sticks, drives, and PSU placed inside at realistic positions.
- Drag to rotate, scroll to zoom, slow auto-spin when idle.
- Parts you haven't picked appear as dim ghost outlines, so it fills in as you build.
- Collapse button to minimize to a small tab, and expand button for a fullscreen viewer.
- Parts flagged by the compatibility engine glow red (e.g. GPU too long for the case) so the fault is visible in space.

## Technical notes

- Add `three`, `@react-three/fiber`, `@react-three/drei` (WebGL renders client-side only).
- New `src/components/pc/three/` folder: one `partMeshes.tsx` with a mesh component per category driven by part specs, `PartModelViewer.tsx` (single part), and `BuildViewer.tsx` (assembled rig with layout constants for mount positions).
- All viewers are loaded with `React.lazy` behind `<ClientOnly>` so SSR/prerender never imports three.js; a static icon renders during hydration.
- Canvases use `frameloop="demand"`-style throttling and are unmounted when collapsed, to keep the builder page light.
- No changes to the compatibility engine, database, parts data model, or auth — issue severity is read from the existing `analyze()` output, and the viewer only consumes resolved parts.
