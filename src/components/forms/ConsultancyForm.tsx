"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Lock, MessageCircle, Send } from "lucide-react";
import type {
  ApiResponse,
  LeadSubmissionReceipt,
  Pillar,
  PreferredContactValue,
} from "@/types/domain";
import {
  buildWhatsAppInquiryMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
  OFFICIAL_ADMIN_WHATSAPP_DISPLAY,
} from "@/lib/contact/whatsapp";
import { trackEvent } from "@/lib/analytics/events";
import { LeadSuccessReceipt } from "@/components/forms/LeadSuccessReceipt";
import { cn } from "@/lib/utils";

interface ConsultancyFormProps {
  defaultPillar?: Pillar;
  defaultCategory?: string;
  targetSlug?: string | null;
  targetTitle?: string | null;
  sourcePage: string;
  compact?: boolean;
  verifiedWhatsapp?: string | null;
}

const CATEGORY_OPTIONS = [
  "Income Tax ও রিটার্ন",
  "VAT, BIN ও মূসক",
  "e-GP ও সরকারি টেন্ডার",
  "Smart RJSC ও কোম্পানি গঠন",
  "আমদানি-রপ্তানি ও কাস্টমস",
  "ট্রেড লাইসেন্স / DIFE / ফায়ার / পরিবেশ",
  "অ্যাকাউন্টিং ও বুককিপিং",
  "HR ও শ্রম আইন কমপ্লায়েন্স",
  "কোর্স ও প্রশিক্ষণ সংক্রান্ত",
  "ব্যবসায়িক পরিকল্পনা ও অন্যান্য পরামর্শ",
];

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `ps_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export function ConsultancyForm({
  defaultPillar = "CONSULTANCY",
  defaultCategory = "",
  targetSlug = null,
  targetTitle = null,
  sourcePage,
  compact = false,
  verifiedWhatsapp = OFFICIAL_ADMIN_WHATSAPP_DISPLAY,
}: ConsultancyFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressArea, setAddressArea] = useState("");
  const [categoryContext, setCategoryContext] = useState(
    defaultCategory || (targetTitle ? targetTitle : CATEGORY_OPTIONS[0]!),
  );
  const [problemDescription, setProblemDescription] = useState(
    targetTitle ? `বিষয়: ${targetTitle}\n` : "",
  );
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [preferredContact, setPreferredContact] =
    useState<PreferredContactValue>("ANY");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");

  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    createIdempotencyKey(),
  );
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverErrorBn, setServerErrorBn] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<LeadSubmissionReceipt | null>(null);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string | null>(
    null,
  );
  const [startedTracking, setStartedTracking] = useState(false);

  const effectiveWhatsapp = verifiedWhatsapp ?? OFFICIAL_ADMIN_WHATSAPP_DISPLAY;
  const whatsappDisplay = formatWhatsAppDisplay(effectiveWhatsapp);
  const liveWhatsAppUrl = buildWhatsAppUrl(
    effectiveWhatsapp,
    buildWhatsAppInquiryMessage({
      name,
      mobile,
      addressArea,
      categoryContext,
      problemDescription,
      email,
      targetTitle,
    }),
  );

  const markFormStarted = () => {
    if (!startedTracking) {
      setStartedTracking(true);
      trackEvent("consultancy_form_start", {
        pillar: defaultPillar,
        sourcePage,
      });
    }
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleReset = () => {
    setName("");
    setMobile("");
    setAddressArea("");
    setProblemDescription("");
    setEmail("");
    setWhatsapp("");
    setConsentAccepted(false);
    setFieldErrors({});
    setServerErrorBn(null);
    setReceipt(null);
    setSubmittedWhatsAppUrl(null);
    setStatus("idle");
    setIdempotencyKey(createIdempotencyKey());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "pending") return;

    setServerErrorBn(null);
    const localErrors: Record<string, string[]> = {};

    if (name.trim().length < 2) {
      localErrors.name = ["অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।"];
    }
    if (mobile.trim().length < 11) {
      localErrors.mobile = ["সঠিক মোবাইল নম্বর লিখুন, যেমন 01XXXXXXXXX"];
    }
    if (addressArea.trim().length < 3) {
      localErrors.addressArea = ["আপনার এলাকা বা ঠিকানা লিখুন।"];
    }
    if (problemDescription.trim().length < 10) {
      localErrors.problemDescription = [
        "আপনার প্রয়োজন বা সমস্যা সম্পর্কে অন্তত ১০ অক্ষরে সংক্ষেপে লিখুন।",
      ];
    }
    if (!consentAccepted) {
      localErrors.consentAccepted = [
        "অনুরোধ পাঠানোর আগে তথ্য ব্যবহার ও গোপনীয়তা নীতিতে সম্মতি দিন।",
      ];
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setStatus("error");
      const firstKey = Object.keys(localErrors)[0];
      if (firstKey) {
        const el = formRef.current?.querySelector<HTMLElement>(
          `[name="${firstKey}"]`,
        );
        el?.focus();
      }
      return;
    }

    setFieldErrors({});
    setStatus("pending");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email: email.trim() || null,
          whatsapp: whatsapp.trim() || null,
          addressArea,
          categoryContext,
          pillar: defaultPillar,
          targetSlug,
          targetTitle,
          problemDescription,
          preferredContact,
          consentAccepted,
          idempotencyKey,
          sourcePage,
          websiteHoneypot,
        }),
      });

      const payload = (await response.json()) as ApiResponse<LeadSubmissionReceipt>;

      if (!response.ok || !payload.ok || !payload.data) {
        setStatus("error");
        setServerErrorBn(
          payload.error?.messageBn ||
            "দুঃখিত, অনুরোধটি সংরক্ষণ করা যায়নি। আপনার লেখা তথ্য অক্ষুণ্ণ রয়েছে—আবার চেষ্টা করুন।",
        );
        if (payload.error?.fieldErrors) {
          setFieldErrors(payload.error.fieldErrors);
        }
        return;
      }

      setStatus("success");
      setReceipt(payload.data);
      setSubmittedWhatsAppUrl(
        buildWhatsAppUrl(
          effectiveWhatsapp,
          buildWhatsAppInquiryMessage({
            name,
            mobile,
            addressArea,
            categoryContext,
            problemDescription,
            email,
            targetTitle,
            publicReference: payload.data.publicReference,
          }),
        ),
      );
      trackEvent("consultancy_form_submit_success", {
        pillar: defaultPillar,
        sourcePage,
      });
    } catch {
      setStatus("error");
      setServerErrorBn(
        "নেটওয়ার্ক বা সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। আপনার লেখা তথ্য মুছে যায়নি—পুনরায় চেষ্টা করুন অথবা সরাসরি WhatsApp-এ পাঠান।",
      );
    }
  };

  if (status === "success" && receipt) {
    return (
      <LeadSuccessReceipt
        receipt={receipt}
        whatsappUrl={submittedWhatsAppUrl ?? liveWhatsAppUrl}
        whatsappDisplay={whatsappDisplay}
        onReset={handleReset}
      />
    );
  }

  const inputBaseClass =
    "w-full min-h-12 px-4 py-2.5 rounded-[12px] border border-[#D4CCE3] bg-white text-[#181D26] text-base placeholder:text-[#596775]/70 transition-colors focus:outline-none focus:border-[#51406F] focus:ring-2 focus:ring-[#51406F]/20";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-heading`}
      className={cn(
        "rounded-[16px] border p-6 sm:p-8 space-y-5",
        compact
          ? "bg-white text-[#181D26] border-[#D4CCE3] shadow-xl"
          : "bg-white text-[#181D26] border-[#D4CCE3] shadow-sm",
      )}
    >
      <div className="space-y-1.5">
        <h3 id={`${formId}-heading`} className="text-xl font-bold text-[#081838]">
          পরামর্শের অনুরোধ ফর্ম
        </h3>
        <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
          আপনার অনুরোধ পর্যালোচনা ও যোগাযোগের জন্য এই তথ্য ব্যবহার করা হবে।
        </p>
      </div>

      {targetTitle ? (
        <div className="rounded-[12px] bg-[#F2EFF8] border border-[#D4CCE3] px-4 py-3 text-xs sm:text-sm text-[#081838] font-medium">
          নির্বাচিত বিষয়: <span className="font-bold text-[#51406F]">{targetTitle}</span>
        </div>
      ) : null}

      {/* Accessible error banner */}
      {status === "error" && serverErrorBn ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-[12px] border border-ps-danger/40 bg-ps-danger/5 p-4 space-y-2.5 text-sm text-ps-danger"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverErrorBn}</span>
          </div>
          {liveWhatsAppUrl ? (
            <div className="ps-7">
              <a
                href={liveWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-whatsapp-cta="true"
                className="inline-flex items-center gap-1.5 font-semibold text-ps-success hover:underline underline-offset-4"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  সরাসরি WhatsApp-এ বার্তা পাঠান
                  {whatsappDisplay ? ` (${whatsappDisplay})` : ""}
                </span>
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Honeypot field — hidden from humans & screen readers */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor={`${formId}-hp`}>Website</label>
        <input
          id={`${formId}-hp`}
          name="websiteHoneypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={websiteHoneypot}
          onChange={(e) => setWebsiteHoneypot(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-name`}
            className="block text-sm font-semibold text-ps-navy"
          >
            পূর্ণ নাম <span className="text-ps-danger" aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            enterKeyHint="next"
            value={name}
            onFocus={markFormStarted}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            aria-invalid={Boolean(fieldErrors.name) ? "true" : "false"}
            aria-describedby={fieldErrors.name ? `${formId}-name-err` : undefined}
            placeholder="যেমন: তানভীর আহমেদ"
            className={cn(inputBaseClass, fieldErrors.name && "border-ps-danger")}
          />
          {fieldErrors.name ? (
            <p id={`${formId}-name-err`} className="text-xs text-ps-danger font-medium">
              {fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-mobile`}
            className="block text-sm font-semibold text-ps-navy"
          >
            মোবাইল নম্বর (বাংলাদেশ){" "}
            <span className="text-ps-danger" aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-mobile`}
            name="mobile"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            enterKeyHint="next"
            value={mobile}
            onFocus={markFormStarted}
            onChange={(e) => {
              setMobile(e.target.value);
              clearFieldError("mobile");
            }}
            aria-invalid={Boolean(fieldErrors.mobile) ? "true" : "false"}
            aria-describedby={
              fieldErrors.mobile ? `${formId}-mobile-err` : `${formId}-mobile-hint`
            }
            placeholder="01XXXXXXXXX"
            className={cn(inputBaseClass, fieldErrors.mobile && "border-ps-danger")}
          />
          <p id={`${formId}-mobile-hint`} className="text-xs text-ps-muted">
            ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর (01XXXXXXXXX বা +8801XXXXXXXXX)
          </p>
          {fieldErrors.mobile ? (
            <p id={`${formId}-mobile-err`} className="text-xs text-ps-danger font-medium">
              {fieldErrors.mobile[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-address`}
            className="block text-sm font-semibold text-ps-navy"
          >
            এলাকা / ঠিকানা{" "}
            <span className="text-ps-danger" aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-address`}
            name="addressArea"
            type="text"
            required
            autoComplete="street-address"
            enterKeyHint="next"
            value={addressArea}
            onChange={(e) => {
              setAddressArea(e.target.value);
              clearFieldError("addressArea");
            }}
            aria-invalid={Boolean(fieldErrors.addressArea) ? "true" : "false"}
            aria-describedby={
              fieldErrors.addressArea ? `${formId}-address-err` : undefined
            }
            placeholder="যেমন: মতিঝিল, ঢাকা"
            className={cn(
              inputBaseClass,
              fieldErrors.addressArea && "border-ps-danger",
            )}
          />
          {fieldErrors.addressArea ? (
            <p id={`${formId}-address-err`} className="text-xs text-ps-danger font-medium">
              {fieldErrors.addressArea[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-category`}
            className="block text-sm font-semibold text-ps-navy"
          >
            প্রয়োজনের বিভাগ{" "}
            <span className="text-ps-danger" aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-category`}
            name="categoryContext"
            value={categoryContext}
            onChange={(e) => setCategoryContext(e.target.value)}
            className={inputBaseClass}
          >
            {targetTitle && !CATEGORY_OPTIONS.includes(targetTitle) ? (
              <option value={targetTitle}>{targetTitle}</option>
            ) : null}
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${formId}-problem`}
          className="block text-sm font-semibold text-ps-navy"
        >
          আপনার সমস্যা বা প্রয়োজন সংক্ষেপে লিখুন{" "}
          <span className="text-ps-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${formId}-problem`}
          name="problemDescription"
          required
          rows={compact ? 3 : 4}
          value={problemDescription}
          onChange={(e) => {
            setProblemDescription(e.target.value);
            clearFieldError("problemDescription");
          }}
          aria-invalid={Boolean(fieldErrors.problemDescription) ? "true" : "false"}
          aria-describedby={
            fieldErrors.problemDescription
              ? `${formId}-problem-err`
              : `${formId}-problem-hint`
          }
          placeholder="আপনার ব্যবসা বা শেখার প্রয়োজন সম্পর্কে সংক্ষেপে লিখুন..."
          className={cn(
            "w-full px-4 py-3 rounded-[12px] border border-[#D4CCE3] bg-white text-[#181D26] text-base placeholder:text-[#596775]/70 transition-colors focus:outline-none focus:border-[#51406F] focus:ring-2 focus:ring-[#51406F]/20",
            fieldErrors.problemDescription && "border-ps-danger",
          )}
        />
        <p id={`${formId}-problem-hint`} className="text-xs text-ps-muted inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-ps-navy shrink-0" aria-hidden="true" />
          <span>অনুগ্রহ করে এখানে NID নম্বর, ব্যাংক হিসাব বা পাসপোর্ট তথ্য লিখবেন না।</span>
        </p>
        {fieldErrors.problemDescription ? (
          <p id={`${formId}-problem-err`} className="text-xs text-ps-danger font-medium">
            {fieldErrors.problemDescription[0]}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor={`${formId}-email`}
                className="block text-sm font-semibold text-ps-navy"
              >
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                aria-invalid={Boolean(fieldErrors.email) ? "true" : "false"}
                placeholder="name@company.com"
                className={inputBaseClass}
              />
              {fieldErrors.email ? (
                <p className="text-xs text-ps-danger font-medium">
                  {fieldErrors.email[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`${formId}-whatsapp`}
                className="block text-sm font-semibold text-ps-navy"
              >
                WhatsApp নম্বর (ঐচ্ছিক)
              </label>
              <input
                id={`${formId}-whatsapp`}
                name="whatsapp"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  clearFieldError("whatsapp");
                }}
                aria-invalid={Boolean(fieldErrors.whatsapp) ? "true" : "false"}
                placeholder="01XXXXXXXXX"
                className={inputBaseClass}
              />
              {fieldErrors.whatsapp ? (
                <p className="text-xs text-ps-danger font-medium">
                  {fieldErrors.whatsapp[0]}
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-ps-navy">
              যোগাযোগের পছন্দের মাধ্যম (ঐচ্ছিক)
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(
                [
                  { value: "ANY", label: "যেকোনো মাধ্যম" },
                  { value: "PHONE", label: "ফোন কল" },
                  { value: "WHATSAPP", label: "WhatsApp" },
                  { value: "EMAIL", label: "ইমেইল" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-center gap-2 min-h-11 px-3 py-2 rounded-[10px] border text-xs sm:text-sm cursor-pointer transition-colors",
                    preferredContact === opt.value
                      ? "border-[#51406F] bg-[#F2EFF8] font-semibold text-[#081838]"
                      : "border-[#D4CCE3] bg-white text-[#181D26] hover:bg-[#F2EFF8]/50",
                  )}
                >
                  <input
                    type="radio"
                    name="preferredContact"
                    value={opt.value}
                    checked={preferredContact === opt.value}
                    onChange={() => setPreferredContact(opt.value)}
                    className="accent-[#51406F]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}

      {/* Unchecked Privacy Consent Checkbox */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <input
            id={`${formId}-consent`}
            name="consentAccepted"
            type="checkbox"
            required
            checked={consentAccepted}
            onChange={(e) => {
              setConsentAccepted(e.target.checked);
              clearFieldError("consentAccepted");
            }}
            aria-invalid={Boolean(fieldErrors.consentAccepted) ? "true" : "false"}
            aria-describedby={
              fieldErrors.consentAccepted ? `${formId}-consent-err` : undefined
            }
            className="mt-1 w-5 h-5 rounded accent-[#51406F] shrink-0 cursor-pointer"
          />
          <label
            htmlFor={`${formId}-consent`}
            className="text-xs sm:text-sm text-[#181D26]/90 leading-relaxed cursor-pointer"
          >
            আমি সম্মতি দিচ্ছি যে আমার অনুরোধ পর্যালোচনা ও যোগাযোগের জন্য প্রদত্ত তথ্য
            সংরক্ষণ করা হবে।{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#51406F] underline underline-offset-4 hover:text-[#081838]"
            >
              গোপনীয়তা নীতি দেখুন
            </Link>
            <span className="text-ps-danger" aria-hidden="true"> *</span>
          </label>
        </div>
        {fieldErrors.consentAccepted ? (
          <p id={`${formId}-consent-err`} className="text-xs text-ps-danger font-medium">
            {fieldErrors.consentAccepted[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5 pt-1">
        <button
          type="submit"
          disabled={status === "pending"}
          className="ps-primary-button w-full text-base disabled:opacity-65 disabled:cursor-not-allowed"
        >
          {status === "pending" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>অনুরোধ পাঠানো হচ্ছে...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>পরামর্শের অনুরোধ পাঠান</span>
            </>
          )}
        </button>

        {liveWhatsAppUrl ? (
          <a
            href={liveWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta="true"
            className="inline-flex w-full items-center justify-center gap-2 min-h-12 px-5 py-2.5 rounded-[12px] border border-[#006443]/60 bg-gradient-to-r from-[#00865a] to-[#009c68] text-ps-white text-sm sm:text-base font-bold shadow-[0_4px_14px_rgba(0,134,90,0.2)] hover:from-[#006d49] hover:to-[#00865a] hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              সরাসরি WhatsApp-এ অ্যাডমিনকে পাঠান
              {whatsappDisplay ? ` (${whatsappDisplay})` : ""}
            </span>
          </a>
        ) : null}
      </div>
    </form>
  );
}
