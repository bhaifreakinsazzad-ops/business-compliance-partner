# Business Compliance Partner (BCP) — Engineering & Operating Rules

This document establishes permanent operating rules, brand constraints, architectural guidelines, and quality standards for all autonomous agents and engineers contributing to the BCP codebase.

---

## 1. Project Identity & Brand Authority

- **Official Brand Name:** Business Compliance Partner
- **Official Abbreviation:** BCP
- **Official Tagline:** One Partner. Complete Solutions. Confident Growth.
- **Brand Promise:** Simplifying Compliance. Empowering Business Growth.
- **Primary Market:** Bangladesh.
- **Master Badge:** Official circular Navy–Gold badge (`public/brand/bcp-master-logo.png`).
  - **Rule:** Never redraw, alter, or replace the circular master logo using generative AI or auto-tracing.
  - **Rule:** Preserve original artwork, proportions, and gold/navy color fidelity.
- **Palette Tokens:**
  - Midnight Navy: `#081838`
  - Royal Gold: `#C59028`
  - Accent Gold Light: `#DFB15B`
  - Pearl White: `#F8F8F8`
  - Ivory: `#F5F1E8`
  - Emerald: `#00865A`
  - Charcoal: `#181D26`
  - Slate Muted: `#596775`

---

## 2. Source-of-Truth Hierarchy

1. Latest explicit project-owner instructions.
2. BCP Final Client Business Overview & Implementation Plan V2.0.
3. BCP Revised Master Business Knowledge Base V1.1.
4. BCP Official Brand Book and Brand Configuration V1.0.
5. Authoritative BCP service catalogue V1.1 (`prisma/seed-data/bcp-catalogue-v1.1.json`).
6. Current repository implementation and verified schema.

---

## 3. Authoritative 437-Record Inventory Governance

- Total Source Records: **437**
  - **Learn (Courses):** 105 records (IDs: A-001 through A-105)
  - **Services:** 247 records (IDs: B-001 through B-247)
  - **Licensing & Registration:** 85 records (IDs: C-001 through C-085)
- Categories: **27 distinct categories** across the 3 operational pillars.
- Consultancy is an interactive customer intake pillar and must not inflate the 437-record source inventory.
- Ingestion is governed via `CatalogueSourceRecord`, `CatalogueOfferingMapping`, and `ImportBatch`.
- Ingestion command: `npm run catalogue:import` (dry run via `npm run catalogue:dry-run`).
- **Rule:** Unverified offerings remain in `UNVERIFIED` and `DRAFT` status until explicit client sign-off. Never publish fabricated prices, durations, or government approvals.

---

## 4. Architecture & Security Non-Negotiables

1. **Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma ORM 6, Zod, Vitest.
2. **Never expose secrets:** No passwords, database connection strings, private API keys, or personal customer information in code, logs, or public repositories.
3. **Database Health:** Always support graceful in-memory and seed fallbacks so the site remains operational, responsive, and indexable when database connections are unconfigured or transitioning.
4. **Customer vs. Staff Isolation:** Customer sessions (`bcp_customer_session`) and Staff Admin sessions (`bcp_admin_session`) are strictly isolated with independent cookie names, tokens, and authorization middleware.
5. **Private Document Protection:** Customer identity papers, financial records, and tax filings must never be stored in public directories or public CDNs. Use private server-authenticated endpoints.
6. **No Floating-Point Money:** In commerce modules, always calculate monetary values safely in BDT using exact integer paisa arithmetic or validated decimal representations.
7. **No Synthetic Guarantees:** Never claim guaranteed license issuance, government approval, legal victory, or simulated revenue.

---

## 5. Quality Pipeline & Deployment Gates

Every pull request or release branch must pass the full verification suite before merge:

```bash
npm run typecheck   # 0 TypeScript errors
npm run lint        # 0 ESLint errors
npm run test        # 100% passing Vitest test suite
npm run build       # Next.js clean production build
```

- **Production Git Remote:** `origin` points to `https://github.com/bhaifreakinsazzad-ops/business-compliance-partner.git`.
- **Target Vercel Project:** `business-compliance-partner` (`w9h-engineering`).
- Keep `main` and `feature/bcp-final-delivery-v3` synchronized and verified.
