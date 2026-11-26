# Creative 3D, WebGL & Motion Architecture Report — BCP V7.0

## 1. Software-WebGL & Three.js Hardening

- **Deprecated `THREE.Clock` Eliminated:** Created `src/lib/three/timing.ts` (`clampFrameDelta`, `createDeltaTimer`, `resolveSlideYawOffset`) replacing `THREE.Clock` in both `HeroKnowledgeStudio3D.tsx` and `BookPreview3D.tsx`, eliminating console deprecation warnings under `three@0.187.0`.
- **Coalesced On-Demand Render Loop + Fence Synchronization:** Added `awaitWebGLFrameFence()` (`gl.fenceSync` + `getSyncParameter` polling + cleanup handle) in `src/components/three/threeUtils.ts`. Under headless software WebGL (SwiftShader), frames wait cleanly for GPU/software pipeline completion before scheduling subsequent motion and automatically idle once settled instead of burning CPU in an unbounded 60Hz `requestAnimationFrame` loop.
- **IBL & Surface Fidelity:** Retained `RoomEnvironment` IBL across devices for metallic gold/navy contrast, removed `backdrop-blur-*` glassmorphism layers above WebGL canvases (preventing compositor stalling), and added deterministic DOM test attributes (`data-testid="hero-studio-3d"`, `data-testid="book-preview-3d"`, `data-render-mode`, `data-book-open`).
- **Official Brand Asset Preservation:** Embedded untouched `/public/brand/bcp-master-logo.png` cleanly inside the 3D studio HQ display and 3D hardcover texture without AI redrawing.

## 2. Motion Ownership & CSS Decoupling

- Removed competing CSS `transition: transform` from `.bcp-flagship-card` in `src/app/globals.css` so Motion (`motion/react`) owns interactive hover/tap transforms exclusively without mid-frame fighting.
- Verified interactive 3D book cover toggle (`বই খুলুন` -> `data-book-open="true"`) in headless Chromium and visual PBR quality via `.playwright-cli/v7-book-3d.png`.
