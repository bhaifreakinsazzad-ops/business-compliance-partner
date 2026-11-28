import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_CATEGORIES } from "../../prisma/seed-data/categories";
import { BOOK_PREVIEW_CATALOG } from "../../src/lib/books/catalog";
import {
  DEFAULT_BOOK_COVER_MEDIA,
  DEFAULT_COURSE_MEDIA,
  listAllGovernedMediaAssets,
  resolveBookCoverAsset,
  resolveCourseThumbnailAsset,
  resolveHeroSlideAsset,
  resolveServiceTrackAsset,
} from "../../src/lib/config/media-manifest";

const ROOT = process.cwd();

describe("V8.2 Governed Media Asset Manifest & Zero-Placeholder Integrity", () => {
  it("resolves every registered asset to a real file on disk within static weight budget", () => {
    const assets = listAllGovernedMediaAssets();
    expect(assets.length).toBeGreaterThanOrEqual(30);

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

  it("maps all 10 course categories deterministically without falling back to default", () => {
    const courseCats = SEED_CATEGORIES.filter((c) => c.pillar === "COURSES");
    expect(courseCats.length).toBe(10);

    const paths = new Set<string>();
    for (const cat of courseCats) {
      const resolved = resolveCourseThumbnailAsset(cat.slug);
      expect(resolved.assetId).not.toBe(DEFAULT_COURSE_MEDIA.assetId);
      expect(resolved.width).toBe(960);
      expect(resolved.height).toBe(540);
      paths.add(resolved.publicPath);
    }
    expect(paths.size).toBe(10);
  });

  it("maps all 11 preview books to portrait 3:4 concept covers and provides category fallback", () => {
    expect(BOOK_PREVIEW_CATALOG.length).toBe(11);
    for (const book of BOOK_PREVIEW_CATALOG) {
      const resolved = resolveBookCoverAsset(book.slug, book.categorySlug);
      expect(resolved.assetId).not.toBe(DEFAULT_BOOK_COVER_MEDIA.assetId);
      expect(resolved.width / resolved.height).toBeCloseTo(3 / 4, 2);
      expect(resolved.approvalStatus).toBe("CONCEPT_PREVIEW");
    }

    const categoryFallback = resolveBookCoverAsset("unknown-slug", "vat-mushak");
    expect(categoryFallback.targetSlug).toBe("vat-mushak-9-1-compliance-field-guide");

    const ultimateFallback = resolveBookCoverAsset("unknown-slug", "unknown-cat");
    expect(ultimateFallback.assetId).toBe(DEFAULT_BOOK_COVER_MEDIA.assetId);
  });

  it("resolves all 4 hero slides and all 4 service tracks", () => {
    for (const id of [
      "ecosystem-overview",
      "professional-courses",
      "tax-vat-services",
      "books-storefront",
    ] as const) {
      const asset = resolveHeroSlideAsset(id);
      expect(asset.width).toBe(1280);
      expect(asset.height).toBe(720);
    }

    for (const trackId of ["tax", "vat", "rjsc", "licensing"] as const) {
      const asset = resolveServiceTrackAsset(trackId);
      expect(asset.width).toBe(960);
      expect(asset.height).toBe(360);
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
