import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_CATEGORIES } from "../../prisma/seed-data/categories";
import { BOOK_PREVIEW_CATALOG } from "../../src/lib/books/catalog";
import {
  CUSTOMER_SUPPORT_MEDIA,
  DEFAULT_BOOK_COVER_MEDIA,
  DEFAULT_COURSE_MEDIA,
  EMPTY_STATE_MEDIA_BY_VARIANT,
  INSTITUTIONAL_POSTER_MEDIA,
  INSTITUTIONAL_STUDIO_MEDIA,
  listAllGovernedMediaAssets,
  resolveBookCoverAsset,
  resolveCourseThumbnailAsset,
  resolveEmptyStateAsset,
  resolveHeroSlideAsset,
  resolveInstitutionalAsset,
  resolveServiceTrackAsset,
  resolveSupportBannerAsset,
} from "../../src/lib/config/media-manifest";

const ROOT = process.cwd();

describe("V8.3 Branded Media Asset Manifest & Zero-Placeholder Integrity", () => {
  it("resolves every registered asset to a real file on disk within static weight budget", () => {
    const assets = listAllGovernedMediaAssets();
    expect(assets.length).toBeGreaterThanOrEqual(38);

    for (const asset of assets) {
      expect(asset.publicPath.startsWith("/")).toBe(true);
      expect(asset.altBn.trim().length).toBeGreaterThan(0);

      const diskPath = path.join(ROOT, "public", asset.publicPath);
      expect(fs.existsSync(diskPath)).toBe(true);

      const stats = fs.statSync(diskPath);
      expect(stats.size).toBeGreaterThan(500);
      if (asset.publicPath.endsWith(".webp")) {
        expect(stats.size).toBeLessThan(350 * 1024);
      }
    }
  });

  it("maps all 10 course categories deterministically in exact 16:9 aspect ratio", () => {
    const courseCats = SEED_CATEGORIES.filter((c) => c.pillar === "COURSES");
    expect(courseCats.length).toBe(10);

    const paths = new Set<string>();
    for (const cat of courseCats) {
      const resolved = resolveCourseThumbnailAsset(cat.slug);
      expect(resolved.assetId).not.toBe(DEFAULT_COURSE_MEDIA.assetId);
      expect(resolved.width / resolved.height).toBeCloseTo(16 / 9, 2);
      expect([
        "BCP_SUPPLIED_BRANDED_V83",
        "BCP_REMEDIATED_BRANDED_V83",
        "BCP_FRAMED_WIDE_V83",
      ]).toContain(resolved.provenance);
      paths.add(resolved.publicPath);
    }
    expect(paths.size).toBe(10);
  });

  it("maps all 11 preview books to exact portrait 3:4 branded covers without cross-book borrowing", () => {
    expect(BOOK_PREVIEW_CATALOG.length).toBe(11);
    for (const book of BOOK_PREVIEW_CATALOG) {
      const resolved = resolveBookCoverAsset(book.slug, book.categorySlug);
      expect(resolved.assetId).not.toBe(DEFAULT_BOOK_COVER_MEDIA.assetId);
      expect(resolved.width).toBe(1200);
      expect(resolved.height).toBe(1600);
      expect(resolved.width / resolved.height).toBeCloseTo(3 / 4, 2);
      expect(resolved.approvalStatus).toBe("CONCEPT_PREVIEW");
      expect(resolved.provenance).toBe("BCP_SUPPLIED_BRANDED_V83");
    }

    // Unknown or newly added book slugs MUST NOT borrow another book's titled cover
    const unknownSlugKnownCategory = resolveBookCoverAsset("unknown-slug", "vat-mushak");
    expect(unknownSlugKnownCategory.assetId).toBe(DEFAULT_BOOK_COVER_MEDIA.assetId);

    const ultimateFallback = resolveBookCoverAsset("unknown-slug", "unknown-cat");
    expect(ultimateFallback.assetId).toBe(DEFAULT_BOOK_COVER_MEDIA.assetId);
  });

  it("resolves all 4 hero slides (1672x941), all 4 service tracks, institutional media, support banner, and empty states", () => {
    for (const id of [
      "ecosystem-overview",
      "professional-courses",
      "tax-vat-services",
      "books-storefront",
    ] as const) {
      const asset = resolveHeroSlideAsset(id);
      expect(asset.width).toBe(1672);
      expect(asset.height).toBe(941);
      expect(asset.width / asset.height).toBeCloseTo(16 / 9, 2);
    }

    const expectedServiceDims: Record<"tax" | "vat" | "rjsc" | "licensing", [number, number]> = {
      tax: [1672, 941],
      vat: [1672, 941],
      rjsc: [825, 221],
      licensing: [825, 221],
    };

    for (const trackId of ["tax", "vat", "rjsc", "licensing"] as const) {
      const asset = resolveServiceTrackAsset(trackId);
      expect([asset.width, asset.height]).toEqual(expectedServiceDims[trackId]);
      expect(asset.provenance).toBe("BCP_SUPPLIED_BRANDED_V83");
    }

    expect(resolveInstitutionalAsset("foundation").assetId).toBe(INSTITUTIONAL_POSTER_MEDIA.assetId);
    expect(resolveInstitutionalAsset("foundation").width).toBe(1122);
    expect(resolveInstitutionalAsset("foundation").height).toBe(1402);

    expect(resolveInstitutionalAsset("standards").assetId).toBe(INSTITUTIONAL_STUDIO_MEDIA.assetId);
    expect(resolveSupportBannerAsset().assetId).toBe(CUSTOMER_SUPPORT_MEDIA.assetId);
    expect(resolveSupportBannerAsset().width).toBe(825);
    expect(resolveSupportBannerAsset().height).toBe(221);

    for (const variant of ["courses", "services", "books", "generic"] as const) {
      const emptyAsset = resolveEmptyStateAsset(variant);
      expect(emptyAsset.assetId).toBe(EMPTY_STATE_MEDIA_BY_VARIANT[variant].assetId);
    }
  });

  it("contains zero internal approval wording on customer-facing modules", () => {
    const publicFiles = [
      "src/app/contact/page.tsx",
      "src/app/books/[slug]/page.tsx",
      "src/components/layout/Footer.tsx",
      "src/components/three/BookPreview3D.tsx",
      "src/components/ui/StatCounters.tsx",
      "src/lib/books/catalog.ts",
    ];
    for (const rel of publicFiles) {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      expect(content).not.toMatch(/Client Approval Pending/i);
      expect(content).not.toMatch(/ক্লায়েন্ট অনুমোদনের (পর|অপেক্ষায়)/);
    }
  });
});
