# Environment Guide

Use `.env.example` as the non-secret contract. Maintain isolated development, preview and production values.

## Required for an operational environment

- `DATABASE_URL`: pooled, least-privilege runtime PostgreSQL connection.
- `DIRECT_URL`: migration-compatible connection, never exposed to the browser.
- `NEXT_PUBLIC_APP_ENV`: `staging` or `production`.
- `NEXT_PUBLIC_SITE_URL`: canonical absolute URL.
- `AUTH_SESSION_SECRET`: high-entropy server secret.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: required for production rate limiting.
- `TURNSTILE_SECRET_KEY`: required for production public enquiry submission; matching site-key UI integration must be verified before release.

Notification, analytics, bootstrap-admin and retention values are documented in `.env.example`. Empty provider credentials must keep the corresponding feature disabled.

Never commit `.env*`, print credential-bearing connection strings, use the unrelated PowerPointBD project, or place privileged keys in `NEXT_PUBLIC_*` variables.
