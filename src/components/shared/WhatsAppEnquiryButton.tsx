"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
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
    "bg-ps-success text-ps-white hover:bg-[#006d49] border border-transparent shadow-sm",
  navy: "bg-ps-navy text-ps-white hover:bg-ps-midnight border border-transparent shadow-sm",
  outline:
    "bg-ps-white text-ps-success border border-ps-success hover:bg-ps-success/10",
};

const SIZE_CLASSES: Record<
  NonNullable<WhatsAppEnquiryButtonProps["size"]>,
  string
> = {
  sm: "min-h-11 px-4 py-2 text-xs sm:text-sm rounded-[10px]",
  md: "min-h-12 px-5 py-2.5 text-sm rounded-[12px]",
  lg: "min-h-12 px-6 py-3 text-base rounded-[12px]",
};

export function WhatsAppEnquiryButton({
  verifiedWhatsapp,
  serviceName,
  servicePath,
  canonicalBaseUrl,
  fallbackHref,
  labelBn = "WhatsApp-এ সেবা নিন",
  fallbackLabelBn = "সেবার অনুরোধ করুন",
  variant = "emerald",
  size = "md",
  fullWidth = false,
  className,
}: WhatsAppEnquiryButtonProps) {
  const message = buildWhatsAppServiceMessage({
    serviceName,
    servicePath,
    canonicalBaseUrl,
  });
  const waUrl = buildWhatsAppUrl(verifiedWhatsapp, message);

  const sharedClasses = cn(
    "inline-flex items-center justify-center gap-2 font-semibold leading-tight transition-colors focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
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
        "inline-flex items-center justify-center gap-2 font-semibold leading-tight transition-colors bg-ps-navy text-ps-white hover:bg-ps-midnight border border-transparent shadow-sm focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
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
