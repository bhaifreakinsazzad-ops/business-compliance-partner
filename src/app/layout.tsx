import type { Metadata, Viewport } from "next";
import { EB_Garamond, Hind_Siliguri, Manrope } from "next/font/google";
import {
  DEFAULT_PUBLIC_SITE_CONFIG,
  getCanonicalBaseUrl,
  isStagingEnvironment,
} from "@/lib/config/site";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-eb-garamond",
});

const isStaging = isStagingEnvironment();

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalBaseUrl()),
  title: {
    default: DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoTitleBn,
    template: "%s | Paperwork Squad",
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
  themeColor: "#0B1726",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${manrope.variable} ${ebGaramond.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-ps-ivory text-ps-ink antialiased">
        <a href="#main-content" className="skip-link">
          মূল বিষয়বস্তুতে যান
        </a>
        {children}
      </body>
    </html>
  );
}
