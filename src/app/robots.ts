import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl, isStagingEnvironment } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalBaseUrl();

  if (isStagingEnvironment()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
