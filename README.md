# Business Compliance Partner

Business Compliance Partner (BCP) is a Bengali-first business, compliance, professional learning and consultancy platform for Bangladesh.

> Release status: implementation branch / staging. Production release is blocked until the intended Git repository, authorized BCP database, environment configuration, official logo asset, verified contacts and approved catalogue are reconciled.

## Current release scope

- Premium responsive public experience across courses, services, licensing and consultancy.
- Deterministic Business Solution Finder and unified catalogue search.
- Durable PostgreSQL enquiry flow with idempotency and BCP reference IDs.
- Staff authentication, role-based Admin CMS, lead management, audit history and CSV export.
- Bengali-first SEO, sitemap, robots controls and automated accessibility coverage.
- Production fail-closed readiness, catalogue fallback, bot protection and distributed rate-limit contracts.

Customer accounts, payments, LMS sales, sensitive document uploads, compliance cases, AI and production deployment are not represented as operational.

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 6, Zod, Vitest, Playwright and axe-core.

## Local setup

```powershell
npm ci
Copy-Item .env.example .env.local
npm run db:generate
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Configure an isolated development database before applying migrations or testing durable submissions. Never point general tests at production customer data.

## Documentation

- [Source of truth](docs/implementation/SOURCE_OF_TRUTH.md)
- [Master plan](docs/implementation/MASTER_PLAN.md)
- [Repository audit](docs/implementation/REPOSITORY_AUDIT.md)
- [Infrastructure audit](docs/implementation/INFRASTRUCTURE_AUDIT.md)
- [Requirements matrix](docs/implementation/REQUIREMENTS_MATRIX.md)
- [Test report](docs/implementation/TEST_REPORT.md)
- [Risk register](docs/implementation/RISK_REGISTER.md)
- [Decisions](docs/implementation/DECISIONS.md)

## Safety

- Do not run destructive Prisma reset commands against production.
- Do not expose database, session, email, Turnstile or Redis credentials.
- Do not activate payments, sensitive uploads or production release without their approval gates.
- Historical `PS-*` enquiry references remain valid; new references use `BCP-*`.
