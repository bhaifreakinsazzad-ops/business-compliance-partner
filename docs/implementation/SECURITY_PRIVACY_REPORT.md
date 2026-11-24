# Security and Privacy Report

## Implemented controls

- Server-side Zod validation, bounded JSON request bodies and normalized Bangladesh phone input.
- HttpOnly, secure-in-production, SameSite staff sessions backed by revocable database records.
- Server-side RBAC for Admin, Editor and Lead Manager permissions.
- Idempotent durable lead creation; failed notification delivery does not roll back a saved lead.
- BCP references generated with cryptographic randomness; historical PS references remain accepted.
- CSV formula-injection protection and PII-stripped analytics.
- Production database readiness and catalogue access fail closed.
- Upstash Redis REST rate limiting when configured; production fails closed without the provider.
- Production enquiry bot verification fails closed without Turnstile configuration.
- Security headers, staging noindex and private admin/API indexing exclusions.

## Open risks

- No authorized BCP database or production environment is currently connected.
- npm audit reports unresolved transitive issues whose automatic fixes require major Next.js, Prisma or Zod upgrades. Input limits reduce exposure, but dependency remediation needs a separately tested compatibility upgrade.
- No approved sensitive-document workflow, retention decision, malware scanning or private storage exists; uploads remain disabled.
- Manual screen-reader, penetration and database authorization tests require the target environment.

See `RISK_REGISTER.md` for severity, ownership and release treatment.
