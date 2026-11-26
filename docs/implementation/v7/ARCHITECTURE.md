# System Architecture Overview — BCP V7.0

## 1. Runtime Stack

- **Framework:** Next.js `15.5.x` App Router (`React 19.1.0`, TypeScript `5.8.x`)
- **Styling & Motion:** Tailwind CSS `4.1.0` (`@tailwindcss/postcss`), `motion` (`14.14.0`), `lucide-react` (`0.511.0`)
- **3D Rendering:** `three@0.187.0` with custom WebGL/SwiftShader fence helpers and decoupled delta timing (`src/lib/three/timing.ts`)
- **Database & ORM:** PostgreSQL + Prisma `6.19.3` (`prisma/schema.prisma`), Zod `3.25.0` validation
- **Testing & QA:** Vitest `3.1.0` (`vitest run`), Node test runner (`tsx --test`), Playwright (`playwright-cli` + `@playwright/test`)
- **Package Management:** Standardized exclusively on `package-lock.json` (`bun.lock` removed; `"postinstall": "prisma generate"` enforced).

## 2. Core Architectural Boundaries

1. **Public Discovery & Fallback Resilience (`src/lib/services/catalogue.ts`)**:
   - Serves 437 governed entries across 27 categories (105 Courses, 247 Services, 85 Licensing) with seed/in-memory fallback when PostgreSQL is unavailable.
   - Slug detail queries (`getPublishedCourseBySlug`, `getPublishedServiceBySlug`, `getPublishedLicensingBySlug`, `getGovernedBookBySlug`) fail closed whenever database tables are populated and a record is `DRAFT` or `INACTIVE`.
2. **Dual Isolated Authentication**:
   - Customer portal (`bcp_customer_session`) and Staff Admin (`bcp_admin_session`) use independent cookies, tokens, and route authorization helpers (`src/lib/customer/auth.ts`, `src/lib/security/session.ts`, `src/lib/security/rbac.ts`).
3. **Client-Safe vs. Server-Only Commerce Modules**:
   - `src/lib/commerce/payments.ts` contains strictly browser-safe integer-paisa calculations (`toPaisa`, `fromPaisa`, `computeLineItemTotalPaisa`, `formatBdtFromPaisa`) and sandbox interface helpers — safe for `"use client"` components (`BookCheckoutPanel.tsx`, `BookCard.tsx`).
   - `src/lib/commerce/checkout-rules.ts` holds server-only canonical SHA-256 payload hashing (`hashIdempotencyPayload` via `node:crypto`), duplicate line-item merging (`normalizeAndValidateBookItems`), and order status state machine validation (`canTransitionOrderStatus`).
4. **Private Storage Abstraction (`src/lib/storage/private-documents.ts`)**:
   - Supports `S3` (SigV4), `SUPABASE` (service-key private bucket), and gated `LOCAL` ephemeral storage for non-production development.
5. **Telemetry Separation (`src/lib/analytics/`)**:
   - Client funnel telemetry (`events.ts`) emits `client_observed` with strict PII stripping; transactional conversions (`server.ts`) write `server_verified` rows to `AnalyticsServerEvent`.
