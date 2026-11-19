# Staff Admin CMS & Lead Inbox Guide (`/admin`)

> *(Wave 2 `admin-cms` implements the full UI pages on top of Wave 1 `backend-core` APIs and the frozen RBAC/Session foundation.)*

---

## 1. Staff Roles & Least-Privilege Matrix

| Role | Dashboard | Courses / Services / Licensing / FAQs | Leads Inbox & CSV Export | Site Settings, Users & Audit Logs |
|---|---|---|---|---|
| `ADMIN` | Yes | Full CRUD + Publish/Unpublish | Full View, Status, Notes, Assign, CSV Export | Yes |
| `EDITOR` | Yes | Full CRUD + Publish/Unpublish + Revisions | **Denied (403)** | **Denied (403)** |
| `LEAD_MANAGER` | Yes | **Denied (403)** | View, Filter, Status, Notes, Assign, CSV Export | **Denied (403)** |

---

## 2. Content Workflow Rules (Courses, Services, Licensing, FAQs)

1. Imported candidates from `Business Compliance Partner.pdf` begin in `DRAFT` or `PENDING_REVIEW` (`INTEREST_ONLY`).
2. Before setting any item to `PUBLISHED`, an Editor or Admin must verify:
   - Accurate Bengali title & summary (`findForbiddenContentMatch` passes)
   - Authority attribution & official link checked date (`lastVerifiedAt` + `verifiedBy`) for regulatory items
   - **Courses Mode A Rule:** Keep `feeDisplay`, `duration`, `deliveryMode`, and `instructorId` blank (`null`) until client confirms real operational schedules and instructors.
3. Every create/update/publish action writes a snapshot to `content_revisions` and an entry to `audit_logs`.

---

## 3. Lead Inbox Workflow (`/admin/leads`)

1. New form submissions arrive as `NEW` with unique reference ID `PS-YYYY-XXXXXXXX`.
2. Allowed status transitions tracked with timestamps (`contactedAt`, `closedAt`):
   `NEW` → `REVIEWED` → `CONTACTED` → `QUALIFIED` → `CONVERTED` | `CLOSED` | `SPAM`.
3. Only `ADMIN` and `LEAD_MANAGER` can export sanitized CSV lead reports (`/api/admin/leads/export`), and every export event is logged in `audit_logs`.

---

## 4. Site Settings (`/admin/settings`)

Update `SiteSetting` without touching code:
- Final legal/working brand name, Bangla brand name, and white-label logo path (`logoAssetPath`)
- Toggle provisional identity flag (`isIdentityProvisional`) once logo/name are legally cleared
- Verified phone, WhatsApp, email, Dhaka/BD office address, and social URLs (empty/`null` fields stay cleanly hidden on public pages)
