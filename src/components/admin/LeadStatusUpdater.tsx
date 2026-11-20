"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageSquareText } from "lucide-react";
import type { LeadStatusValue } from "@/types/domain";

interface LeadStatusUpdaterProps {
  leadId: string;
  publicReference: string;
  currentStatus: LeadStatusValue;
  currentNotes?: string | null;
}

const LEAD_STATUS_OPTIONS: Array<{ value: LeadStatusValue; label: string }> = [
  { value: "NEW", label: "নতুন আবেদন (NEW)" },
  { value: "REVIEWED", label: "পর্যালোচিত (REVIEWED)" },
  { value: "CONTACTED", label: "যোগাযোগকৃত (CONTACTED)" },
  { value: "QUALIFIED", label: "যোগ্য (QUALIFIED)" },
  { value: "CONVERTED", label: "সফল (CONVERTED)" },
  { value: "CLOSED", label: "সমাপ্ত (CLOSED)" },
  { value: "SPAM", label: "স্প্যাম (SPAM)" },
];

export function LeadStatusUpdater({
  leadId,
  publicReference,
  currentStatus,
  currentNotes,
}: LeadStatusUpdaterProps) {
  const router = useRouter();
  const initialNotes = currentNotes ?? "";

  const [status, setStatus] = useState<LeadStatusValue>(currentStatus);
  const [notes, setNotes] = useState<string>(initialNotes);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const hasChanges = status !== currentStatus || notes !== initialNotes;

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotes: notes.trim() ? notes.trim() : null,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !data?.success) {
        setFeedback({
          type: "error",
          message:
            data?.error || "স্ট্যাটাস আপডেট করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        });
        setIsSaving(false);
        return;
      }

      setFeedback({
        type: "success",
        message: "আপডেট সংরক্ষিত হয়েছে",
      });
      setIsSaving(false);
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 min-w-[210px]">
      <div className="flex items-center gap-1.5">
        <select
          aria-label={`স্ট্যাটাস পরিবর্তন (${publicReference})`}
          value={status}
          disabled={isSaving}
          onChange={(e) => {
            setStatus(e.target.value as LeadStatusValue);
            setFeedback(null);
          }}
          className="min-h-[40px] flex-1 px-2.5 py-1.5 rounded-[10px] bg-ps-midnight border border-ps-gold/40 text-ps-ivory text-xs focus:border-ps-gold"
        >
          {LEAD_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowNotes((prev) => !prev)}
          aria-expanded={showNotes}
          aria-label={`নোট যুক্ত করুন (${publicReference})`}
          title="ইন্টারনাল নোট"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-[10px] bg-ps-midnight border border-ps-white/20 text-ps-ivory/85 hover:text-ps-gold hover:border-ps-gold/50 transition-colors cursor-pointer"
        >
          <MessageSquareText className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          aria-label={`সংরক্ষণ করুন (${publicReference})`}
          className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold text-xs inline-flex items-center gap-1 transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>সেভ</span>
        </button>
      </div>

      {showNotes && (
        <div>
          <label className="visually-hidden" htmlFor={`notes-${leadId}`}>
            ইন্টারনাল নোট ({publicReference})
          </label>
          <textarea
            id={`notes-${leadId}`}
            rows={2}
            maxLength={4000}
            value={notes}
            disabled={isSaving}
            onChange={(e) => {
              setNotes(e.target.value);
              setFeedback(null);
            }}
            placeholder="ইন্টারনাল নোট লিখুন (ঐচ্ছিক)..."
            className="w-full px-2.5 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white placeholder:text-ps-ivory/60 text-xs focus:border-ps-gold"
          />
        </div>
      )}

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={
            feedback.type === "error"
              ? "text-[11px] text-rose-200 bg-rose-950/80 border border-rose-400/40 rounded-lg px-2 py-1"
              : "text-[11px] text-emerald-200 bg-emerald-950/80 border border-emerald-400/40 rounded-lg px-2 py-1"
          }
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
