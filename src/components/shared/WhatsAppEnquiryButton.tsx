"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import {
  buildWhatsAppServiceMessage,
  buildWhatsAppUrl,
} from "@/lib/contact/whatsapp";
import { cn } from "@/lib/utils";

export interface WhatsAppEnquiryButtonProps {
  verifiedWhatsapp: string | null;
  serviceName: string;
  servicePath?: string;
  canonicalBaseUrl?: string | null;
  customMessage?: string;
  fallbackHref: string;
  labelBn?: string;
  fallbackLabelBn?: string;
  variant?: "emerald" | "navy" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<
  NonNullable<WhatsAppEnquiryButtonProps["variant"]>,
  string
> = {
  emerald:
    "bg-gradient-to-r from-[#00865a] to-[#009c68] text-ps-white hover:from-[#006d49] hover:to-[#00865a] border border-[#006443]/60 shadow-[0_4px_14px_rgba(0,134,90,0.22)] hover:shadow-[0_6px_18px_rgba(0,134,90,0.3)] hover:-translate-y-0.5",
  navy: "bg-ps-navy text-ps-white hover:bg-ps-midnight border border-transparent shadow-sm hover:-translate-y-0.5",
  outline:
    "bg-ps-white text-ps-success border border-ps-success hover:bg-ps-success/10",
};

const SIZE_CLASSES: Record<
  NonNullable<WhatsAppEnquiryButtonProps["size"]>,
  string
> = {
  sm: "min-h-11 px-4 py-2 text-xs sm:text-sm rounded-[11px]",
  md: "min-h-12 px-5 py-2.5 text-sm rounded-[12px]",
  lg: "min-h-12 px-6 py-3 text-base rounded-[12px]",
};

export function WhatsAppEnquiryButton({
  verifiedWhatsapp,
  serviceName,
  servicePath,
  canonicalBaseUrl,
  customMessage,
  fallbackHref,
  labelBn = "WhatsApp-এ সেবা নিন",
  fallbackLabelBn = "সেবার অনুরোধ করুন",
  variant = "emerald",
  size = "md",
  fullWidth = false,
  className,
}: WhatsAppEnquiryButtonProps) {
  const message =
    customMessage?.trim() ||
    buildWhatsAppServiceMessage({
      serviceName,
      servicePath,
      canonicalBaseUrl,
    });
  const waUrl = buildWhatsAppUrl(verifiedWhatsapp, message);

  const sharedClasses = cn(
    "inline-flex items-center justify-center gap-2 font-bold leading-tight whitespace-nowrap transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );

  if (waUrl) {
    return (
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-cta="true"
        onClick={() => {
          const eventName = servicePath?.startsWith("/books")
            ? "click_book_whatsapp"
            : servicePath?.startsWith("/services")
              ? "click_service_whatsapp"
              : "contact_click_whatsapp";
          const slug = servicePath?.split("/").filter(Boolean).pop();
          trackEvent(eventName, {
            slug: slug ?? undefined,
            sourcePage: servicePath ?? "/",
          });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("bcp:whatsapp_click", {
                detail: {
                  path: servicePath ?? null,
                  timestamp: Date.now(),
                },
              }),
            );
          }
        }}
        className={sharedClasses}
      >
        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{labelBn}</span>
      </a>
    );
  }

  return (
    <Link
      href={fallbackHref}
      data-whatsapp-fallback="true"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold leading-tight whitespace-nowrap transition-[transform,box-shadow,background-color] duration-200 bg-ps-navy text-ps-white hover:bg-ps-midnight hover:-translate-y-0.5 border border-transparent shadow-sm focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      <span>{fallbackLabelBn}</span>
      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}
