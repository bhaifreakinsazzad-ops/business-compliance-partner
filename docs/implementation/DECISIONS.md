# Architecture and Product Decisions

## D-001 — Preserve the newer local implementation

- Decision: branch from local `1d64426` rather than discarding it for `7665bc3`.
- Rationale: it contains the complete admin CMS and fixes while retaining the requested baseline in its ancestry.
- Consequence: Git/Vercel repository integration still requires authorized reconciliation.

## D-002 — Text identity until the approved logo is supplied

- Decision: do not render the legacy concept image and do not create a replacement mark.
- Rationale: the directive forbids redrawing or inventing logo variants; the approved binary is absent.
- Consequence: header/footer use the official BCP name only. Asset activation remains blocked.

## D-003 — Backwards-compatible public references

- Decision: generate `BCP-YYYY-XXXXXXXX` for new enquiries and accept both BCP and historical PS formats.
- Rationale: complete rebranding must not invalidate existing records.

## D-004 — Production data fails closed

- Decision: database health returns 503 unless connected; production catalogue never silently falls back to seed records.
- Rationale: an unconfigured database must not be reported as healthy or expose stale inventory.

## D-005 — Distributed rate-limit contract

- Decision: use server-only Upstash Redis REST when configured, in-memory limiting only outside production, and fail closed in production without the provider.
- Rationale: process-local counters are ineffective across Vercel instances.

## D-006 — Expansion modules remain gated

- Decision: do not create customer identity, payment, LMS sales, sensitive document or AI data models until the correct BCP database and operating policies are approved.
- Rationale: premature schemas and simulated flows would conflict with privacy, commercial and infrastructure gates.
