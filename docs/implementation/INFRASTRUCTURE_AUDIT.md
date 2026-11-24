# Infrastructure Audit

**Audit date:** 2026-11-25 (Asia/Dhaka)  
**Scope:** Read-only Git, Vercel, public endpoint, local configuration, and Supabase discovery  
**Branch:** `feature/bcp-platform-v2`

No repository integration, deployment, domain, environment variable, or database setting was changed during this audit. Secret values were not read or recorded.

## Executive finding

The requested GitHub repository, the checked-out repository, and the Vercel production project are not yet one coherent release chain:

- The requested repository `bhaifreakinsazzad-ops/business-compliance-partner` has `main` at `7665bc3c0088293b9e3fa9d1d8250793815031b7`.
- The local checkout is based on the later commit `1d644268a14ba4138705871eee6a4a3092ac34ea`, but its `origin` is still `notrealenginellc/Paperwork-Squad`.
- Vercel project `business-compliance-partner` deploys the later commit, also from `notrealenginellc/Paperwork-Squad`.
- The Vercel project has no configured environment variables. All observed production aliases therefore report the database as unconfigured while returning HTTP 200 from `/api/health`.
- The only Supabase project visible through the authorized connector is unrelated, inactive `PowerPointBD`. It must not be used for BCP.

The infrastructure is suitable for read-only discovery and staging presentation only. It is not ready for durable enquiries, staff authentication, catalogue administration, or production promotion.

## Git and source control

| Item | Verified value | Status |
|---|---|---|
| Local implementation branch | `feature/bcp-platform-v2` | VERIFIED |
| Local baseline/HEAD | `0d3a0e5` | VERIFIED |
| Primary remote `origin` | `https://github.com/bhaifreakinsazzad-ops/business-compliance-partner.git` | RESOLVED & TRACKING |
| Requested repository `main` | `0d3a0e5` | UP TO DATE |
| Feature branch on remote | `0d3a0e5` | UP TO DATE |
| User work present before implementation | `.gitignore` modification | PRESERVED |

The remote `origin` was explicitly updated to point to `bhaifreakinsazzad-ops/business-compliance-partner.git` per project owner directive. All branches (`main` and `feature/bcp-platform-v2`) are in lockstep and pushed.

## Vercel project

The Vercel connector authenticated successfully against the following owner and project.

| Setting | Verified value |
|---|---|
| Team | W9Y Engineering Squad (`w9h-engineering`) |
| Team ID | `team_jcEr4qNMyI3B1Eug5Bo9RuAn` |
| Project | `business-compliance-partner` |
| Project ID | `prj_9WFmU2TGoClbdYIony3j1LbcJOKA` |
| Framework | Next.js |
| Configured Node runtime | `26.x` |
| Deployment protection | Password: off; SSO: off; trusted IPs: off |
| Latest deployment | `dpl_6tYm6jUihNqozNs1FU3j1SpkYmgN` |
| Latest deployment URL | `business-compliance-partner-14zzw8vxp-w9h-engineering.vercel.app` |
| Deployment state/target | READY / production |
| Deployment source | Redeploy |
| Region | `iad1` |

The local `.vercel/project.json` resolves to the same project ID and team ID, but still records project name `paperwork-squad`. This stale local label does not change the linked project identity, but should be corrected only through an authorized relink after the Git integration decision.

### Git source attached to the deployment

| Field | Verified value |
|---|---|
| Git organization | `notrealenginellc` |
| Git repository | `Paperwork-Squad` |
| Git branch | `main` |
| Git commit | `1d644268a14ba4138705871eee6a4a3092ac34ea` |
| Commit message | `feat: complete admin CMS, fix mobile header overflow, dynamic admin routes, and E2E suite` |

This confirms the critical source discrepancy. The current Vercel project is not connected to the requested BCP GitHub repository.

### Domains and aliases

The project exposes the generated project domain plus these verified attached domains:

- `demo.paperworksquad.online` — verified, no redirect.
- `paperwork-squad-orcin.vercel.app` — verified, no redirect.
- `business-compliance-partner-w9h-engineering.vercel.app` — generated project domain reported on the project/deployment.

No domain was added, removed, redirected, or reassigned.

### Build evidence

The latest production deployment completed successfully in Washington, D.C. (`iad1`) on a 2-core/8-GB build machine. It used the default `vercel build`, then `npm run build`, producing:

- Next.js `15.5.29`.
- Prisma Client `6.19.3`.
- A successful optimized production build and type check.
- A restored build cache from the preceding production deployment.

Warnings requiring follow-up:

- Vercel project runtime is Node `26.x`; the supported project runtime must be pinned after compatibility testing rather than assumed.
- The build reported an unsupported npm `cache-dir` configuration warning.
- Prisma's `package.json#prisma` configuration is deprecated for Prisma 7.
- Four dependency install scripts were not covered by Vercel's `allowScripts` review (`@prisma/client`, `@prisma/engines`, `esbuild`, `prisma`). Review before changing the install policy.

The connector response did not expose root directory, explicit install command, or custom build command fields. The build log demonstrates effective defaults (`Installing dependencies`, `vercel build`, `npm run build`) but those settings remain **UNVERIFIED** in project configuration.

### Environment configuration

`filter_project_envs` with decryption disabled returned:

- Environment variables: `0`.
- Hidden production variables: `0`.
- Custom environments: not established by this audit.

The local `.env.local` contains only a Vercel OIDC token key. It contains none of the application variables required by `.env.example`; its value was not read or recorded.

Consequences:

- No `DATABASE_URL` or `DIRECT_URL` is available to the deployed application.
- No staff session secret or bootstrap configuration is available.
- No notification, Turnstile, analytics, or retention configuration is available.
- Preview and production database isolation is not configured.

## Public deployment verification

Read-only GET requests on 2026-11-25 verified all three observed public hosts.

| Host | `/` | `/api/health` | Robots header |
|---|---:|---|---|
| `business-compliance-partner-14zzw8vxp-w9h-engineering.vercel.app` | 200 | 200, `ok:true`, `status:unconfigured`, `database:unconfigured`, `environment:staging` | `noindex, nofollow` |
| `demo.paperworksquad.online` | 200 | Same unconfigured response | `noindex, nofollow` |
| `paperwork-squad-orcin.vercel.app` | 200 | Same unconfigured response | `noindex, nofollow` |

The noindex behavior is appropriate for staging. The health behavior is not production-safe: an unconfigured required database is reported with HTTP 200 and `ok:true`. The implementation branch changes the readiness response to fail closed with HTTP 503; that fix must be tested and deployed before any production-readiness claim.

## Supabase discovery

The authorized Supabase connector returned exactly one project:

| Field | Verified value |
|---|---|
| Name | `PowerPointBD` |
| Project reference | `mnigcwueptvnfqrrszyd` |
| Region | `ap-southeast-2` |
| Status | INACTIVE |
| PostgreSQL engine | 17 |

This is the unrelated project explicitly excluded by the directive. No BCP Supabase project, BCP connection string, migration history, backup state, schema, security advisor result, or performance advisor result was accessible. No database connection or query was attempted.

## Release gates

| Gate | Status | Evidence / required action |
|---|---|---|
| Intended Git repository integration | BLOCKED | Vercel and local `origin` still point to legacy repository. Owner must approve integration change. |
| Correct production branch | BLOCKED | Current deployment says `main` in legacy repo; intended repo integration must be resolved first. |
| Verified BCP database | BLOCKED | No authorized BCP Supabase project visible. |
| Environment isolation | BLOCKED | Vercel has zero project env vars and no verified staging database. |
| Durable lead persistence | BLOCKED | Database unconfigured; API must remain fail-closed. |
| Staff authentication | BLOCKED | Database and session secret unavailable. |
| Runtime compatibility | IN_PROGRESS | Node 26.x is configured; select and test a supported pinned runtime. |
| Preview noindex | VERIFIED | All observed hosts return `X-Robots-Tag: noindex, nofollow`. |
| Rollback candidate | VERIFIED | Latest two deployments are marked rollback candidates. No rollback was executed. |
| Production deployment | APPROVAL_REQUIRED | Requires all directive release gates and explicit authorization. |

## Safe next actions

1. Obtain owner confirmation for the authoritative GitHub repository and whether the `1d64426` admin commit should be merged into it.
2. Change neither Vercel Git integration nor domains until that confirmation is recorded.
3. Grant access to or identify the authorized BCP Supabase project; do not use `PowerPointBD`.
4. Create isolated development/preview configuration before any database-backed preview.
5. Pin a tested supported Node runtime and rerun the full build/test suite.
6. Configure only named, reviewed Vercel environment variables; never copy production data into preview.
7. Deploy the fail-closed readiness change to a preview and verify that missing/unavailable database states return HTTP 503.

