"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

export interface CatalogueAdminRow {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  summaryBn: string;
  categoryNameBn: string;
  categoryId: string;
  contentStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED";
  availabilityStatus: "ACTIVE" | "UPCOMING" | "INTEREST_ONLY" | "INACTIVE";
  featured: boolean;
  lastVerifiedAt: string | null;
  verifiedBy: string | null;
  warningNote?: string | null;
  publicHref: string;
}

export interface CategoryOption {
  id: string;
  nameBn: string;
  slug: string;
}

interface AdminCatalogueClientProps {
  resource: "courses" | "services" | "licensing";
  titleBn: string;
  items: CatalogueAdminRow[];
  categories: CategoryOption[];
  canWrite: boolean;
  canPublish: boolean;
  dbConfigured: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "bg-emerald-950/80 text-emerald-200 border-emerald-400/50",
  APPROVED: "bg-sky-950/80 text-sky-200 border-sky-400/50",
  PENDING_REVIEW: "bg-amber-950/80 text-amber-200 border-amber-400/50",
  DRAFT: "bg-ps-midnight text-ps-ivory/80 border-ps-white/25",
};

export function AdminCatalogueClient({
  resource,
  titleBn,
  items,
  categories,
  canWrite,
  canPublish,
  dbConfigured,
}: AdminCatalogueClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Minimal quick-create fields (creates DRAFT by default)
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [titleItemBn, setTitleItemBn] = useState("");
  const [summaryBn, setSummaryBn] = useState("");

  const patchItem = async (
    id: string,
    payload: Record<string, unknown>,
    successMsg: string,
  ) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/${resource}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({
          type: "err",
          text: json?.error || "আপডেট করতে ব্যর্থ হয়েছে।",
        });
      } else {
        setFeedback({ type: "ok", text: successMsg });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  const deleteItem = async (id: string, label: string) => {
    if (!window.confirm(`"${label}" মুছে ফেলতে চান?`)) return;
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/${resource}/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({
          type: "err",
          text: json?.error || "মুছে ফেলতে ব্যর্থ হয়েছে।",
        });
      } else {
        setFeedback({ type: "ok", text: "সফলভাবে মুছে ফেলা হয়েছে।" });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("create");
    setFeedback(null);

    const basePayload: Record<string, unknown> = {
      slug: slug.trim(),
      categoryId,
      titleBn: titleItemBn.trim(),
      summaryBn: summaryBn.trim(),
      contentStatus: "DRAFT",
      availabilityStatus: "INTEREST_ONLY",
    };

    if (resource === "courses") {
      basePayload.audienceBn = "উদ্যোক্তা ও সংশ্লিষ্ট পেশাজীবী";
      basePayload.outcomes = ["ব্যবহারিক ধারণা ও প্রাথমিক কমপ্লায়েন্স প্রস্তুতি"];
      basePayload.syllabus = [
        { titleBn: "মডিউল ১: মৌলিক কাঠামো", topicsBn: ["প্রাথমিক পরিচিতি ও নিয়মাবলি"] },
      ];
    } else if (resource === "services") {
      basePayload.whoNeedsItBn = "বাংলাদেশের নিবন্ধিত বা নতুন ব্যবসা প্রতিষ্ঠান";
      basePayload.assistanceScopeBn =
        "প্রাথমিক ডকুমেন্ট প্রস্তুতি ও প্রক্রিয়াগত পরামর্শ সহায়তা।";
      basePayload.limitationsBn =
        "চূড়ান্ত অনুমোদন ও সরকারি ফি সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা সাপেক্ষ।";
      basePayload.documentsSummary = ["জাতীয় পরিচয়পত্র ও প্রাসঙ্গিক ব্যবসায়িক কাগজপত্র"];
      basePayload.processSteps = [
        {
          stepNumber: 1,
          titleBn: "প্রাথমিক যাচাই",
          descriptionBn: "প্রয়োজনীয় নথিপত্র ও প্রযোজ্যতা পর্যালোচনা।",
        },
      ];
    } else {
      basePayload.authorityName = "সংশ্লিষ্ট সরকারি কর্তৃপক্ষ";
      basePayload.authorityType = "Regulatory Authority";
      basePayload.officialSourceLabel = "অফিসিয়াল পোর্টাল";
      basePayload.serviceScopeBn =
        "আবেদন প্রস্তুতি ও প্রয়োজনীয় নথিপত্র যাচাইকরণে সহায়তা।";
      basePayload.limitationsBn =
        "লাইসেন্স প্রদান ও নবায়ন সম্পূর্ণভাবে সংশ্লিষ্ট কর্তৃপক্ষের এখতিয়ারভুক্ত।";
      basePayload.documentsSummary = ["জাতীয় পরিচয়পত্র ও ব্যবসার ঠিকানার প্রমাণপত্র"];
      basePayload.processSummaryBn =
        "প্রয়োজনীয় কাগজপত্র সংগ্রহ করে নির্ধারিত পোর্টাল বা দপ্তরে আবেদন জমা দেওয়া হয়।";
    }

    try {
      const res = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({
          type: "err",
          text: json?.error || "তৈরি করতে ব্যর্থ হয়েছে।",
        });
      } else {
        setFeedback({
          type: "ok",
          text: "নতুন খসড়া (DRAFT) তৈরি হয়েছে।",
        });
        setSlug("");
        setTitleItemBn("");
        setSummaryBn("");
        setShowCreate(false);
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
          <h1 className="text-2xl font-bn font-bold text-ps-white">{titleBn}</h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            মোট আইটেম: <span className="font-en font-bold text-ps-gold">{items.length}</span>
          </p>
        </div>

        {canWrite && dbConfigured && (
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-[12px] bg-ps-gold text-ps-midnight font-semibold text-sm hover:bg-ps-gold/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>নতুন খসড়া যোগ করুন</span>
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
          onSubmit={handleQuickCreate}
          className="p-5 rounded-[16px] bg-ps-navy border border-ps-gold/40 space-y-4"
        >
          <h2 className="text-base font-semibold text-ps-white">
            নতুন খসড়া (DRAFT) তৈরি করুন
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ps-ivory/85 mb-1.5">
                Slug (kebab-case, English)
              </label>
              <input
                type="text"
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="new-catalogue-item"
                className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm font-en"
              />
            </div>
            <div>
              <label className="block text-xs text-ps-ivory/85 mb-1.5">
                ক্যাটাগরি
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              শিরোনাম (বাংলা)
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={titleItemBn}
              onChange={(e) => setTitleItemBn(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ps-ivory/85 mb-1.5">
              সংক্ষিপ্ত বিবরণ (বাংলা, ন্যূনতম ১০ অক্ষর)
            </label>
            <textarea
              required
              minLength={10}
              rows={2}
              value={summaryBn}
              onChange={(e) => setSummaryBn(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] bg-ps-midnight border border-ps-white/25 text-ps-white text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busyId === "create"}
              className="min-h-[44px] px-5 py-2 rounded-[10px] bg-ps-gold text-ps-midnight font-semibold text-sm cursor-pointer disabled:opacity-60"
            >
              {busyId === "create" ? "সংরক্ষণ হচ্ছে..." : "খসড়া সংরক্ষণ করুন"}
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
        {items.map((item) => {
          const isPublished = item.contentStatus === "PUBLISHED";
          const canModifyItem =
            dbConfigured &&
            (isPublished ? canPublish : canWrite);

          return (
            <div
              key={item.id}
              className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-en font-semibold px-2.5 py-0.5 rounded-full border ${
                      STATUS_BADGE[item.contentStatus] ?? STATUS_BADGE.DRAFT
                    }`}
                  >
                    {item.contentStatus}
                  </span>
                  <span className="text-[11px] font-en px-2.5 py-0.5 rounded-full bg-ps-midnight border border-ps-white/20 text-ps-ivory/85">
                    {item.availabilityStatus}
                  </span>
                  <span className="text-xs text-ps-gold">{item.categoryNameBn}</span>
                </div>

                <h2 className="text-base font-semibold text-ps-white">
                  {item.titleBn}
                </h2>
                <p className="text-xs font-en text-ps-ivory/75">
                  /{resource}/{item.slug}
                  {item.verifiedBy ? ` • Verified by ${item.verifiedBy}` : ""}
                </p>

                {item.warningNote && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-amber-200 bg-amber-950/50 border border-amber-400/30 rounded-lg px-2.5 py-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.warningNote}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={item.publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-[10px] border border-ps-white/25 text-xs text-ps-ivory hover:text-ps-white hover:bg-ps-midnight transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>প্রিভিউ</span>
                </a>

                {dbConfigured && canPublish && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() =>
                      patchItem(
                        item.id,
                        {
                          contentStatus: isPublished ? "DRAFT" : "PUBLISHED",
                        },
                        isPublished
                          ? "খসড়া (DRAFT) অবস্থায় ফিরিয়ে নেওয়া হয়েছে।"
                          : "সফলভাবে প্রকাশ (PUBLISHED) করা হয়েছে।",
                      )
                    }
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-[10px] bg-ps-midnight border border-ps-gold/50 text-xs text-ps-gold hover:bg-ps-gold hover:text-ps-midnight transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isPublished ? "Unpublish" : "Publish"}</span>
                  </button>
                )}

                {canModifyItem && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => deleteItem(item.id, item.titleBn)}
                    aria-label={`${item.titleBn} মুছে ফেলুন`}
                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] px-2.5 rounded-[10px] border border-rose-400/40 text-rose-200 hover:bg-rose-950/60 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
