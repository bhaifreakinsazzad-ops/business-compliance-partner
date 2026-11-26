# ThreeUI Compatibility Audit — BCP V7.0

**Audit Date:** 2026-11-26  
**Scope:** Evaluation of `@designcodeio/threeui@1.2.0` vs. existing `three@0.187.0` architecture  
**Verdict:** **REJECTED `@designcodeio/threeui` — Retained Hardened `three@0.187.0` Custom Studio & Book PBR Rig**

---

## 1. Compatibility & Dependency Findings

| Criterion | `@designcodeio/threeui@1.2.0` | Retained `three@0.187.0` Architecture |
|---|---|---|
| React Peer Dependency | Declares `react < 20`, tested on React 18 patterns | Native React `19.1.0` + Next.js `15.5.x` client boundaries |
| Three.js Version & Bundle | Internally bundles legacy duplicate `three128` + `three165` (~multiple copies in bundle) | Single clean `three@0.187.0` dependency (`@types/three@^0.187.0`) |
| Software WebGL (Headless SwiftShader) | Continuous uncontrolled animation assumptions; poor control over `fenceSync` | Explicit `awaitWebGLFrameFence()` (`gl.fenceSync`) + coalesced `requestRender()` idle stop |
| `THREE.Clock` Deprecation | Legacy loop patterns emit warnings under `three@0.187.0` | Replaced cleanly by `src/lib/three/timing.ts` (`createDeltaTimer`, `clampFrameDelta`) |
| BCP Brand & Editorial Fidelity | Generic 3D widgets unrelated to Bangladeshi legal/tax books & HQ | Bespoke BCP Digital HQ laptop + stacked Bangladeshi compliance books + interactive hardcover opener |

---

## 2. Engineering Decision

Installing `@designcodeio/threeui` was rejected to avoid shipping duplicate Three.js engines in client bundles, triggering peer conflicts with React 19 / Next.js 15, and breaking software-WebGL stability. Instead, all V7 3D enhancements were built directly inside:
- `src/lib/three/timing.ts` (decoupled, `node:test`-verified pure frame timing)
- `src/components/three/threeUtils.ts` (`awaitWebGLFrameFence()`, crisp DPR bounding, software renderer guardrails)
- `src/components/three/HeroKnowledgeStudio3D.tsx` & `src/components/three/BookPreview3D.tsx`

---

## 3. Verification Status

- `src/lib/three/timing.test.ts`: **PASSED** (3/3 subtests under `tsx --test`).
- Playwright headless Chromium console check: **PASSED** (0 `THREE.Clock` deprecation warnings, 0 JS errors).
