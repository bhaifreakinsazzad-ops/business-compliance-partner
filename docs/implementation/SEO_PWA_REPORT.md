# SEO and PWA Foundation Report

Date: 2026-11-25 (Asia/Dhaka)

## Implemented

- Bengali BCP web manifest with official palette, application identity and useful public shortcuts.
- No icon paths are declared because the approved BCP icon/logo binary is not present. This avoids fabricating assets or returning broken icon URLs.
- Noindex offline fallback explaining that private, admin and financial data are not stored offline.
- Versioned minimal service worker that precaches only `/offline`, uses it only after a failed public navigation, and never caches API, admin, account, dashboard, document, billing or learning routes.
- Production-only service-worker registration component as progressive enhancement.
- Reusable, escaped JSON-LD builders and renderer for Organization, BreadcrumbList, Service and Course data.
- Structured data deliberately omits unsupported prices, offers, ratings, contacts, addresses, instructors and course instances.

## Integration contract

The assigned workstream did not modify shared layouts or catalogue pages. To activate after review:

1. Supply approved square BCP icons (at least 192×192 and 512×512, including a reviewed maskable asset), then add their real paths to `src/app/manifest.ts`.
2. Mount `<ServiceWorkerRegistration />` once in the root layout only after the PWA rollout is approved. It registers only when `NEXT_PUBLIC_APP_ENV=production`.
3. Render `<JsonLd data={buildOrganizationJsonLd(...)} />` on the public root surface.
4. Render verified breadcrumb JSON-LD on public catalogue/detail routes.
5. Render Service or Course JSON-LD only after the corresponding record has passed the existing publication/visibility checks.

Until steps 1–2 are complete, the manifest and offline route are available but installability/offline interception must not be described as operational.

## Verification

`tests/unit/seo-pwa.test.ts` covers manifest truthfulness, missing-data omission, absolute breadcrumbs, JSON escaping, unsupported commercial/review claims, and private-cache exclusions.
