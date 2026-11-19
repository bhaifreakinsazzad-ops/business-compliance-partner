# Changelog

## [0.1.0] — 2026-11-19 (Phase-1 Swarm-Ready Foundation)

### Added
- Next.js 15 App Router + TypeScript strict + Tailwind CSS v4 project foundation (`package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`).
- Brand Book v1.0 & Design Tokens (`src/styles/tokens.json`, `src/app/globals.css`), copying provisional emblem (`public/brand/proposed-logo-concept.jpg`) with explicit asset status (`public/brand/ASSET_STATUS.md`).
- Full Phase-1 PostgreSQL schema (`prisma/schema.prisma`), initial SQL migration (`prisma/migrations/20261119000000_init/migration.sql`), deduplicated PDF seed data across Courses, Services, Licensing, Categories, and FAQs (`prisma/seed-data/*`, `prisma/seed.ts`).
- Frozen shared contracts & security libraries (`src/types/domain.ts`, `src/lib/*`): BD mobile normalizer, Zod lead & content validators, scrypt/session/RBAC security utilities, CSPRNG `PS-YYYY-XXXXXXXX` reference generator, CSV formula-injection sanitizer, sliding-window rate limiter, non-PII notifier & analytics scrubber.
- Runnable Bengali-first Quiet Confidence baseline shell (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/not-found.tsx`, `src/middleware.ts`, `src/app/api/health/route.ts`).
- Vitest unit/governance tests & Playwright responsive E2E smoke test.
- Complete documentation suite & swarm execution playbook (`docs/SOURCE_AUDIT.md`, `docs/SWARM_PLAN.md`, `docs/swarm-briefs/*.md`, `ARCHITECTURE.md`, `BRAND_IMPLEMENTATION.md`, `CONTENT_MODEL.md`, `REGULATORY_CONTENT_POLICY.md`, `SECURITY.md`, `PRIVACY_DATA_FLOW.md`, `ADMIN_GUIDE.md`, `DEPLOYMENT.md`, `QA_CHECKLIST.md`).
