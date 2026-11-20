"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, RefreshCw, Trash2 } from "lucide-react";

export interface FaqAdminRow {
  id: string;
  questionBn: string;
  answerBn: string;
  pillar: string | null;
  isRegulatory: boolean;
  contentStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED";
  sortOrder: number;
  verifiedBy: string | null;
}

interface AdminFaqClientProps {
  faqs: FaqAdminRow[];
  canPublish: boolean;
  dbConfigured: boolean;
}

export function AdminFaqClient({
  faqs,
  canPublish,
  dbConfigured,
}: AdminFaqClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [questionBn, setQuestionBn] = useState("");
  const [answerBn, setAnswerBn] = useState("");
  const [pillar, setPillar] = useState("");
  const [isRegulatory, setIsRegulatory] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("create");
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionBn: questionBn.trim(),
          answerBn: answerBn.trim(),
          pillar: pillar || null,
          isRegulatory,
          contentStatus: "DRAFT",
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({ type: "err", text: json?.error || "FAQ তৈরি ব্যর্থ হয়েছে।" });
      } else {
        setFeedback({ type: "ok", text: "নতুন FAQ (DRAFT) সংরক্ষণ হয়েছে।" });
        setQuestionBn("");
        setAnswerBn("");
        setShowCreate(false);
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = async (faq: FaqAdminRow) => {
    setBusyId(faq.id);
    setFeedback(null);
    const nextStatus = faq.contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentStatus: nextStatus }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({ type: "err", text: json?.error || "আপডেট ব্যর্থ হয়েছে।" });
      } else {
        setFeedback({
          type: "ok",
          text: nextStatus === "PUBLISHED" ? "FAQ প্রকাশিত হয়েছে।" : "FAQ খসড়ায় নেওয়া হয়েছে।",
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("এই FAQ মুছে ফেলতে চান?")) return;
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({ type: "err", text: json?.error || "মুছে ফেলা ব্যর্থ হয়েছে।" });
      } else {
        setFeedback({ type: "ok", text: "FAQ মুছে ফেলা হয়েছে।" });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bn font-bold text-ps-white">
            সচরাচর জিজ্ঞাসা (FAQ) ও কন্টেন্ট ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            মোট FAQ: <span className="font-en font-bold text-ps-gold">{faqs.length}</span>
          </p>
        </div>

        {dbConfigured && (
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-[12px] bg-ps-gold text-ps-midnight font-semibold text-sm hover:bg-ps-gold/90 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>নতুন FAQ যোগ করুন</span>
          </button>
        )}
      </div>

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

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-[16px] bg-ps-navy border border-ps-gold/40 space-y-4"
        >
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              প্রশ্ন (বাংলা)
            </label>
            <input
              type="text"
              required
              minLength={5}
              value={questionBn}
              onChange={(e) => setQuestionBn(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              উত্তর (বাংলা)
            </label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={answerBn}
              onChange={(e) => setAnswerBn(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            >
              <option value="">সাধারণ (All Pillars)</option>
              <option value="COURSES">COURSES</option>
              <option value="SERVICES">SERVICES</option>
              <option value="LICENSING">LICENSING</option>
              <option value="CONSULTANCY">CONSULTANCY</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-ps-ivory cursor-pointer">
              <input
                type="checkbox"
                checked={isRegulatory}
                onChange={(e) => setIsRegulatory(e.target.checked)}
                className="w-4 h-4 accent-ps-gold"
              />
              <span>রেগুলেটরি / আইনি ডিসক্লেইমার প্রযোজ্য</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busyId === "create"}
              className="min-h-[44px] px-5 py-2 rounded-[10px] bg-ps-gold text-ps-midnight font-semibold text-sm cursor-pointer disabled:opacity-60"
            >
              {busyId === "create" ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="min-h-[44px] px-4 py-2 rounded-[10px] border border-ps-white/25 text-ps-ivory text-sm cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isPublished = faq.contentStatus === "PUBLISHED";
          return (
            <div
              key={faq.id}
              className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-en font-semibold px-2.5 py-0.5 rounded-full border border-ps-white/25 bg-ps-midnight text-ps-ivory">
                    {faq.contentStatus}
                  </span>
                  {faq.pillar && (
                    <span className="text-[11px] font-en px-2 py-0.5 rounded bg-ps-midnight text-ps-gold border border-ps-gold/30">
                      {faq.pillar}
                    </span>
                  )}
                  {faq.isRegulatory && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/70 text-amber-200 border border-amber-400/40">
                      Regulatory
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-ps-white">
                  {faq.questionBn}
                </h2>
                <p className="text-sm text-ps-ivory/80 leading-relaxed">
                  {faq.answerBn}
                </p>
              </div>

              {dbConfigured && (
                <div className="flex items-center gap-2 shrink-0">
                  {canPublish && (
                    <button
                      type="button"
                      disabled={busyId === faq.id}
                      onClick={() => togglePublish(faq)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-[10px] bg-ps-midnight border border-ps-gold/50 text-xs text-ps-gold hover:bg-ps-gold hover:text-ps-midnight transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isPublished ? "Unpublish" : "Publish"}</span>
                    </button>
                  )}
                  {(!isPublished || canPublish) && (
                    <button
                      type="button"
                      disabled={busyId === faq.id}
                      onClick={() => handleDelete(faq.id)}
                      aria-label="FAQ মুছে ফেলুন"
                      className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-[10px] border border-rose-400/40 text-rose-200 hover:bg-rose-950/60 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
