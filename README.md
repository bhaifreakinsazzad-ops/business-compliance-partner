# Paperwork Squad — Phase-1 Platform Foundation (Swarm-Ready)

> **Working Brand Status:** **PAPERWORK SQUAD** (`পেপারওয়ার্ক স্কোয়াড`) is a **proposed, pre-approval** working brand for Bangladesh. Name, raster logo concept, domain, verified contacts, and active commercial catalogue require formal client sign-off before public production launch.

## Platform Overview

A **Bengali-first (`lang="bn"`), Quiet Confidence** luxury corporate learning and business compliance platform built around four confirmed pillars:

1. **Courses & Professional Learning** *(Priority 1 — Mode A Catalogue + Enquiry only)*
2. **Professional Business Services** *(Priority 1)*
3. **Licensing & Registration** *(Priority 2 — dedicated authority-attributed pillar)*
4. **Consultancy & Advisory** *(Priority 2 — real server-side lead capture & reference ID `PS-YYYY-XXXXXXXX`)*

Strictly excluded from Phase 1: paid LMS, video lessons, student accounts, customer portals, payment gateways, appointment calendars, public NID/tax/bank uploads, government API auto-submission, and PWA.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4 + Brand Tokens v1.0 (`#0B1726`, `#10243A`, `#C7A45D`, `#F7F4ED`, `#263342`, `#F4F7FA`)
- **Database:** PostgreSQL + Prisma ORM v6 (`prisma/schema.prisma`, initial SQL migration in `prisma/migrations/20261119000000_init/migration.sql`)
- **Auth & RBAC:** Server-side HttpOnly cookie sessions backed by `admin_sessions` (`ADMIN`, `EDITOR`, `LEAD_MANAGER`)
- **Testing:** Vitest (unit & content governance), Playwright + axe-core (responsive, A11y, E2E)

---

## Quick Setup & Commands

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure your hosted PostgreSQL connection (Supabase / Neon / PostgreSQL):

```bash
cp .env.example .env.local
```

Generate an auth session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install & Generate Prisma Client
```bash
npm install
npm run db:generate
```

### 3. Apply Database Migrations & Seed
```bash
npm run db:migrate
npm run db:seed
```

To also provision an initial bootstrap `ADMIN` user during seed, set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` (12+ chars) in `.env.local` before running `npm run db:seed`.

### 4. Local Development, Verification & Build
```bash
npm run dev         # Start Next.js dev server on http://localhost:3000
npm run typecheck   # Strict TypeScript check
npm run lint        # ESLint Next.js core-web-vitals + typescript
npm run test        # Vitest unit & governance guardrails
npm run build       # Production build (prisma generate + next build)
npm run verify      # Runs typecheck + lint + test + build sequentially
npm run test:e2e    # Playwright responsive & smoke suite (320/360/768/1440px)
```

---

## Launching the Parallel Swarm Build

This baseline repository is pre-structured with **frozen shared contracts**, **disjoint file-ownership boundaries**, a **clean Git history**, and **ready-to-paste worker briefs** so parallel coding agents can build the complete Phase-1 platform simultaneously without merge conflicts.

1. Read [SWARM_PLAN.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/docs/SWARM_PLAN.md) first for the DAG wave sequence, strict File-Ownership Matrix, and exact `swarm` commands.
2. Per-worker briefs live in `docs/swarm-briefs/`:
   - `01-ui-system.md` (Wave 1 Author — `workspace:"share"`)
   - `02-backend-core.md` (Wave 1 Author — `workspace:"share"`)
   - `03-public-pillar-1.md` (Wave 2 Author — `workspace:"share"`)
   - `04-public-pillar-2.md` (Wave 2 Author — `workspace:"share"`)
   - `05-admin-cms.md` (Wave 2 Author — `workspace:"share"`)
   - `06-docs-qa.md` (Wave 2 Author — `workspace:"share"`)
   - `07-verifier.md` (Wave 3 Verifier — `workspace:"inherit"`)

---

## Governance & Documentation Suite

- [ARCHITECTURE.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/ARCHITECTURE.md)
- [BRAND_IMPLEMENTATION.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/BRAND_IMPLEMENTATION.md)
- [CONTENT_MODEL.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork Squad/CONTENT_MODEL.md)
- [REGULATORY_CONTENT_POLICY.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/REGULATORY_CONTENT_POLICY.md)
- [SECURITY.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/SECURITY.md)
- [PRIVACY_DATA_FLOW.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/PRIVACY_DATA_FLOW.md)
- [ADMIN_GUIDE.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/ADMIN_GUIDE.md)
- [DEPLOYMENT.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/DEPLOYMENT.md)
- [QA_CHECKLIST.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/QA_CHECKLIST.md)
- [CHANGELOG.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/CHANGELOG.md)
- [SOURCE_AUDIT.md](file:///e:/Agentic%20Work%20Station/Websites/Paperwork%20Squad/docs/SOURCE_AUDIT.md)
