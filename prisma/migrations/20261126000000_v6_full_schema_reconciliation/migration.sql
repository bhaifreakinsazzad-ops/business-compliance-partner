-- Business Compliance Partner (BCP) — V6 Full Additive Schema Reconciliation
-- Reconciles Wave 2 (437-record inventory), Wave 3 (Customer Portal & Orgs),
-- Wave 4 (Commerce, Quotes, Orders, Invoices, Payments, LMS),
-- Wave 5 (Compliance Cases, Documents, Appointments, Notifications),
-- and V6 (Governed Bookstore & Order Idempotency Extensions) without destructive resets.

-- =============================================================================
-- WAVE 2: 437-RECORD INVENTORY & PROVENANCE SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS "catalogue_source_records" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "pillar" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sourceDocument" TEXT NOT NULL,
    "sourcePages" TEXT NOT NULL,
    "sourcePageExact" INTEGER,
    "documentedStatus" TEXT NOT NULL,
    "liveAvailability" TEXT NOT NULL,
    "proposedDomain" TEXT,
    "proposedAudience" TEXT,
    "proposedJourney" TEXT,
    "priceBdt" DOUBLE PRECISION,
    "pricingStatus" TEXT NOT NULL DEFAULT 'QUOTE_REQUIRED',
    "authorizedProvider" TEXT,
    "approvedScope" TEXT,
    "turnaround" TEXT,
    "contentVerificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogue_source_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "catalogue_source_records_sourceId_key" ON "catalogue_source_records"("sourceId");
CREATE INDEX IF NOT EXISTS "catalogue_source_records_pillar_category_idx" ON "catalogue_source_records"("pillar", "category");
CREATE INDEX IF NOT EXISTS "catalogue_source_records_contentVerificationStatus_publicat_idx" ON "catalogue_source_records"("contentVerificationStatus", "publicationStatus");

CREATE TABLE IF NOT EXISTS "catalogue_offering_mappings" (
    "id" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "canonicalOfferingType" TEXT NOT NULL,
    "canonicalOfferingId" TEXT,
    "canonicalOfferingSlug" TEXT,
    "matchConfidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "mappingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogue_offering_mappings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "catalogue_offering_mappings_sourceRecordId_idx" ON "catalogue_offering_mappings"("sourceRecordId");
CREATE INDEX IF NOT EXISTS "catalogue_offering_mappings_canonicalOfferingType_canonical_idx" ON "catalogue_offering_mappings"("canonicalOfferingType", "canonicalOfferingSlug");

CREATE TABLE IF NOT EXISTS "import_batches" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "sourceFile" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "importedRecords" INTEGER NOT NULL,
    "skippedRecords" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "log" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "import_batches_batchNumber_key" ON "import_batches"("batchNumber");

-- =============================================================================
-- WAVE 3: CUSTOMER IDENTITY & MULTI-ORGANIZATION SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_key" ON "customers"("email");
CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers"("email");

CREATE TABLE IF NOT EXISTS "customer_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_sessions_tokenHash_key" ON "customer_sessions"("tokenHash");
CREATE INDEX IF NOT EXISTS "customer_sessions_customerId_idx" ON "customer_sessions"("customerId");
CREATE INDEX IF NOT EXISTS "customer_sessions_expiresAt_idx" ON "customer_sessions"("expiresAt");

CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeLicenseNumber" TEXT,
    "bin" TEXT,
    "tin" TEXT,
    "businessType" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "organization_memberships" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "organization_memberships_organizationId_customerId_key" ON "organization_memberships"("organizationId", "customerId");
CREATE INDEX IF NOT EXISTS "organization_memberships_customerId_idx" ON "organization_memberships"("customerId");

-- =============================================================================
-- WAVE 4: COMMERCE, QUOTES, ORDERS, INVOICES, PAYMENTS & LMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS "service_requests" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "customerId" TEXT,
    "organizationId" TEXT,
    "serviceSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scopeDetails" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING_ASSESSMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_requests_publicReference_key" ON "service_requests"("publicReference");
CREATE INDEX IF NOT EXISTS "service_requests_status_createdAt_idx" ON "service_requests"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "service_requests_customerId_idx" ON "service_requests"("customerId");

CREATE TABLE IF NOT EXISTS "quotes" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "requestId" TEXT,
    "customerId" TEXT,
    "totalAmountBdt" DOUBLE PRECISION NOT NULL,
    "govtFeeBdt" DOUBLE PRECISION DEFAULT 0,
    "bcpServiceFeeBdt" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quotes_publicReference_key" ON "quotes"("publicReference");
CREATE INDEX IF NOT EXISTS "quotes_status_idx" ON "quotes"("status");
CREATE INDEX IF NOT EXISTS "quotes_customerId_idx" ON "quotes"("customerId");

CREATE TABLE IF NOT EXISTS "quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceBdt" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "orderKind" TEXT NOT NULL DEFAULT 'SERVICE_QUOTE',
    "quoteId" TEXT,
    "customerId" TEXT,
    "totalBdt" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "shippingAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "orderKind" TEXT NOT NULL DEFAULT 'SERVICE_QUOTE';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "notes" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_publicReference_key" ON "orders"("publicReference");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotencyKey_key" ON "orders"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "orders_paymentStatus_status_idx" ON "orders"("paymentStatus", "status");
CREATE INDEX IF NOT EXISTS "orders_customerId_idx" ON "orders"("customerId");

CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "amountBdt" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DUE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "invoices_customerId_idx" ON "invoices"("customerId");

CREATE TABLE IF NOT EXISTS "payment_records" (
    "id" TEXT NOT NULL,
    "transactionReference" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'SANDBOX',
    "amountBdt" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_records_transactionReference_key" ON "payment_records"("transactionReference");
CREATE INDEX IF NOT EXISTS "payment_records_status_idx" ON "payment_records"("status");

CREATE TABLE IF NOT EXISTS "course_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "course_modules_courseId_sortOrder_idx" ON "course_modules"("courseId", "sortOrder");

CREATE TABLE IF NOT EXISTS "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "videoUrl" TEXT,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "lessons_moduleId_sortOrder_idx" ON "lessons"("moduleId", "sortOrder");

CREATE TABLE IF NOT EXISTS "enrollments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_customerId_courseId_key" ON "enrollments"("customerId", "courseId");
CREATE INDEX IF NOT EXISTS "enrollments_customerId_idx" ON "enrollments"("customerId");

CREATE TABLE IF NOT EXISTS "lesson_progress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_enrollmentId_lessonId_key" ON "lesson_progress"("enrollmentId", "lessonId");

CREATE TABLE IF NOT EXISTS "certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "courseTitleBn" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationCode" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "certificates_certificateNumber_key" ON "certificates"("certificateNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "certificates_verificationCode_key" ON "certificates"("verificationCode");
CREATE INDEX IF NOT EXISTS "certificates_customerId_idx" ON "certificates"("customerId");

-- =============================================================================
-- WAVE 5: COMPLIANCE WORKSPACE, DOCUMENTS & NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS "compliance_cases" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "organizationId" TEXT,
    "customerId" TEXT,
    "titleBn" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "authorityName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSESSMENT_PENDING',
    "deadline" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_cases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "compliance_cases_publicReference_key" ON "compliance_cases"("publicReference");
CREATE INDEX IF NOT EXISTS "compliance_cases_status_idx" ON "compliance_cases"("status");
CREATE INDEX IF NOT EXISTS "compliance_cases_customerId_idx" ON "compliance_cases"("customerId");

CREATE TABLE IF NOT EXISTS "compliance_milestones" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "compliance_milestones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "compliance_milestones_caseId_sortOrder_idx" ON "compliance_milestones"("caseId", "sortOrder");

CREATE TABLE IF NOT EXISTS "documents" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "customerId" TEXT,
    "organizationId" TEXT,
    "caseId" TEXT,
    "requestId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "documents_publicReference_key" ON "documents"("publicReference");
CREATE INDEX IF NOT EXISTS "documents_customerId_idx" ON "documents"("customerId");
CREATE INDEX IF NOT EXISTS "documents_status_idx" ON "documents"("status");

CREATE TABLE IF NOT EXISTS "consultation_appointments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "meetingNotes" TEXT,
    "advisorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_appointments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "consultation_appointments_status_idx" ON "consultation_appointments"("status");

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "recipientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_recipientType_recipientId_isRead_idx" ON "notifications"("recipientType", "recipientId", "isRead");

-- =============================================================================
-- V6: GOVERNED BOOKSTORE & PUBLICATIONS DIVISION
-- =============================================================================

CREATE TABLE IF NOT EXISTS "book_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "shortDescBn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "book_categories_slug_key" ON "book_categories"("slug");
CREATE INDEX IF NOT EXISTS "book_categories_isActive_sortOrder_idx" ON "book_categories"("isActive", "sortOrder");

CREATE TABLE IF NOT EXISTS "books" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT,
    "isbn" TEXT,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "subtitleBn" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "summaryBn" TEXT NOT NULL,
    "audienceBn" TEXT NOT NULL,
    "topicsBn" TEXT[],
    "editionLabel" TEXT,
    "editionNoteBn" TEXT NOT NULL,
    "pagesCount" INTEGER,
    "languageBnEn" TEXT DEFAULT 'বাংলা ও ইংরেজি রেফারেন্স',
    "deliveryMode" TEXT DEFAULT 'PRINT',
    "pricePaisa" INTEGER,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'UPCOMING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "coverPalette" JSONB NOT NULL,
    "relatedCourseCategorySlug" TEXT,
    "relatedServiceCategorySlug" TEXT,
    "relatedLicensingCategorySlug" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "books_slug_key" ON "books"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "books_sku_key" ON "books"("sku");
CREATE INDEX IF NOT EXISTS "books_contentStatus_availabilityStatus_featured_sortOrder_idx" ON "books"("contentStatus", "availabilityStatus", "featured", "sortOrder");
CREATE INDEX IF NOT EXISTS "books_categoryId_idx" ON "books"("categoryId");

CREATE TABLE IF NOT EXISTS "book_inventory_movements" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_inventory_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "book_inventory_movements_bookId_createdAt_idx" ON "book_inventory_movements"("bookId", "createdAt");

CREATE TABLE IF NOT EXISTS "book_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPricePaisa" INTEGER NOT NULL,
    "lineTotalPaisa" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "book_order_items_orderId_idx" ON "book_order_items"("orderId");
CREATE INDEX IF NOT EXISTS "book_order_items_bookId_idx" ON "book_order_items"("bookId");

-- =============================================================================
-- IDEMPOTENT FOREIGN KEY CONSTRAINTS
-- =============================================================================

DO $$ BEGIN ALTER TABLE "catalogue_offering_mappings" ADD CONSTRAINT "catalogue_offering_mappings_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "catalogue_source_records"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "quotes" ADD CONSTRAINT "quotes_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "orders" ADD CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "certificates" ADD CONSTRAINT "certificates_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "compliance_cases" ADD CONSTRAINT "compliance_cases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "compliance_cases" ADD CONSTRAINT "compliance_cases_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "compliance_milestones" ADD CONSTRAINT "compliance_milestones_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "compliance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "documents" ADD CONSTRAINT "documents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "documents" ADD CONSTRAINT "documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "documents" ADD CONSTRAINT "documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "compliance_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "documents" ADD CONSTRAINT "documents_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "consultation_appointments" ADD CONSTRAINT "consultation_appointments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "consultation_appointments" ADD CONSTRAINT "consultation_appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "books" ADD CONSTRAINT "books_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "book_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "book_inventory_movements" ADD CONSTRAINT "book_inventory_movements_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "book_order_items" ADD CONSTRAINT "book_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "book_order_items" ADD CONSTRAINT "book_order_items_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
