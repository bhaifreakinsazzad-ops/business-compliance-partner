import { describe, expect, it } from "vitest";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppServiceMessage,
  buildWhatsAppUrl,
  isTrustedCanonicalUrl,
  normalizeWhatsAppNumber,
} from "@/lib/contact/whatsapp";
import { siteSettingUpdateSchema } from "@/lib/validation/content";
import {
  listPublishedCourses,
  listPublishedServices,
  sortCourseCategoriesByClientPriority,
} from "@/lib/services/catalogue";

describe("WhatsApp normalization, encoding & validation", () => {
  it("normalizes Bangladesh mobile numbers across common formats and Bengali digits", () => {
    expect(normalizeWhatsAppNumber("01712345678")).toBe("8801712345678");
    expect(normalizeWhatsAppNumber("+8801712345678")).toBe("8801712345678");
    expect(normalizeWhatsAppNumber("8801812345678")).toBe("8801812345678");
    expect(normalizeWhatsAppNumber("008801912-345-678")).toBe("8801912345678");
    expect(normalizeWhatsAppNumber("+৮৮০১৭১২৩৪৫৬৭৮")).toBe("8801712345678");
  });

  it("supports valid international E.164 numbers", () => {
    expect(normalizeWhatsAppNumber("+44 7911 123456")).toBe("447911123456");
    expect(normalizeWhatsAppNumber("0014155552671")).toBe("14155552671");
  });

  it("rejects malformed numbers, invalid BD prefixes, and placeholders", () => {
    expect(normalizeWhatsAppNumber("")).toBeNull();
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber("01112345678")).toBeNull();
    expect(normalizeWhatsAppNumber("017123")).toBeNull();
    expect(normalizeWhatsAppNumber("+880171234567899")).toBeNull();
    expect(normalizeWhatsAppNumber("1xxx-xxxxxx")).toBeNull();
    expect(normalizeWhatsAppNumber("abc12345678")).toBeNull();
    expect(normalizeWhatsAppNumber("11111111111")).toBeNull();
  });

  it("only includes canonical URL when configured with a trusted HTTPS origin", () => {
    expect(isTrustedCanonicalUrl("http://localhost:3000")).toBe(false);
    expect(isTrustedCanonicalUrl("http://127.0.0.1:3000")).toBe(false);
    expect(isTrustedCanonicalUrl("http://bcp.example.com")).toBe(false);
    expect(isTrustedCanonicalUrl("https://bcp.com.bd")).toBe(true);

    const msgWithLocalhost = buildWhatsAppServiceMessage({
      serviceName: "e-TIN ও আয়কর রিটার্ন",
      servicePath: "/services/etin-individual-corporate-tax-return",
      canonicalBaseUrl: "http://localhost:3000",
    });
    expect(msgWithLocalhost).toContain("e-TIN ও আয়কর রিটার্ন");
    expect(msgWithLocalhost).not.toContain("localhost");

    const msgWithProd = buildWhatsAppServiceMessage({
      serviceName: "e-TIN ও আয়কর রিটার্ন",
      servicePath: "/services/etin-individual-corporate-tax-return",
      canonicalBaseUrl: "https://bcp.com.bd",
    });
    expect(msgWithProd).toContain(
      "https://bcp.com.bd/services/etin-individual-corporate-tax-return",
    );
  });

  it("encodes Bengali service message cleanly in wa.me URL and returns null for invalid numbers", () => {
    const msg = buildWhatsAppServiceMessage({
      serviceName: "ভ্যাট ও মূসক রিটার্ন",
    });
    const url = buildWhatsAppUrl("01712345678", msg);
    expect(url).not.toBeNull();
    expect(url!.startsWith("https://wa.me/8801712345678?text=")).toBe(true);

    const decoded = decodeURIComponent(url!.split("?text=")[1]!);
    expect(decoded).toContain("আসসালামু আলাইকুম।");
    expect(decoded).toContain("ভ্যাট ও মূসক রিটার্ন");

    expect(buildWhatsAppUrl("invalid-number", msg)).toBeNull();
    expect(buildWhatsAppGeneralMessage("ট্যাক্স")).toContain("ট্যাক্স");
  });

  it("validates verifiedWhatsapp in siteSettingUpdateSchema", () => {
    const valid = siteSettingUpdateSchema.partial().safeParse({
      verifiedWhatsapp: "+8801712345678",
    });
    expect(valid.success).toBe(true);

    const empty = siteSettingUpdateSchema.partial().safeParse({
      verifiedWhatsapp: "",
    });
    expect(empty.success).toBe(true);

    const invalid = siteSettingUpdateSchema.partial().safeParse({
      verifiedWhatsapp: "01112345678",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("Course category priority & published-only catalogue filtering", () => {
  it("orders the 5 client-prioritized course categories first", async () => {
    const { categories } = await listPublishedCourses();
    const ordered = sortCourseCategoriesByClientPriority(categories);
    expect(ordered.slice(0, 5).map((c) => c.slug)).toEqual([
      "income-tax",
      "vat-and-mushak",
      "egp-and-tender",
      "digital-business-ecommerce",
      "company-secretarial",
    ]);
  });

  it("computes accurate category counts and excludes unpublished/inactive items", async () => {
    const courses = await listPublishedCourses();
    const services = await listPublishedServices();
    expect(courses.categories.length).toBe(10);
    expect(services.categories.length).toBe(11);
    for (const item of courses.items) {
      expect(item.availabilityStatus).not.toBe("INACTIVE");
    }
    for (const item of services.items) {
      expect(item.availabilityStatus).not.toBe("INACTIVE");
    }
  });
});
