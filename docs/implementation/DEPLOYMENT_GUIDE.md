# Deployment Guide

## Verified current state

The existing Vercel project is `w9h-engineering/business-compliance-partner`, but its production deployment is sourced from `notrealenginellc/Paperwork-Squad` commit `1d64426`, uses Node 26.x and has no environment variables. Do not promote it as an operational BCP production release.

## Preview procedure

1. Review and push `feature/bcp-platform-v2` to the intended BCP GitHub repository.
2. Reconcile the Vercel Git integration and production branch without deleting deployments or aliases.
3. Select a Vercel-supported Node runtime tested locally (Node 22 is the verified local baseline).
4. Configure isolated preview PostgreSQL, session, Turnstile and distributed rate-limit credentials.
5. Apply reviewed Prisma migrations with `npm run db:migrate`; never use reset or unreviewed schema push.
6. Keep preview noindex and protect it as appropriate.
7. Verify commit metadata, health 200 only with a connected database, durable enquiry persistence, staff login, logs and all public routes.

Production promotion additionally requires the release gates in `INFRASTRUCTURE_AUDIT.md` and explicit owner authorization.
