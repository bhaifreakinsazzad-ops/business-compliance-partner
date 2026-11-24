import { AdminRole, PillarType, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security/password";
import { SEED_CATEGORIES } from "./seed-data/categories";
import { SEED_COURSES } from "./seed-data/courses";
import { SEED_FAQS } from "./seed-data/faqs";
import { SEED_LICENSING } from "./seed-data/licensing";
import { SEED_SERVICES } from "./seed-data/services";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] Starting Business Compliance Partner database seed...");

  // 1. Default white-label SiteSetting (NO fake contacts, NO secrets)
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      brandName: "Business Compliance Partner",
      brandDisplayName: "BUSINESS COMPLIANCE PARTNER",
      brandNameBn: "বিজনেস কমপ্লায়েন্স পার্টনার",
      taglineBn: "এক অংশীদার। সম্পূর্ণ সমাধান। আত্মবিশ্বাসী প্রবৃদ্ধি।",
      taglineEn: "One Partner. Complete Solutions. Confident Growth.",
      logoAssetPath: "",
      isIdentityProvisional: false,
      defaultSeoTitleBn:
        "Business Compliance Partner | ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ",
      legalDisclaimerBn:
        "Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।",
      legalDisclaimerEn:
        "Business Compliance Partner (BCP) is an independent professional learning and compliance assistance platform; it is not a government authority or portal.",
      stagingNoticeBn:
        "স্টেজিং সংস্করণ — যোগাযোগের তথ্য, মূল্য ও সক্রিয় অফার অনুমোদনসাপেক্ষ।",
    },
    create: {
      id: "default",
      brandName: "Business Compliance Partner",
      brandDisplayName: "BUSINESS COMPLIANCE PARTNER",
      brandNameBn: "বিজনেস কমপ্লায়েন্স পার্টনার",
      taglineBn: "এক অংশীদার। সম্পূর্ণ সমাধান। আত্মবিশ্বাসী প্রবৃদ্ধি।",
      taglineEn: "One Partner. Complete Solutions. Confident Growth.",
      logoAssetPath: "",
      isIdentityProvisional: false,
      verifiedPhone: null,
      verifiedWhatsapp: null,
      verifiedEmail: null,
      verifiedAddressBn: null,
      verifiedAddressEn: null,
      facebookUrl: null,
      linkedinUrl: null,
      youtubeUrl: null,
      defaultSeoTitleBn:
        "Business Compliance Partner | ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ",
      defaultSeoDescBn:
        "বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য কোর্স, ব্যবসায়িক কমপ্লায়েন্স সেবা, লাইসেন্সিং তথ্য ও পরামর্শ সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম।",
      legalDisclaimerBn:
        "Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।",
      legalDisclaimerEn:
        "Business Compliance Partner (BCP) is an independent professional learning and compliance assistance platform; it is not a government authority or portal.",
      privacyPolicyVersion: "v1.0-2026-11",
      leadRetentionDays: 365,
      stagingNoticeBn:
        "স্টেজিং সংস্করণ — যোগাযোগের তথ্য, মূল্য ও সক্রিয় অফার অনুমোদনসাপেক্ষ।",
    },
  });

  // 2. Seed Categories across Courses, Services, and Licensing
  const categoryMap = new Map<string, string>();
  for (const cat of SEED_CATEGORIES) {
    const record = await prisma.category.upsert({
      where: {
        pillar_slug: {
          pillar: cat.pillar,
          slug: cat.slug,
        },
      },
      update: {
        nameBn: cat.nameBn,
        nameEn: cat.nameEn,
        shortDescBn: cat.shortDescBn,
        shortDescEn: cat.shortDescEn,
        iconName: cat.iconName,
        sortOrder: cat.sortOrder,
      },
      create: {
        pillar: cat.pillar,
        slug: cat.slug,
        nameBn: cat.nameBn,
        nameEn: cat.nameEn,
        shortDescBn: cat.shortDescBn,
        shortDescEn: cat.shortDescEn,
        iconName: cat.iconName,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap.set(`${cat.pillar}:${cat.slug}`, record.id);
  }

  // 3. Seed Courses (Mode A candidates — curated launch set PUBLISHED/UPCOMING or INTEREST_ONLY, rest DRAFT)
  for (const course of SEED_COURSES) {
    const categoryId = categoryMap.get(`${PillarType.COURSES}:${course.categorySlug}`);
    if (!categoryId) {
      throw new Error(`Missing COURSES category for slug: ${course.categorySlug}`);
    }
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        titleBn: course.titleBn,
        titleEn: course.titleEn,
        summaryBn: course.summaryBn,
        summaryEn: course.summaryEn,
        categoryId,
        audienceBn: course.audienceBn,
        outcomes: course.outcomes,
        syllabus: course.syllabus as unknown as object,
        aliases: course.aliases,
        sortOrder: course.sortOrder,
      },
      create: {
        slug: course.slug,
        titleBn: course.titleBn,
        titleEn: course.titleEn,
        summaryBn: course.summaryBn,
        summaryEn: course.summaryEn,
        categoryId,
        audienceBn: course.audienceBn,
        outcomes: course.outcomes,
        syllabus: course.syllabus as unknown as object,
        aliases: course.aliases,
        deliveryMode: null,
        duration: null,
        feeDisplay: null,
        instructorId: null,
        contentStatus: course.contentStatus,
        availabilityStatus: course.availabilityStatus,
        featured: course.featured,
        sortOrder: course.sortOrder,
        verifiedBy: course.verifiedBy,
        lastVerifiedAt: course.lastVerifiedAt,
        sourceReference: "Business Compliance Partner PDF (Candidate Inventory)",
      },
    });
  }

  // 4. Seed Professional Services (Deduplicated PDF inventory, zero ISD/ASC)
  for (const svc of SEED_SERVICES) {
    const categoryId = categoryMap.get(`${PillarType.SERVICES}:${svc.categorySlug}`);
    if (!categoryId) {
      throw new Error(`Missing SERVICES category for slug: ${svc.categorySlug}`);
    }
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {
        titleBn: svc.titleBn,
        titleEn: svc.titleEn,
        summaryBn: svc.summaryBn,
        summaryEn: svc.summaryEn,
        categoryId,
        whoNeedsItBn: svc.whoNeedsItBn,
        assistanceScopeBn: svc.assistanceScopeBn,
        limitationsBn: svc.limitationsBn,
        documentsSummary: svc.documentsSummary,
        processSteps: svc.processSteps as unknown as object,
        authorityName: svc.authorityName,
        officialSourceLabel: svc.officialSourceLabel,
        officialSourceUrl: svc.officialSourceUrl,
        requiresSpecialist: svc.requiresSpecialist,
        aliases: svc.aliases,
        sortOrder: svc.sortOrder,
      },
      create: {
        slug: svc.slug,
        titleBn: svc.titleBn,
        titleEn: svc.titleEn,
        summaryBn: svc.summaryBn,
        summaryEn: svc.summaryEn,
        categoryId,
        whoNeedsItBn: svc.whoNeedsItBn,
        assistanceScopeBn: svc.assistanceScopeBn,
        limitationsBn: svc.limitationsBn,
        documentsSummary: svc.documentsSummary,
        processSteps: svc.processSteps as unknown as object,
        authorityName: svc.authorityName,
        officialSourceLabel: svc.officialSourceLabel,
        officialSourceUrl: svc.officialSourceUrl,
        requiresSpecialist: svc.requiresSpecialist,
        aliases: svc.aliases,
        serviceFeeNoteBn: svc.serviceFeeNoteBn,
        govtFeeNoteBn: svc.govtFeeNoteBn,
        contentStatus: svc.contentStatus,
        availabilityStatus: svc.availabilityStatus,
        featured: svc.featured,
        sortOrder: svc.sortOrder,
        lastVerifiedAt: svc.lastVerifiedAt,
        verifiedBy: svc.verifiedBy,
      },
    });
  }

  // 5. Seed Licensing & Registration Entries
  for (const lic of SEED_LICENSING) {
    const categoryId = categoryMap.get(`${PillarType.LICENSING}:${lic.categorySlug}`);
    if (!categoryId) {
      throw new Error(`Missing LICENSING category for slug: ${lic.categorySlug}`);
    }
    await prisma.licensingEntry.upsert({
      where: { slug: lic.slug },
      update: {
        titleBn: lic.titleBn,
        titleEn: lic.titleEn,
        summaryBn: lic.summaryBn,
        summaryEn: lic.summaryEn,
        categoryId,
        authorityName: lic.authorityName,
        authorityType: lic.authorityType,
        officialSourceLabel: lic.officialSourceLabel,
        officialSourceUrl: lic.officialSourceUrl,
        serviceScopeBn: lic.serviceScopeBn,
        limitationsBn: lic.limitationsBn,
        documentsSummary: lic.documentsSummary,
        processSummaryBn: lic.processSummaryBn,
        aliases: lic.aliases,
        sortOrder: lic.sortOrder,
      },
      create: {
        slug: lic.slug,
        titleBn: lic.titleBn,
        titleEn: lic.titleEn,
        summaryBn: lic.summaryBn,
        summaryEn: lic.summaryEn,
        categoryId,
        authorityName: lic.authorityName,
        authorityType: lic.authorityType,
        officialSourceLabel: lic.officialSourceLabel,
        officialSourceUrl: lic.officialSourceUrl,
        serviceScopeBn: lic.serviceScopeBn,
        limitationsBn: lic.limitationsBn,
        documentsSummary: lic.documentsSummary,
        processSummaryBn: lic.processSummaryBn,
        aliases: lic.aliases,
        contentStatus: lic.contentStatus,
        availabilityStatus: lic.availabilityStatus,
        featured: lic.featured,
        sortOrder: lic.sortOrder,
        lastVerifiedAt: lic.lastVerifiedAt,
        verifiedBy: lic.verifiedBy,
      },
    });
  }

  // 6. Seed FAQs idempotently by questionBn
  for (const faq of SEED_FAQS) {
    const existing = await prisma.faq.findFirst({
      where: { questionBn: faq.questionBn },
    });
    if (!existing) {
      await prisma.faq.create({
        data: {
          questionBn: faq.questionBn,
          answerBn: faq.answerBn,
          pillar: faq.pillar,
          isRegulatory: faq.isRegulatory,
          contentStatus: faq.contentStatus,
          sortOrder: faq.sortOrder,
          lastVerifiedAt: faq.lastVerifiedAt,
          verifiedBy: faq.verifiedBy,
        },
      });
    }
  }

  // 7. Optional Bootstrap Admin User (strictly from env vars, never hard-coded)
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const adminName = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Platform Administrator";

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error(
        "ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters long.",
      );
    }
    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { name: adminName, role: AdminRole.ADMIN, isActive: true },
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    console.log(`[seed] Bootstrap admin ensured for ${adminEmail}`);
  } else {
    console.log(
      "[seed] ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD not set — skipping bootstrap admin creation.",
    );
  }

  console.log(
    `[seed] Complete: ${SEED_CATEGORIES.length} categories, ${SEED_COURSES.length} courses, ${SEED_SERVICES.length} services, ${SEED_LICENSING.length} licensing entries, ${SEED_FAQS.length} FAQs.`,
  );
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
