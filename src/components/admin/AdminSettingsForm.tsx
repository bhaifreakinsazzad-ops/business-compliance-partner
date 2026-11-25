"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { normalizeWhatsAppNumber } from "@/lib/contact/whatsapp";

export interface SiteSettingsFormValues {
  brandName: string;
  brandDisplayName: string;
  brandNameBn: string;
  taglineBn: string;
  taglineEn: string;
  logoAssetPath: string;
  isIdentityProvisional: boolean;
  verifiedPhone: string;
  verifiedWhatsapp: string;
  verifiedEmail: string;
  verifiedAddressBn: string;
  verifiedAddressEn: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  defaultSeoTitleBn: string;
  defaultSeoDescBn: string;
  legalDisclaimerBn: string;
  legalDisclaimerEn: string;
  privacyPolicyVersion: string;
  leadRetentionDays: number;
  stagingNoticeBn: string;
}

interface AdminSettingsFormProps {
  initialValues: SiteSettingsFormValues;
  dbConfigured: boolean;
}

export function AdminSettingsForm({
  initialValues,
  dbConfigured,
}: AdminSettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettingsFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leadRetentionDays: Number(form.leadRetentionDays),
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !json?.success) {
        setFeedback({
          type: "err",
          text: json?.error || "সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।",
        });
      } else {
        setFeedback({
          type: "ok",
          text: "সাইট সেটিংস সফলভাবে আপডেট করা হয়েছে।",
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof SiteSettingsFormValues>(
    key: K,
    value: SiteSettingsFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          role={feedback.type === "err" ? "alert" : "status"}
          className={`p-3.5 rounded-[12px] border text-sm flex items-center gap-2.5 ${
            feedback.type === "ok"
              ? "bg-emerald-950/60 border-emerald-400/50 text-emerald-100"
              : "bg-rose-950/70 border-rose-400/50 text-rose-100"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15 space-y-4">
        <h2 className="text-lg font-semibold text-ps-white">
          ব্র্যান্ড পরিচিতি (White-Label Identity)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Brand Name (EN)
            </label>
            <input
              type="text"
              required
              value={form.brandName}
              onChange={(e) => updateField("brandName", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={form.brandDisplayName}
              onChange={(e) => updateField("brandDisplayName", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              বাংলা ব্র্যান্ড নাম
            </label>
            <input
              type="text"
              required
              value={form.brandNameBn}
              onChange={(e) => updateField("brandNameBn", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-ps-ivory cursor-pointer">
          <input
            type="checkbox"
            checked={form.isIdentityProvisional}
            onChange={(e) => updateField("isIdentityProvisional", e.target.checked)}
            className="w-4 h-4 accent-ps-gold"
          />
          <span>প্রস্তাবিত পরিচয় (Provisional Identity) ব্যাজ প্রদর্শন করুন</span>
        </label>
      </div>

      <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15 space-y-4">
        <h2 className="text-lg font-semibold text-ps-white">
          যাচাইকৃত যোগাযোগ ও অফিস ঠিকানা
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Verified Phone
            </label>
            <input
              type="text"
              value={form.verifiedPhone}
              onChange={(e) => updateField("verifiedPhone", e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Verified WhatsApp
            </label>
            <input
              type="text"
              value={form.verifiedWhatsapp}
              onChange={(e) => updateField("verifiedWhatsapp", e.target.value)}
              placeholder="+8801XXXXXXXXX বা 01XXXXXXXXX"
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
            {form.verifiedWhatsapp.trim() ? (
              normalizeWhatsAppNumber(form.verifiedWhatsapp) ? (
                <p className="mt-1 text-[11px] text-emerald-300 font-en" dir="ltr">
                  wa.me/{normalizeWhatsAppNumber(form.verifiedWhatsapp)}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-rose-300">
                  সঠিক বাংলাদেশি বা আন্তর্জাতিক WhatsApp নম্বর দিন
                </p>
              )
            ) : (
              <p className="mt-1 text-[11px] text-ps-ivory/60">
                খালি থাকলে এনভায়রনমেন্ট ভেরিয়েবল (VERIFIED_WHATSAPP_NUMBER) অথবা ডিফল্ট অফিশিয়াল নম্বর (+880 1521-537864) ব্যবহৃত হবে।
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Verified Email
            </label>
            <input
              type="email"
              value={form.verifiedEmail}
              onChange={(e) => updateField("verifiedEmail", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              অফিস ঠিকানা (বাংলা)
            </label>
            <input
              type="text"
              value={form.verifiedAddressBn}
              onChange={(e) => updateField("verifiedAddressBn", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Office Address (EN)
            </label>
            <input
              type="text"
              value={form.verifiedAddressEn}
              onChange={(e) => updateField("verifiedAddressEn", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15 space-y-4">
        <h2 className="text-lg font-semibold text-ps-white">
          আইনি ডিসক্লেইমার ও তথ্য সংরক্ষণ নীতি
        </h2>
        <div>
          <label className="block text-xs text-ps-ivory/85 mb-1.5">
            আইনি ডিসক্লেইমার (বাংলা)
          </label>
          <textarea
            rows={3}
            required
            value={form.legalDisclaimerBn}
            onChange={(e) => updateField("legalDisclaimerBn", e.target.value)}
            className="w-full px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Privacy Policy Version
            </label>
            <input
              type="text"
              required
              value={form.privacyPolicyVersion}
              onChange={(e) => updateField("privacyPolicyVersion", e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              Lead Retention Days (30 - 3650)
            </label>
            <input
              type="number"
              min={30}
              max={3650}
              required
              value={form.leadRetentionDays}
              onChange={(e) =>
                updateField("leadRetentionDays", Number(e.target.value) || 365)
              }
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !dbConfigured}
        className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2.5 rounded-[12px] bg-ps-gold text-ps-midnight font-semibold text-sm hover:bg-ps-gold/90 disabled:opacity-50 cursor-pointer"
      >
        <Save className="w-4 h-4" aria-hidden="true" />
        <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}</span>
      </button>
    </form>
  );
}
