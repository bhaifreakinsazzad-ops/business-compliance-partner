-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PillarType" AS ENUM ('COURSES', 'SERVICES', 'LICENSING', 'CONSULTANCY');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('ACTIVE', 'UPCOMING', 'INTEREST_ONLY', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR', 'LEAD_MANAGER');

-- CreateEnum
CREATE TYPE "PreferredContact" AS ENUM ('PHONE', 'WHATSAPP', 'EMAIL', 'ANY');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "pillar" "PillarType" NOT NULL,
    "slug" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "shortDescBn" TEXT NOT NULL,
    "shortDescEn" TEXT,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT,
    "titleBn" TEXT,
    "bioBn" TEXT,
    "credentialsSummaryBn" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryBn" TEXT NOT NULL,
    "summaryEn" TEXT,
    "categoryId" TEXT NOT NULL,
    "audienceBn" TEXT NOT NULL,
    "outcomes" TEXT[],
    "syllabus" JSONB NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deliveryMode" TEXT,
    "duration" TEXT,
    "feeDisplay" TEXT,
    "instructorId" TEXT,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'INTEREST_ONLY',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "sourceReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryBn" TEXT NOT NULL,
    "summaryEn" TEXT,
    "categoryId" TEXT NOT NULL,
    "whoNeedsItBn" TEXT NOT NULL,
    "assistanceScopeBn" TEXT NOT NULL,
    "limitationsBn" TEXT NOT NULL,
    "documentsSummary" TEXT[],
    "processSteps" JSONB NOT NULL,
    "authorityName" TEXT,
    "officialSourceLabel" TEXT,
    "officialSourceUrl" TEXT,
    "requiresSpecialist" BOOLEAN NOT NULL DEFAULT false,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "serviceFeeNoteBn" TEXT,
    "govtFeeNoteBn" TEXT,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'INTEREST_ONLY',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licensing_entries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryBn" TEXT NOT NULL,
    "summaryEn" TEXT,
    "categoryId" TEXT NOT NULL,
    "authorityName" TEXT NOT NULL,
    "authorityType" TEXT NOT NULL,
    "officialSourceLabel" TEXT NOT NULL,
    "officialSourceUrl" TEXT,
    "serviceScopeBn" TEXT NOT NULL,
    "limitationsBn" TEXT NOT NULL,
    "documentsSummary" TEXT[],
    "processSummaryBn" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'INTEREST_ONLY',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licensing_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "questionBn" TEXT NOT NULL,
    "answerBn" TEXT NOT NULL,
    "pillar" "PillarType",
    "isRegulatory" BOOLEAN NOT NULL DEFAULT false,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT,
    "addressArea" TEXT NOT NULL,
    "categoryContext" TEXT NOT NULL,
    "pillar" "PillarType" NOT NULL DEFAULT 'CONSULTANCY',
    "targetSlug" TEXT,
    "targetTitle" TEXT,
    "problemDescription" TEXT NOT NULL,
    "preferredContact" "PreferredContact",
    "consentAt" TIMESTAMP(3) NOT NULL,
    "privacyPolicyVersion" TEXT NOT NULL DEFAULT 'v1.0-2026-11',
    "sourcePage" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ipHash" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandName" TEXT NOT NULL DEFAULT 'Paperwork Squad',
    "brandDisplayName" TEXT NOT NULL DEFAULT 'PAPERWORK SQUAD',
    "brandNameBn" TEXT NOT NULL DEFAULT 'পেপারওয়ার্ক স্কোয়াড',
    "taglineBn" TEXT NOT NULL DEFAULT 'শিখুন, সেবা নিন, এগিয়ে যান।',
    "taglineEn" TEXT NOT NULL DEFAULT 'Learn. Grow. Stay Compliant.',
    "logoAssetPath" TEXT NOT NULL DEFAULT '/brand/proposed-logo-concept.jpg',
    "isIdentityProvisional" BOOLEAN NOT NULL DEFAULT true,
    "verifiedPhone" TEXT,
    "verifiedWhatsapp" TEXT,
    "verifiedEmail" TEXT,
    "verifiedAddressBn" TEXT,
    "verifiedAddressEn" TEXT,
    "facebookUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "defaultSeoTitleBn" TEXT NOT NULL DEFAULT 'Paperwork Squad | পেশাদার কোর্স, ব্যবসায়িক সেবা, লাইসেন্সিং ও কনসালটেন্সি',
    "defaultSeoDescBn" TEXT NOT NULL DEFAULT 'বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য কোর্স, ব্যবসায়িক কমপ্লায়েন্স সেবা, লাইসেন্সিং তথ্য ও পরামর্শ সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম।',
    "legalDisclaimerBn" TEXT NOT NULL DEFAULT 'Paperwork Squad একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।',
    "legalDisclaimerEn" TEXT NOT NULL DEFAULT 'Paperwork Squad is an independent professional learning and business compliance assistance platform; it is not a government institution or official portal.',
    "privacyPolicyVersion" TEXT NOT NULL DEFAULT 'v1.0-2026-11',
    "leadRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "stagingNoticeBn" TEXT DEFAULT 'প্রস্তাবিত ব্র্যান্ড কনসেপ্ট ও স্টেজিং সংস্করণ — চূড়ান্ত ব্যবসা ও যোগাযোগের তথ্য অনুমোদনসাপেক্ষ।',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "actorRole" "AdminRole",
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_pillar_isActive_sortOrder_idx" ON "categories"("pillar", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "categories_pillar_slug_key" ON "categories"("pillar", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_contentStatus_availabilityStatus_featured_sortOrder_idx" ON "courses"("contentStatus", "availabilityStatus", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "courses_categoryId_idx" ON "courses"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_contentStatus_availabilityStatus_featured_sortOrde_idx" ON "services"("contentStatus", "availabilityStatus", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "licensing_entries_slug_key" ON "licensing_entries"("slug");

-- CreateIndex
CREATE INDEX "licensing_entries_contentStatus_availabilityStatus_featured_idx" ON "licensing_entries"("contentStatus", "availabilityStatus", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "licensing_entries_categoryId_idx" ON "licensing_entries"("categoryId");

-- CreateIndex
CREATE INDEX "faqs_contentStatus_pillar_sortOrder_idx" ON "faqs"("contentStatus", "pillar", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "leads_publicReference_key" ON "leads"("publicReference");

-- CreateIndex
CREATE UNIQUE INDEX "leads_idempotencyKey_key" ON "leads"("idempotencyKey");

-- CreateIndex
CREATE INDEX "leads_status_createdAt_idx" ON "leads"("status", "createdAt");

-- CreateIndex
CREATE INDEX "leads_pillar_createdAt_idx" ON "leads"("pillar", "createdAt");

-- CreateIndex
CREATE INDEX "leads_mobile_idx" ON "leads"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_tokenHash_key" ON "admin_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "admin_sessions_userId_idx" ON "admin_sessions"("userId");

-- CreateIndex
CREATE INDEX "admin_sessions_expiresAt_idx" ON "admin_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "content_revisions_entityType_entityId_createdAt_idx" ON "content_revisions"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_createdAt_idx" ON "audit_logs"("entityType", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licensing_entries" ADD CONSTRAINT "licensing_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
