-- Business Compliance Partner (BCP) — V7 Executive Hardening Additive Migration
-- Adds authoritative course enrollment model & entitlements, integer paisa financial columns,
-- order reservation/cancellation tracking, document integrity/quarantine/assignment provenance,
-- and server-verified analytics events without destructive drops or resets.

DO $$ BEGIN
  CREATE TYPE "CourseEnrollmentModel" AS ENUM ('FREE', 'PAID', 'ENQUIRY_ONLY', 'INVITATION_ONLY', 'UNAVAILABLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Courses: Explicit enrollment model & integer paisa price
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "enrollmentModel" "CourseEnrollmentModel" NOT NULL DEFAULT 'ENQUIRY_ONLY';
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "pricePaisa" INTEGER;

-- 2. Course Entitlements: Authoritative paid/granted/free access control
CREATE TABLE IF NOT EXISTS "course_entitlements" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'ORDER',
  "orderId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "grantedByAdminId" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "course_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "course_entitlements_customerId_courseId_key" ON "course_entitlements"("customerId", "courseId");
CREATE INDEX IF NOT EXISTS "course_entitlements_status_idx" ON "course_entitlements"("status");

DO $$ BEGIN ALTER TABLE "course_entitlements" ADD CONSTRAINT "course_entitlements_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "course_entitlements" ADD CONSTRAINT "course_entitlements_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "course_entitlements" ADD CONSTRAINT "course_entitlements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Integer Minor-Unit (Paisa) & Currency Hardening + Quote/Order Concurrency Constraints
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BDT';
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "totalAmountPaisa" INTEGER;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "govtFeePaisa" INTEGER DEFAULT 0;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "bcpServiceFeePaisa" INTEGER DEFAULT 0;

UPDATE "quotes"
SET
  "totalAmountPaisa" = COALESCE("totalAmountPaisa", ROUND("totalAmountBdt" * 100)::INTEGER),
  "govtFeePaisa" = COALESCE("govtFeePaisa", ROUND(COALESCE("govtFeeBdt", 0) * 100)::INTEGER),
  "bcpServiceFeePaisa" = COALESCE("bcpServiceFeePaisa", ROUND(COALESCE("bcpServiceFeeBdt", 0) * 100)::INTEGER)
WHERE "totalAmountPaisa" IS NULL;

ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "unitPricePaisa" INTEGER;
UPDATE "quote_items"
SET "unitPricePaisa" = COALESCE("unitPricePaisa", ROUND("unitPriceBdt" * 100)::INTEGER)
WHERE "unitPricePaisa" IS NULL;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotencyHash" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BDT';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subtotalPaisa" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingPaisa" INTEGER DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountPaisa" INTEGER DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "totalPaisa" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reservedUntil" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

UPDATE "orders"
SET
  "totalPaisa" = COALESCE("totalPaisa", ROUND("totalBdt" * 100)::INTEGER),
  "subtotalPaisa" = COALESCE("subtotalPaisa", ROUND("totalBdt" * 100)::INTEGER)
WHERE "totalPaisa" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_quoteId_key" ON "orders"("quoteId");

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BDT';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "amountPaisa" INTEGER;

UPDATE "invoices"
SET "amountPaisa" = COALESCE("amountPaisa", ROUND("amountBdt" * 100)::INTEGER)
WHERE "amountPaisa" IS NULL;

ALTER TABLE "payment_records" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BDT';
ALTER TABLE "payment_records" ADD COLUMN IF NOT EXISTS "amountPaisa" INTEGER;

UPDATE "payment_records"
SET "amountPaisa" = COALESCE("amountPaisa", ROUND("amountBdt" * 100)::INTEGER)
WHERE "amountPaisa" IS NULL;

-- 4. Private Documents: Provenance, Integrity (SHA-256), Quarantine & Staff Assignment
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "sha256" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "storageProvider" TEXT NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "storageBucket" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "quarantineStatus" TEXT NOT NULL DEFAULT 'CLEAR';
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "assignedAdminId" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "documents_quarantineStatus_idx" ON "documents"("quarantineStatus");
CREATE INDEX IF NOT EXISTS "documents_assignedAdminId_idx" ON "documents"("assignedAdminId");

-- 5. Server-Verified Analytics Event Log
CREATE TABLE IF NOT EXISTS "analytics_server_events" (
  "id" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "verificationLevel" TEXT NOT NULL DEFAULT 'server_verified',
  "customerId" TEXT,
  "entityType" TEXT,
  "entityId" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "analytics_server_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "analytics_server_events_eventName_createdAt_idx" ON "analytics_server_events"("eventName", "createdAt");
