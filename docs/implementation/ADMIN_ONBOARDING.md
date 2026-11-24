# Administrator Onboarding

1. Connect only the authorized BCP PostgreSQL project and apply reviewed migrations.
2. Set a temporary `ADMIN_BOOTSTRAP_EMAIL`, 12+ character `ADMIN_BOOTSTRAP_PASSWORD` and administrator name in the target environment.
3. Run `npm run db:seed` once in the authorized environment. The seed is idempotent and does not overwrite verified contact fields.
4. Remove the bootstrap password from environment configuration after the administrator is verified.
5. Sign in at `/admin/login`, confirm the assigned ADMIN role, and review settings, catalogue status, leads and audit history.
6. Publish content only after source, availability and regulatory review. Do not add unsupported prices, qualifications or guarantees.

Roles remain `ADMIN`, `EDITOR` and `LEAD_MANAGER`; every permission is enforced server-side.
