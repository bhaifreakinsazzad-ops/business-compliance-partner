import { describe, expect, it } from "vitest";
import { DEFAULT_PUBLIC_SITE_CONFIG } from "@/lib/config/site";
import { normalizeSearchText, slugifyTitle } from "@/lib/content/helpers";
import { findForbiddenContentMatch } from "@/lib/validation/content";
import { SEED_CATEGORIES } from "../../prisma/seed-data/categories";
import { SEED_COURSES } from "../../prisma/seed-data/courses";
import { SEED_FAQS } from "../../prisma/seed-data/faqs";
import { SEED_LICENSING } from "../../prisma/seed-data/licensing";
import { SEED_SERVICES } from "../../prisma/seed-data/services";

describe("Content governance & seed truth guardrails", () => {
  it("contains zero forbidden legacy brands or placeholder contact patterns", () => {
    expect(findForbiddenContentMatch(DEFAULT_PUBLIC_SITE_CONFIG)).toBeNull();
    expect(findForbiddenContentMatch(SEED_CATEGORIES)).toBeNull();
    expect(findForbiddenContentMatch(SEED_COURSES)).toBeNull();
    expect(findForbiddenContentMatch(SEED_SERVICES)).toBeNull();
    expect(findForbiddenContentMatch(SEED_LICENSING)).toBeNull();
    expect(findForbiddenContentMatch(SEED_FAQS)).toBeNull();
  });

  it("contains zero unconfirmed ISD or ASC abbreviations in public or seed catalogues", () => {
    const combined = JSON.stringify({
      courses: SEED_COURSES,
      services: SEED_SERVICES,
      licensing: SEED_LICENSING,
      faqs: SEED_FAQS,
    });
    expect(combined).not.toMatch(/\bISD\b/);
    expect(combined).not.toMatch(/\bASC\b/);
  });

  it("enforces unique slugs within every pillar and deduplicated seed lists", () => {
    const catKeys = SEED_CATEGORIES.map((c) => `${c.pillar}:${c.slug}`);
    expect(new Set(catKeys).size).toBe(catKeys.length);

    const courseSlugs = SEED_COURSES.map((c) => c.slug);
    expect(new Set(courseSlugs).size).toBe(courseSlugs.length);

    const serviceSlugs = SEED_SERVICES.map((s) => s.slug);
    expect(new Set(serviceSlugs).size).toBe(serviceSlugs.length);

    const licensingSlugs = SEED_LICENSING.map((l) => l.slug);
    expect(new Set(licensingSlugs).size).toBe(licensingSlugs.length);
  });

  it("enforces Truthful Staging Mode invariants on courses, licensing, and site settings", () => {
    const publishedCourses = SEED_COURSES.filter(
      (c) => c.contentStatus === "PUBLISHED",
    );
    expect(publishedCourses.length).toBeGreaterThanOrEqual(4);
    for (const course of publishedCourses) {
      expect(course.availabilityStatus).not.toBe("ACTIVE");
    }

    const publishedLicensing = SEED_LICENSING.filter(
      (l) => l.contentStatus === "PUBLISHED",
    );
    for (const entry of publishedLicensing) {
      expect(entry.authorityName.length).toBeGreaterThan(2);
      expect(entry.officialSourceLabel.length).toBeGreaterThan(2);
    }

    // Official client-authorized admin WhatsApp is active; unverified channels remain null
    expect(DEFAULT_PUBLIC_SITE_CONFIG.verifiedPhone).toBeNull();
    expect(DEFAULT_PUBLIC_SITE_CONFIG.verifiedWhatsapp).toBe("+880 1521-537864");
    expect(DEFAULT_PUBLIC_SITE_CONFIG.verifiedEmail).toBeNull();
    expect(DEFAULT_PUBLIC_SITE_CONFIG.verifiedAddressBn).toBeNull();
    expect(DEFAULT_PUBLIC_SITE_CONFIG.facebookUrl).toBeNull();
    expect(DEFAULT_PUBLIC_SITE_CONFIG.linkedinUrl).toBeNull();
  });

  it("normalizes Bengali Unicode and generates clean slugs", () => {
    expect(normalizeSearchText("  VAT &   Mushak  ৯.১ ")).toBe("vat & mushak ৯.১");
    expect(slugifyTitle("Complete e-GP Registration & Tender!")).toBe(
      "complete-e-gp-registration-tender",
    );
  });
});
