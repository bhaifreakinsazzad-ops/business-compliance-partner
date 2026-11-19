import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/config/site";
import { getPublishedSlugManifest } from "@/lib/services/catalogue";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getCanonicalBaseUrl();
  const manifest = await getPublishedSlugManifest();
  const now = new Date();

  const staticRoutes = [
    "",
    "/courses",
    "/services",
    "/licensing",
    "/consultancy",
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const courseRoutes = manifest.courses.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const serviceRoutes = manifest.services.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const licensingRoutes = manifest.licensing.map((slug) => ({
    url: `${baseUrl}/licensing/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...serviceRoutes,
    ...licensingRoutes,
  ];
}
