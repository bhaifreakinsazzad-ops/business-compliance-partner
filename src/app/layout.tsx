import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
} from "next/font/google";
import {
  DEFAULT_PUBLIC_SITE_CONFIG,
  getCanonicalBaseUrl,
  isStagingEnvironment,
} from "@/lib/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceWorkerRegistration } from "@/components/seo/ServiceWorkerRegistration";
import { buildOrganizationJsonLd } from "@/lib/seo/structured-data";
import "./globals.css";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-bengali",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif-bengali",
});

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
    <html
      lang="bn"
      className={`${notoSansBengali.variable} ${notoSerifBengali.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-ps-ivory text-ps-ink antialiased">
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
        {children}
      </body>
    </html>
  );
}
