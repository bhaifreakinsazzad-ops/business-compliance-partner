# Deployment, Migration, Backup & Client Handover Runbook

---

## 1. Environment Separation

| Environment | `NEXT_PUBLIC_APP_ENV` | Indexing Behavior | Database |
|---|---|---|---|
| **Local Dev** | `staging` | `noindex, nofollow` + staging badge | Isolated dev PostgreSQL (Neon / Supabase branch) |
| **Preview / Staging** | `staging` | `noindex, nofollow` (`robots.ts` & `X-Robots-Tag`) | Isolated staging PostgreSQL |
| **Production** | `production` | Indexable (`robots.ts` + `sitemap.ts` active) | Dedicated production PostgreSQL (**never mix dev leads**) |

---

## 2. First-Time Provisioning (Hosted PostgreSQL + Vercel / Node Host)

1. Provision PostgreSQL 15+ (e.g., Supabase or Neon) and obtain pooled `DATABASE_URL` + direct `DIRECT_URL`.
2. Set required production environment variables (refer to `.env.example`):
   - `DATABASE_URL`, `DIRECT_URL`
   - `NEXT_PUBLIC_APP_ENV` (`staging` during UAT; switch to `production` only at go-live)
   - `NEXT_PUBLIC_SITE_URL` (`https://yourdomain.com.bd`)
   - `AUTH_SESSION_SECRET` (64-hex CSPRNG secret)
   - Notification (`NOTIFICATION_PROVIDER=resend`, `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `NOTIFICATION_TO_EMAIL`)
   - Bot protection (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)
3. Apply committed PostgreSQL migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed baseline taxonomy & draft catalogue (with `ADMIN_BOOTSTRAP_EMAIL` + strong `ADMIN_BOOTSTRAP_PASSWORD` set once, then remove bootstrap password env var after initial login):
   ```bash
   npm run db:seed
   ```
5. Build & start:
   ```bash
   npm run build
   npm run start
   ```

---

## 3. Database Backup, Restore & Rollback Procedure

- **Automated Backups:** Enable provider daily automated snapshots (Supabase PITR / Neon branches).
- **Off-Site Logical Snapshot Before Release:**
  ```bash
  pg_dump "$DIRECT_URL" --format=custom --no-owner --file="backup_$(date +%Y%m%d_%H%M%S).dump"
  ```
- **Tested Restore Drill (on isolated staging DB first):**
  ```bash
  pg_restore --clean --if-exists --no-owner --dbname="$STAGING_DIRECT_URL" backup_file.dump
  ```
- **Application Rollback:** Redeploy the previous known-good Git commit/release artifact. Keep PostgreSQL migrations forward-compatible; if a schema rollback is required, restore from the pre-deploy logical snapshot rather than destructive `DROP TABLE`.

---

## 4. Mandatory Pre-Launch Client Approval & Smoke Checklist

Before changing `NEXT_PUBLIC_APP_ENV` from `staging` to `production`, the client must sign off every gate below:

- [ ] Legal/trademark review & approval of business name and final vector logo (`isIdentityProvisional = false`)
- [ ] Domain purchased, DNS verified under client ownership, and HTTPS enforced
- [ ] Verified office phone, WhatsApp (if used), official email, and office address entered in `/admin/settings`
- [ ] Approved initial active Courses & Services curated in `/admin`; draft candidates remain unpublished
- [ ] Regulatory copy & legal disclaimer/privacy policy reviewed by qualified legal/compliance reviewer
- [ ] Live enquiry smoke test submitted on staging/prod, confirmed `PS-2026-XXXXXXXX` stored in `leads`, staff notification delivered, and test lead cleaned up before public traffic
- [ ] Off-site backup & restore test verified
