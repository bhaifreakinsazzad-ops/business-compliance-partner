# Privacy & Data Flow — Personal Data Protection Baseline

**Regulatory Reference:** Bangladesh Personal Data Protection Act 2026 (Act No. 63, dated 10 April 2026) — Legal counsel should validate final commercial wording and section-wise commencement rules prior to public launch.

---

## 1. Data Minimization & Phase-1 Boundaries

**Collected on Public Consultancy / Enquiry Form (`/consultancy` & pillar enquiry modals/forms):**
- Required: Full name, normalized Bangladesh mobile number, area/address, enquiry category/context, brief description, explicit consent checkbox.
- Optional: Email, WhatsApp number, preferred contact method, non-PII UTM campaign source.

**Explicitly Prohibited in Phase 1:**
- National ID (NID) numbers or scans
- Passport scans, TIN/BIN certificates, or tax return PDFs
- Bank statements or financial uploads
- Confidential corporate incorporation documents

*(Document collection workflows are deferred to Phase 3 authenticated private storage if later approved.)*

---

## 2. Consent & End-to-End PII Data Flow

1. **Purpose Notice (Unchecked Consent):** Form displays explicit Bengali purpose statement: *"আপনার অনুরোধ পর্যালোচনা ও যোগাযোগের জন্য এই তথ্য ব্যবহার করা হবে।"* Checkbox starts unchecked (`consentAccepted: false`).
2. **Submission & Storage:** Browser sends `POST /api/leads`. Server validates Zod schema, strips sensitive unexpected keys, normalizes phone, logs `consentAt` UTC timestamp and `privacyPolicyVersion`, and stores record in PostgreSQL `leads` inside a transaction returning `PS-YYYY-XXXXXXXX`.
3. **Zero PII Leakage:**
   - **Analytics (`src/lib/analytics/events.ts`):** `sanitizeAnalyticsPayload()` strips `name`, `mobile`, `phone`, `email`, `addressArea`, `problemDescription`, `publicReference`, etc.
   - **Notifications (`src/lib/notifications/lead-notifier.ts`):** Console & Resend notifications transmit ONLY `publicReference`, `pillar`, `categoryContext`, and `submittedAt`, directing authorized staff into the authenticated Admin Inbox.
   - **Server & DB Logs (`src/lib/db/prisma.ts`):** Query logging disabled; IPs hashed via `hashClientIp()` using `AUTH_SESSION_SECRET`.

---

## 3. Data Retention Policy Placeholder (Approval Gate)

- Configurable via `LEAD_RETENTION_DAYS` env var and `SiteSetting.leadRetentionDays` (default `365` days).
- Automated purge/anonymization cron schedule and formal retention duration must be reviewed and signed off by the client and legal counsel before public launch.
