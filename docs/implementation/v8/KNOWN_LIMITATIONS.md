# Known Limitations & Release Disclosures — BCP V8.0

In accordance with BCP release governance honesty requirements, environment boundaries and items awaiting client/staging action are documented explicitly below:

1. **No Live PostgreSQL Server in Container (`EXTERNALLY BLOCKED`):**
   - Schema validation (`prisma generate`), Next.js compilation, and the 437-record catalogue dry-run (`npm run catalogue:dry-run`) ran cleanly inside the container, while `prisma migrate deploy` and `npm run db:seed` require a live PostgreSQL instance in staging/production (`DATABASE_URL`).
   - Public catalogue read paths gracefully fall back to verified local catalogue records during offline preview/build when a database is unavailable, whereas state-mutating APIs (lead submission, customer portal, admin CMS, private storage) fail closed (`503`) unless backing services are configured.
2. **Unverified Corporate Contact Fields Retained as Explicit Notices:**
   - Verified WhatsApp support (`+880 1521-537864`) is active across Header, Services Gateway, Books, Contact, and Footer.
   - Street office address, landline telephone, and corporate support email remain held pending written client sign-off (displayed transparently on `/contact` rather than publishing fabricated or third-party contact details).
3. **Unpublished Books Remain `UPCOMING_PREVIEW` (`প্রকাশনা আসন্ন`):**
   - All 8 flagship BCP handbooks render in the e-commerce storefront (`BooksShowcaseSection`, `/books`, `/books/[slug]`) with honest `প্রকাশনা আসন্ন` / `অনুমোদন সাপেক্ষে প্রকাশিত হবে` notices until final BDT MRP, stock counts, and publication dates are approved by the client.
4. **Workspace Version Control Metadata:**
   - The container workspace omits `.git` history and remote push credentials; committing V8.0 changes and pushing to `https://github.com/bhaifreakinsazzad-ops/business-compliance-partner` must be completed from the connected Git environment.
5. **Production Payment Gateways & Durable Object Storage (`S3` / `SUPABASE`):**
   - Real merchant gateways (`bKash`, `Nagad`, `SSLCommerz`) and live cloud object storage buckets remain external staging/production configurations defined in `.env.example`.
