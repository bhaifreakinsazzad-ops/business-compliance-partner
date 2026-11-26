import type { Metadata, Viewport } from "next";
import {
  DEFAULT_PUBLIC_SITE_CONFIG,
  getCanonicalBaseUrl,
  isStagingEnvironment,
} from "@/lib/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceWorkerRegistration } from "@/components/seo/ServiceWorkerRegistration";
import { AppMotionProvider } from "@/components/motion/AppMotionProvider";
import { ReadingProgressBar } from "@/components/motion/ReadingProgressBar";
import { buildOrganizationJsonLd } from "@/lib/seo/structured-data";
import "./globals.css";

const isStaging = isStagingEnvironment();

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalBaseUrl()),
  title: {
    default: DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoTitleBn,
    template: "%s | Business Compliance Partner",
  },
  description: DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoDescBn,
  robots: isStaging
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: DEFAULT_PUBLIC_SITE_CONFIG.brandName,
    title: DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoTitleBn,
    description: DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoDescBn,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081838",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-canvas text-text-body antialiased">
        <JsonLd
          data={buildOrganizationJsonLd(
            DEFAULT_PUBLIC_SITE_CONFIG,
            getCanonicalBaseUrl(),
          )}
          id="organization-jsonld"
        />
        <ServiceWorkerRegistration />
        <a href="#main-content" className="skip-link">
          মূল বিষয়বস্তুতে যান
        </a>
        <AppMotionProvider>
          <ReadingProgressBar />
          {children}
        </AppMotionProvider>
      </body>
    </html>
  );
}
