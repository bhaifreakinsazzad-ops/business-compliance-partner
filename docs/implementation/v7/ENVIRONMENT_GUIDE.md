# Environment Configuration Guide — BCP V7.0

Reference `.env.example` for authoritative variable keys (never commit secret values to source control).

## 1. Required Core Variables

| Variable | Purpose | Production Requirement |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection URL | Required |
| `DIRECT_URL` | Direct PostgreSQL connection URL for Prisma migrations | Required (`prisma validate` & `migrate deploy`) |
| `CUSTOMER_SESSION_SECRET` | HMAC/token signing secret for `bcp_customer_session` | Required, high-entropy random (>=32 bytes) |
| `ADMIN_SESSION_SECRET` | Independent signing secret for `bcp_admin_session` | Required, independent from customer secret |
| `HEALTHCHECK_TOKEN` | Bearer / `x-healthcheck-token` secret unlocking full `/api/health` diagnostics | Recommended for uptime/ops probes |

## 2. Durable Private Storage Variables

| Variable | Values / Format | Notes |
|---|---|---|
| `PRIVATE_STORAGE_PROVIDER` | `S3` \| `SUPABASE` \| `LOCAL` | Production MUST set `S3` or `SUPABASE` |
| `PRIVATE_STORAGE_BUCKET` | Private bucket name | Never use a public CDN bucket |
| `PRIVATE_STORAGE_ENDPOINT` | S3 endpoint or Supabase URL | HTTPS required in production |
| `PRIVATE_STORAGE_ACCESS_KEY` | S3 access key (if `S3`) | Server-only |
| `PRIVATE_STORAGE_SECRET_KEY` | S3 secret or Supabase service-role key | Server-only |
| `PRIVATE_STORAGE_REGION` | Region identifier (default `us-east-1`) | Applicable to `S3` |
| `PRIVATE_STORAGE_DIR` | Local filesystem path (non-prod / explicit ephemeral override only) | Outside `public/` |
| `ALLOW_EPHEMERAL_PRIVATE_STORAGE` | `"true"` \| unset | Emergency local override ONLY; leave unset in production |

## 3. Environment & Commerce Flags

- `NEXT_PUBLIC_APP_ENV`: `"production"` | `"staging"` | `"development"`
- `SANDBOX_PAYMENTS_ENABLED`: Must stay `"false"` / unset in production. Sandbox checkout is blocked whenever `NODE_ENV=production` OR `NEXT_PUBLIC_APP_ENV=production`.
- `NEXT_PUBLIC_ANALYTICS_PROVIDER`: Optional client funnel emitter (`"none"` / unset disables dispatch).
