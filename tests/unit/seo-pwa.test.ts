import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { DEFAULT_PUBLIC_SITE_CONFIG } from "@/lib/config/site";
import {
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildOrganizationJsonLd,
  buildServiceJsonLd,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
import type { PublicCourseDetail, PublicServiceDetail } from "@/types/domain";

describe("SEO structured data and PWA safety", () => {
  it("publishes a truthful Bengali BCP manifest without nonexistent icons", () => {
    const value = manifest();
    expect(value.name).toBe("Business Compliance Partner");
    expect(value.lang).toBe("bn-BD");
    expect(value.start_url).toBe("/");
    expect(value.theme_color).toBe("#081838");
    expect(value.icons).toBeUndefined();
  });

  it("omits unverified organization contacts and missing logo", () => {
    const data = buildOrganizationJsonLd(
      DEFAULT_PUBLIC_SITE_CONFIG,
      "https://bcp.example",
    );
    expect(data.name).toBe("Business Compliance Partner");
    expect(data).not.toHaveProperty("logo");
    expect(data).not.toHaveProperty("contactPoint");
    expect(data).not.toHaveProperty("address");
  });

  it("builds ordered absolute breadcrumbs and escapes unsafe JSON-LD text", () => {
    const data = buildBreadcrumbJsonLd("https://bcp.example", [
      { name: "হোম", path: "/" },
      { name: "সেবা", path: "/services" },
    ]);
    expect(data.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: "https://bcp.example/" }),
      expect.objectContaining({ position: 2, item: "https://bcp.example/services" }),
    ]);
    expect(serializeJsonLd({ value: "</script>" })).not.toContain("</script>");
  });

  it("does not invent prices, ratings or unverified course instances", () => {
    const service = {
      slug: "tax-support",
      titleBn: "ট্যাক্স সহায়তা",
      titleEn: "Tax support",
      summaryBn: "নথি প্রস্তুতি সহায়তা",
      categoryNameEn: "Tax",
    } as PublicServiceDetail;
    const course = {
      slug: "tax-course",
      titleBn: "ট্যাক্স কোর্স",
      titleEn: "Tax course",
      summaryBn: "প্রকাশিত কোর্স সারাংশ",
      deliveryMode: null,
      instructor: null,
    } as PublicCourseDetail;

    const serviceData = buildServiceJsonLd(service, "https://bcp.example");
    const courseData = buildCourseJsonLd(course, "https://bcp.example");
    expect(serviceData).not.toHaveProperty("offers");
    expect(serviceData).not.toHaveProperty("aggregateRating");
    expect(courseData).not.toHaveProperty("offers");
    expect(courseData).not.toHaveProperty("hasCourseInstance");
  });

  it("service worker never caches private routes or successful navigations", () => {
    const source = readFileSync(resolve("public/sw.js"), "utf8");
    expect(source).toContain('"/admin"');
    expect(source).toContain('"/api"');
    expect(source).toContain('"/documents"');
    expect(source).not.toMatch(/cache\.put\s*\(/);
    expect(source).not.toMatch(/caches\.open\([^)]*\)[\s\S]*fetch\(request\)[\s\S]*cache/i);
  });
});
