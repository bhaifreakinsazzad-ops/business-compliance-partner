# Quality Assurance Checklist (35-Gate Phase-1 Verification)

## Baseline Foundation Verification (Completed in This Repo)
- [x] strict TypeScript (`npm run typecheck`) passes cleanly
- [x] ESLint (`npm run lint`) passes cleanly
- [x] Vitest unit & governance tests (`npm run test`) verify BD mobile normalization, Zod consent/honeypot validation, CSPRNG `PS-YYYY-XXXXXXXX`, scrypt password hashing, RBAC matrix, CSV injection neutralization, analytics PII stripping, and zero legacy/placeholder leakage in seed data
- [x] Next.js production build (`npm run build`) completes with zero unconfigured DB crashes
- [x] Initial PostgreSQL SQL migration generated (`prisma/migrations/20261119000000_init/migration.sql`)

---

## Target Responsive, A11y & Security Matrix (To Execute in Wave 2/3 Verification)

### Responsive Widths (Zero Horizontal Overflow, Readable Bangla Wrapping)
- [ ] `320px` (compact mobile)
- [ ] `360px` (primary Bangladesh Android viewport)
- [ ] `390px` (modern mobile)
- [ ] `768px` (tablet portrait)
- [ ] `1024px` (tablet landscape / small laptop)
- [ ] `1280px` (desktop)
- [ ] `1440px+` (wide desktop)

### WCAG 2.2 AA & Bengali UX
- [ ] `<html lang="bn">` present on every route; skip-to-content link moves focus to `#main-content`
- [ ] Full keyboard Tab / Shift+Tab / Enter / Escape walkthrough with visible `3px solid #C7A45D` focus ring
- [ ] Automated `@axe-core/playwright` zero critical/serious violations
- [ ] Champagne gold `#C7A45D` never used for normal text on white/ivory
- [ ] Zero simulated `PS-DEMO-*` IDs; form preserves fields on DB error and shows receipt only after HTTP 201 commit
- [ ] `GET /api/health` returns accurate PostgreSQL status; `/admin/*` & `/api/admin/*` fail closed when unauthenticated
- [ ] Automated scan confirms zero `FIXXER`, `DhandaBuzz`, `NotRealEngine`, `example.com`, `+880 1XXX`, or unverified `ISD`/`ASC` strings across build output

### Performance Lab Targets
- [ ] Desktop & Mobile Lighthouse audit: target `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`
- [ ] Zero CDN `anime.js` or `Three.js` script tags in rendered DOM
- [ ] Screenshots archived for desktop (`1440px`) and mobile (`360px`) across Home, Courses, Services, Licensing, Consultancy & Admin
