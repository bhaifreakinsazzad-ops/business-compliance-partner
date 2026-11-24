import type {
  PublicCourseDetail,
  PublicServiceDetail,
  PublicSiteConfig,
} from "@/types/domain";

export type JsonLdRecord = Record<string, unknown>;

function absoluteUrl(baseUrl: string, pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, `${baseUrl.replace(/\/+$/, "")}/`).toString();
  } catch {
    return baseUrl.replace(/\/+$/, "");
  }
}

function compact<T extends JsonLdRecord>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      return !Array.isArray(value) || value.length > 0;
    }),
  ) as T;
}

export function serializeJsonLd(data: JsonLdRecord): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(
  site: PublicSiteConfig,
  baseUrl: string,
): JsonLdRecord {
  const sameAs = [site.facebookUrl, site.linkedinUrl, site.youtubeUrl].filter(
    (value): value is string => Boolean(value),
  );
  const contactPoint =
    site.verifiedPhone || site.verifiedEmail
      ? [
          compact({
            "@type": "ContactPoint",
            telephone: site.verifiedPhone,
            email: site.verifiedEmail,
            contactType: "customer support",
            areaServed: "BD",
            availableLanguage: ["bn", "en"],
          }),
        ]
      : undefined;

  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl.replace(/\/+$/, "")}#organization`,
    name: site.brandName,
    alternateName: [site.brandDisplayName, site.brandNameBn],
    url: baseUrl.replace(/\/+$/, ""),
    description: site.defaultSeoDescBn,
    slogan: site.taglineEn,
    logo: site.logoAssetPath
      ? absoluteUrl(baseUrl, site.logoAssetPath)
      : undefined,
    address: site.verifiedAddressBn
      ? compact({
          "@type": "PostalAddress",
          streetAddress: site.verifiedAddressBn,
          addressCountry: "BD",
        })
      : undefined,
    contactPoint,
    sameAs,
  });
}

export function buildBreadcrumbJsonLd(
  baseUrl: string,
  items: Array<{ name: string; path: string }>,
): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(baseUrl, item.path),
    })),
  };
}

function organizationReference(baseUrl: string): JsonLdRecord {
  return {
    "@type": "Organization",
    "@id": `${baseUrl.replace(/\/+$/, "")}#organization`,
    name: "Business Compliance Partner",
  };
}

export function buildServiceJsonLd(
  service: PublicServiceDetail,
  baseUrl: string,
): JsonLdRecord {
  return compact({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(baseUrl, `/services/${service.slug}`)}#service`,
    name: service.titleBn,
    alternateName: service.titleEn,
    description: service.summaryBn,
    serviceType: service.categoryNameEn,
    url: absoluteUrl(baseUrl, `/services/${service.slug}`),
    areaServed: { "@type": "Country", name: "Bangladesh" },
    provider: organizationReference(baseUrl),
  });
}

export function buildCourseJsonLd(
  course: PublicCourseDetail,
  baseUrl: string,
): JsonLdRecord {
  return compact({
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${absoluteUrl(baseUrl, `/courses/${course.slug}`)}#course`,
    name: course.titleBn,
    alternateName: course.titleEn,
    description: course.summaryBn,
    url: absoluteUrl(baseUrl, `/courses/${course.slug}`),
    provider: organizationReference(baseUrl),
    courseMode: course.deliveryMode,
    hasCourseInstance: course.deliveryMode
      ? compact({
          "@type": "CourseInstance",
          courseMode: course.deliveryMode,
          instructor: course.instructor
            ? compact({
                "@type": "Person",
                name: course.instructor.nameEn || course.instructor.nameBn,
              })
            : undefined,
        })
      : undefined,
  });
}
