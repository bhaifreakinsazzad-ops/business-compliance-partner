# Risk Register

**Updated:** 2026-11-25 (Asia/Dhaka)  
**Scoring:** Likelihood and impact are Low / Medium / High / Critical.  
**Statuses:** OPEN, MITIGATING, BLOCKED, ACCEPTED, CLOSED.

No risk is considered closed without implementation and verification evidence.

| ID | Risk | Likelihood | Impact | Status | Evidence | Mitigation / release gate |
|---|---|---:|---:|---|---|---|
| R-001 | Vercel deploys from the wrong GitHub repository | High | Critical | BLOCKED | Vercel Git metadata is `notrealenginellc/Paperwork-Squad`; requested repo is `bhaifreakinsazzad-ops/business-compliance-partner`. | Owner-authorized integration decision; compare histories; preserve `1d64426`; verify preview commit before promotion. |
| R-002 | Production lacks a database and durable operations can be misrepresented | Certain | Critical | MITIGATING | Vercel has zero env vars; public health reports `database:unconfigured`. | Fail readiness with 503; never report saved leads without transaction success; identify authorized BCP DB before release. |
| R-003 | Health endpoint masks an unconfigured database | Certain on current deployment | High | MITIGATING | All public aliases return HTTP 200 and `ok:true` for unconfigured DB. | Implementation branch changes unconfigured/error to HTTP 503 and `ok:false`; add regression test and verify preview. |
| R-004 | Wrong Supabase project could receive BCP data | Medium | Critical | BLOCKED | Only connector-visible project is unrelated inactive `PowerPointBD`. | Explicitly prohibit its use; require verified BCP project identity and owner authorization before any schema or data operation. |
| R-005 | Preview and production data are not isolated | High | Critical | BLOCKED | No Vercel env vars or verified custom environment/database. | Establish separate development, preview, and production databases/credentials; test with non-production fixtures. |
| R-006 | Node runtime incompatibility | Medium | High | OPEN | Vercel project is set to Node `26.x`; project stack is Next 15/Prisma 6. | Select a supported LTS runtime based on current official compatibility, pin it, run full CI and preview verification. |
| R-007 | Known dependency vulnerabilities | High | Critical | OPEN | `npm audit`: 10 total (2 critical, 6 high, 2 moderate); production-only audit: 7 (6 high, 1 moderate). Direct findings include Next, Prisma, Vitest, Zod. | Review advisory applicability; prefer compatible patch/minor updates; isolate major upgrades; rerun audit, tests, build and E2E. Do not claim security readiness while exploitable findings remain. |
| R-008 | In-memory rate limits fail across serverless instances | High | High | OPEN | Lead and admin login routes instantiate `InMemoryRateLimiter`. | Add provider abstraction with distributed production backend, fail-safe configuration, tests and privacy-preserving keys. |
| R-009 | Session/cookie identity remains legacy and may conflict with future customer auth | Medium | High | OPEN | Staff cookie is `ps_admin_session`; customer identity architecture is unapproved. | Preserve staff auth compatibility; document rename/migration; keep staff and customer authority separate; test revocation and cross-account access. |
| R-010 | Missing CSP and HSTS policy leaves browser hardening incomplete | Medium | High | OPEN | Next config sets nosniff, frame deny, referrer and permissions headers, but no CSP/HSTS. | Design CSP from actual asset/script requirements; stage report-only first; add HSTS only on verified HTTPS production domains. |
| R-011 | Authentication brute-force protection is instance-local | High | High | OPEN | Admin login limiter is process memory only. | Distributed limiter, bot protection policy, monitoring and lockout-safe recovery before public admin exposure. |
| R-012 | Secret/default salt misuse in development may leak into production | Medium | High | OPEN | IP hashing falls back to literal `ps-local-ip-salt` when `AUTH_SESSION_SECRET` is absent. | Production configuration validator must reject absent/weak secret; use an explicit non-production-only fallback. |
| R-013 | Catalogue fallback can conceal DB outage or expose stale data | Medium | High | OPEN | Public catalogue/service config falls back when DB is absent or errors. | Permit fallback only in explicitly non-production environments; production shows truthful unavailability; test visibility rules. |
| R-014 | Build supply-chain scripts are not explicitly reviewed | Medium | High | OPEN | Vercel warned about install scripts for Prisma engines/client, Prisma, and esbuild. | Record approved script allowlist after package/version review; keep lockfile immutable in CI; enable provenance/Dependabot where authorized. |
| R-015 | Production aliases still expose legacy branding and naming | Certain | Medium | OPEN | Active aliases include Paperwork Squad domains; local project label remains `paperwork-squad`. | Preserve domains until authorization; add canonical/redirect plan only after official domain approval; avoid indexing legacy aliases. |
| R-016 | No deployment protection on staging data/admin surfaces | High | High | OPEN | Password, SSO and trusted-IP protection are disabled. | Enable appropriate preview protection after owner approval; never expose private data in unprotected previews. |
| R-017 | Environment variables required by the app are entirely absent on Vercel | Certain | Critical | BLOCKED | Connector reports 0 env vars and 0 hidden production vars. | Maintain environment matrix; configure reviewed minimum variables per target; verify without printing values. |
| R-018 | Contact, pricing, legal, and regulatory content may be fabricated or stale | Medium | Critical | BLOCKED | Authoritative business/brand/catalogue artifacts are not present in the supplied attachment set. | Publish only sourced/approved data; mark unavailable entries internal; require review dates and source attribution. |
| R-019 | Sensitive uploads could be exposed or retained improperly | Medium | Critical | BLOCKED | Storage project, retention policy, scanning, and operational review are unavailable. | Keep upload feature disabled until private storage, ownership checks, signed URLs, validation, scanning, audit and deletion policy are approved. |
| R-020 | Payment duplication, forgery or premature fulfilment | Medium | Critical | BLOCKED | Merchant/provider/pricing requirements and credentials are unavailable. | Keep payments disabled; implement provider abstraction, signed webhook verification, server-side amount checks, idempotency and sandbox E2E before activation. |
| R-021 | Future AI could expose private or unapproved content | Medium | Critical | BLOCKED | Provider/privacy/evaluation decisions are unapproved. | Keep feature flagged off; retrieval only from published sources; server-side auth; prompt-injection and tool allowlist controls. |
| R-022 | Admin CSV export can cause formula injection or excess disclosure | Medium | High | MITIGATING | Sanitizer exists, but production authorization and field-minimization require verification. | Keep server-side RBAC, sanitize all cells, use explicit field selection, test malicious prefixes, log exports without PII. |
| R-023 | Production database migrations could damage unknown existing data | Medium | Critical | BLOCKED | BCP schema, migration history, record counts, backups and drift are inaccessible. | Additive migrations only; inspect/backup/restore-test first; no reset/push; obtain production migration authorization. |
| R-024 | Public forms may imply success when notifications fail or DB is absent | Medium | High | MITIGATING | Desired separation exists in design; live DB is absent. | Transaction is authoritative; notification runs after commit; return genuine reference only after persistence; E2E failure-state tests. |
| R-025 | Git safe-directory ownership discrepancy can conceal ownership/security issues | Medium | Medium | MITIGATING | Git initially rejected repo due Windows SID ownership mismatch. | Safe-directory exception was scoped to the explicit workspace; confirm filesystem ownership with operator if the checkout origin is uncertain. |

## Audit evidence summary

- Vercel connector verified project, team, deployments, domains, build events and zero environment variables.
- Supabase connector verified only unrelated inactive `PowerPointBD`.
- Public endpoint checks verified staging noindex and the incorrect HTTP 200 readiness behavior.
- `npm audit` on the current lockfile found 10 total vulnerabilities; `npm audit --omit=dev` found 7 production-tree vulnerabilities.
- Application review verified in-memory rate limits, current cookie behavior, fallback salt, and incomplete security-header policy.

## Immediate critical path

1. Keep production promotion blocked.
2. Reconcile the Git repository and Vercel integration with explicit owner authorization.
3. Identify the authorized BCP database and backup/migration state.
4. Configure isolated environments and strong secrets.
5. Verify the fail-closed readiness endpoint in preview.
6. Triage and remediate dependency findings without unreviewed major-version jumps.
7. Replace production rate limiting before exposing lead/admin endpoints at scale.

