"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

export interface BookAdminRow {
  id: string;
  slug: string;
  sku: string | null;
  titleBn: string;
  titleEn: string;
  categoryNameBn: string;
  categoryId: string;
  contentStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED";
  availabilityStatus: "ACTIVE" | "UPCOMING" | "INTEREST_ONLY" | "INACTIVE";
  pricePaisa: number | null;
  stockQuantity: number;
  featured: boolean;
  publicHref: string;
}

export interface BookCategoryOption {
  id: string;
  nameBn: string;
  slug: string;
}

interface AdminBooksClientProps {
  items: BookAdminRow[];
  categories: BookCategoryOption[];
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

export function AdminBooksClient({
  items,
  categories,
  canWrite,
  canPublish,
  dbConfigured,
}: AdminBooksClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleBn, setSubtitleBn] = useState("");
  const [summaryBn, setSummaryBn] = useState("");
  const [priceBdt, setPriceBdt] = useState("");
  const [stockQty, setStockQty] = useState("0");

  const patchBook = async (
    id: string,
    payload: Record<string, unknown>,
    successMsg: string,
  ) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
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

  const deleteBook = async (id: string, label: string) => {
    if (!window.confirm(`"${label}" মুছে ফেলতে চান?`)) return;
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
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
        setFeedback({ type: "ok", text: `"${label}" মুছে ফেলা হয়েছে।` });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("create");
    setFeedback(null);

    const parsedBdt = Number(priceBdt.trim());
    const pricePaisa =
      priceBdt.trim() !== "" && Number.isFinite(parsedBdt) && parsedBdt >= 0
        ? Math.round(parsedBdt * 100)
        : null;
    const stockQuantity = Math.max(0, Number.parseInt(stockQty, 10) || 0);

    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          sku: sku.trim() || null,
          categoryId,
          titleBn: titleBn.trim(),
          titleEn: titleEn.trim(),
          subtitleBn: subtitleBn.trim() || titleBn.trim(),
          summaryBn: summaryBn.trim(),
          audienceBn: "ব্যবসায়ী, উদ্যোক্তা ও কমপ্লায়েন্স পেশাজীবী।",
          topicsBn: ["ব্যবহারিক নীতিমালা ও প্রাকটিক্যাল চেকলিস্ট"],
          editionNoteBn:
            "প্রস্তাবিত প্রকাশনা প্রিভিউ — মূল্য ও সংস্করণ অনুমোদন সাপেক্ষে প্রকাশিত হবে।",
          pricePaisa,
          stockQuantity,
          contentStatus: "DRAFT",
          availabilityStatus: "UPCOMING",
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.success) {
        setFeedback({
          type: "err",
          text: json?.error || "নতুন বই তৈরি করতে ব্যর্থ হয়েছে।",
        });
      } else {
        setFeedback({
          type: "ok",
          text: "নতুন বইয়ের খসড়া (DRAFT) তৈরি হয়েছে।",
        });
        setSlug("");
        setSku("");
        setTitleBn("");
        setTitleEn("");
        setSubtitleBn("");
        setSummaryBn("");
        setPriceBdt("");
        setStockQty("0");
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ps-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-ps-gold" aria-hidden="true" />
            <span>বই ও প্রকাশনা ব্যবস্থাপনা (Bookstore)</span>
          </h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            মোট {items.length}টি রেকর্ড · মূল্য ও স্টক অনুমোদিত হলে ACTIVE হিসেবে প্রকাশ করুন
          </p>
        </div>

        {canWrite && dbConfigured ? (
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-[12px] bg-ps-gold text-ps-midnight font-bold text-sm hover:bg-[#d5aa44] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>নতুন বইয়ের খসড়া</span>
          </button>
        ) : null}
      </div>

      {!dbConfigured ? (
        <div className="rounded-[14px] border border-amber-400/50 bg-amber-950/40 p-4 text-xs sm:text-sm text-amber-100">
          ডাটাবেজ সংযুক্ত না থাকায় বর্তমানে প্রিভিউ ক্যাটালগ প্রদর্শিত হচ্ছে। মূল্য,
          স্টক ও CRUD সংরক্ষণের জন্য PostgreSQL ও মাইগ্রেশন সক্রিয় করুন।
        </div>
      ) : null}

      {feedback ? (
        <div
          role={feedback.type === "err" ? "alert" : "status"}
          className={`rounded-[12px] border p-3.5 text-sm font-medium ${
            feedback.type === "err"
              ? "border-rose-400/60 bg-rose-950/60 text-rose-100"
              : "border-emerald-400/60 bg-emerald-950/60 text-emerald-100"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {showCreate && dbConfigured ? (
        <form
          onSubmit={handleCreate}
          className="rounded-[16px] border border-ps-white/20 bg-ps-navy p-5 space-y-4"
        >
          <h2 className="text-base font-bold text-ps-white">
            নতুন বইয়ের খসড়া যোগ করুন
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="space-y-1 text-xs">
              <span className="text-ps-ivory/80 font-medium">Slug (kebab-case)</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. corporate-tax-manual-2026"
                className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-ps-ivory/80 font-medium">SKU (ঐচ্ছিক)</span>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="BCP-BK-010"
                className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-ps-ivory/80 font-medium">বিভাগ (Category)</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-ps-ivory/80 font-medium">বাংলা শিরোনাম</span>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-ps-ivory/80 font-medium">English Title</span>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs">
                <span className="text-ps-ivory/80 font-medium">মূল্য (BDT)</span>
                <input
                  type="number"
                  min={0}
                  value={priceBdt}
                  onChange={(e) => setPriceBdt(e.target.value)}
                  placeholder="ঐচ্ছিক"
                  className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-ps-ivory/80 font-medium">প্রাথমিক স্টক</span>
                <input
                  type="number"
                  min={0}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
                />
              </label>
            </div>
          </div>
          <label className="block space-y-1 text-xs">
            <span className="text-ps-ivory/80 font-medium">উপশিরোনাম (Subtitle)</span>
            <input
              type="text"
              value={subtitleBn}
              onChange={(e) => setSubtitleBn(e.target.value)}
              className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
            />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-ps-ivory/80 font-medium">সারসংক্ষেপ (Summary)</span>
            <textarea
              required
              rows={3}
              value={summaryBn}
              onChange={(e) => setSummaryBn(e.target.value)}
              className="w-full rounded-lg bg-ps-midnight border border-ps-white/20 px-3 py-2 text-sm text-ps-white"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busyId === "create"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ps-gold text-ps-midnight font-bold text-sm cursor-pointer disabled:opacity-60"
            >
              {busyId === "create" ? "সংরক্ষণ হচ্ছে..." : "খসড়া সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded-[16px] border border-ps-white/15 bg-ps-navy overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-ps-white/15 text-xs uppercase text-ps-ivory/75">
              <th className="py-3.5 px-4">শিরোনাম ও SKU</th>
              <th className="py-3.5 px-4">বিভাগ</th>
              <th className="py-3.5 px-4">অবস্থা</th>
              <th className="py-3.5 px-4">মূল্য ও স্টক</th>
              <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ps-white/10">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-ps-midnight/40">
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-bold text-ps-white line-clamp-1">
                    {item.titleBn}
                  </p>
                  <p className="text-xs font-en text-ps-ivory/70">
                    /{item.slug} {item.sku ? `· ${item.sku}` : ""}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-xs text-ps-ivory/90">
                  {item.categoryNameBn}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[11px] font-en font-bold px-2 py-0.5 rounded border ${
                        STATUS_BADGE[item.contentStatus] ?? STATUS_BADGE.DRAFT
                      }`}
                    >
                      {item.contentStatus}
                    </span>
                    <span className="text-[11px] font-en text-ps-ivory/70">
                      {item.availabilityStatus}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs tabular-nums">
                  {item.pricePaisa && item.pricePaisa > 0 ? (
                    <span className="font-bold text-ps-gold">
                      ৳{Math.round(item.pricePaisa / 100)}
                    </span>
                  ) : (
                    <span className="text-ps-ivory/65">মূল্য অনির্ধারিত</span>
                  )}
                  <span className="block text-[11px] text-ps-ivory/70">
                    স্টক: {item.stockQuantity} কপি
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <a
                      href={item.publicHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-ps-white/20 text-xs text-ps-ivory hover:text-ps-gold"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>দেখুন</span>
                    </a>
                    {dbConfigured && canWrite ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          patchBook(
                            item.id,
                            { stockQuantity: item.stockQuantity + 10 },
                            `"${item.titleBn}" স্টক +১০ যুক্ত হয়েছে।`,
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-ps-gold/40 text-xs text-ps-gold hover:bg-ps-gold/10 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>+১০ স্টক</span>
                      </button>
                    ) : null}
                    {dbConfigured &&
                    canPublish &&
                    item.contentStatus !== "PUBLISHED" ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          patchBook(
                            item.id,
                            { contentStatus: "PUBLISHED" },
                            `"${item.titleBn}" প্রকাশিত হয়েছে।`,
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>প্রকাশ</span>
                      </button>
                    ) : null}
                    {dbConfigured && canPublish ? (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => deleteBook(item.id, item.titleBn)}
                        aria-label="মুছুন"
                        className="inline-flex items-center p-1.5 rounded-lg border border-rose-400/40 text-rose-300 hover:bg-rose-950/60 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
