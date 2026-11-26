# Live Browser & Playwright Visual QA Report — BCP V7.0

**Environment:** Headless Chromium (`/ms-playwright/chrome-headless-shell`), Next.js dev server (`http://localhost:3000`, `DISABLE_HMR=true`, PostgreSQL fallback active)  
**Rounds Executed:** 2 verification rounds via `playwright-cli`

## 1. Visual & Functional Findings Log

- **Round 1 Defect Detected & Fixed:** Visual inspection of `.playwright-cli/v7-mobile-home.png` (`390×844`) revealed the brand `<Link>` in `AppHeader.tsx` carried `shrink-0`, crowding the `[Search]` and `[Menu]` controls against the right edge on narrow mobile viewports. Fixed by switching to `min-w-0 flex-1 lg:flex-initial` and `text-[13px] sm:text-lg`, then verified cleanly in Round 2 (`.playwright-cli/v7-r2-mobile-390.png`).
- **Dev Watcher Prefetch Notice:** During automated route navigation (`goto`) immediately following screenshot file writes in dev mode, Next.js webpack dev watcher triggered HMR recomposition once during a `?_rsc` prefetch request; all routes returned HTTP `200` on direct verification and zero JS console errors occurred on rendered pages.

## 2. Verified Assertions Summary

| Check | Measured Output | Status |
|---|---|---|
| Flagship card DOM order & Lavender fill (`1440×900`) | `1: /courses`, `2: /services`, `3: /books` — all `rgb(221, 214, 235)` (`#DDD6EB`) | **PASSED** |
| Desktop horizontal overflow (`1440×900`) | `scrollWidth <= clientWidth` (`desktopOverflow: false`) | **PASSED** |
| Mobile overflow & header bounds (`390×844`) | `scrollWidth390: 390`, `headerRightMax390: 374` (`mobile390Overflow: false`) | **PASSED** |
| Ultra-narrow mobile overflow (`320×568`) | `scrollWidth320: 320`, `headerRightMax320: 304` (`mobile320Overflow: false`) | **PASSED** |
| Official master logo rendering | `logoNaturalWidth > 0`, `bcp-master-logo.png` loaded cleanly | **PASSED** |
| Hero 3D Studio & Book Preview 3D WebGL | `hero3dPresent: true`, `bookCanvas: 862×360`, click `বই খুলুন` -> `data-book-open="true"`, `0` `THREE.Clock` warnings | **PASSED** |
| `/courses`, `/services`, `/consultancy`, `/books`, `/licensing`, `/portal/login`, `/admin/login` | All returned HTTP `200`; `/services` rendered `11` unauthenticated WhatsApp CTAs; `/consultancy` rendered active form | **PASSED** |
| `/api/health` public response | HTTP `503` minimal `{ ok: false, status: "degraded", timestamp }` (zero internal diagnostics leaked) | **PASSED** |
