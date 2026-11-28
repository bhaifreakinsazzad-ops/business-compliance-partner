import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { PublicBookPreview } from "@/types/domain";
import { BOOK_AVAILABILITY_BADGE_BN } from "@/lib/books/catalog";
import { formatBdtFromPaisa } from "@/lib/commerce/payments";
import { buildWhatsAppBookMessage } from "@/lib/contact/whatsapp";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface BookCardProps {
  book: PublicBookPreview;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
}

function formatVerifiedPriceBdt(pricePaisa: number): string {
  return formatBdtFromPaisa(pricePaisa, "en-US");
}

export function BookCard({
  book,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
}: BookCardProps) {
  const bookPath = `/books/${book.slug}`;
  const isPricedPublished =
    book.availabilityState === "PUBLISHED_PRICED" &&
    typeof book.pricePaisa === "number" &&
    book.pricePaisa > 0;

  const enquiryHref = `/consultancy?pillar=CONSULTANCY&slug=${encodeURIComponent(
    book.slug,
  )}&topic=${encodeURIComponent(`প্রস্তাবিত বই: ${book.titleBn}`)}`;
  const bookWhatsAppMessage = buildWhatsAppBookMessage({
    bookTitle: book.titleBn,
    bookPath,
    canonicalBaseUrl,
  });

  return (
    <article className="bcp-surface-card group p-5 sm:p-6 flex flex-col justify-between gap-5 transition-colors">
      <div className="space-y-4">
        {/* E-Commerce Hardcover Product Preview */}
        <Link
          href={bookPath}
          className="rounded-[14px] bg-[#FBFAFF] border border-[#E1E4F2] p-4 flex items-center gap-4 group-hover:bg-[#E2E3FF]/35 group-hover:border-[#B8BBFF] transition-colors"
        >
          <div
            className="relative w-20 h-28 rounded-e-[8px] rounded-s-[3px] shrink-0 p-2.5 flex flex-col justify-between shadow-md overflow-hidden border border-black/10"
            style={{
              backgroundColor: book.coverPalette.coverHex,
              color: book.coverPalette.textHex,
            }}
          >
            {/* Book spine shading */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 start-0 w-2"
              style={{ backgroundColor: book.coverPalette.spineHex }}
            />
            <span
              className="ps-1.5 text-[9px] font-en font-bold uppercase tracking-wider line-clamp-1 opacity-95"
              style={{ color: book.coverPalette.textHex }}
              lang="en"
            >
              {book.categoryNameEn}
            </span>
            <span className="ps-1.5 text-[10px] font-bold leading-tight line-clamp-3">
              {book.titleBn}
            </span>
            <div className="ps-1.5 flex items-center justify-between">
              <Image
                src="/brand/bcp-master-logo.png"
                alt="BCP"
                width={18}
                height={18}
                referrerPolicy="no-referrer"
                className="rounded-full bg-white object-contain"
              />
              <BookOpen className="w-3 h-3 opacity-80" aria-hidden="true" />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold">
              <span
                className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#243FBA]"
                lang="en"
              >
                {book.categoryNameEn}
              </span>
              <span aria-hidden="true" className="text-[#243FBA]/40">
                ·
              </span>
              {isPricedPublished && book.pricePaisa ? (
                <span className="text-action-whatsapp font-bold tabular-nums">
                  {formatVerifiedPriceBdt(book.pricePaisa)}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-[#E2E3FF] text-[#202D72] border border-[#B8BBFF]">
                  {BOOK_AVAILABILITY_BADGE_BN}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#081838] line-clamp-1">
              {book.categoryNameBn}
            </p>
            <p
              className="text-xs font-en font-medium text-[#596775] line-clamp-2"
              lang="en"
            >
              {book.titleEn}
            </p>
            {isPricedPublished && typeof book.stockQuantity === "number" ? (
              <p className="text-[11px] font-semibold text-[#243FBA]">
                {book.stockQuantity > 0
                  ? `স্টক উপলব্ধ (${book.stockQuantity} কপি)`
                  : "বর্তমানে স্টক শেষ"}
              </p>
            ) : null}
          </div>
        </Link>

        <div className="space-y-2">
          <p
            className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#243FBA]"
            lang="en"
          >
            03 · Books · {book.categoryNameEn}
          </p>

          <h3 className="text-lg sm:text-xl font-extrabold leading-snug text-[#081838] tracking-tight group-hover:text-[#243FBA] transition-colors">
            <Link href={bookPath} className="hover:underline underline-offset-4">
              {book.titleBn}
            </Link>
          </h3>

          <p className="text-xs sm:text-[13px] font-medium text-[#596775] leading-relaxed line-clamp-2">
            {book.subtitleBn}
          </p>

          <ul className="space-y-1 pt-1 text-xs font-medium text-[#181D26]/90">
            {book.topicsBn.slice(0, 2).map((topic, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#243FBA] font-bold" aria-hidden="true">
                  ·
                </span>
                <span className="line-clamp-1">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-3.5 border-t border-[#E1E4F2] flex flex-wrap items-center justify-between gap-2.5">
        <WhatsAppEnquiryButton
          verifiedWhatsapp={verifiedWhatsapp}
          serviceName={book.titleBn}
          servicePath={bookPath}
          canonicalBaseUrl={canonicalBaseUrl}
          customMessage={bookWhatsAppMessage}
          fallbackHref={enquiryHref}
          labelBn={isPricedPublished ? "বই অর্ডার সহায়তা" : "প্রকাশনা আগ্রহ জানান"}
          fallbackLabelBn="আগ্রহ নিবন্ধন"
          size="sm"
          variant="emerald"
        />

        <Link
          href={bookPath}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline underline-offset-4 whitespace-nowrap shrink-0 ms-auto"
        >
          <span className="font-en" lang="en">
            {isPricedPublished ? "Order Book" : "Explore Book"}
          </span>
          <span className="hidden sm:inline">
            {" "}
            · {isPricedPublished ? "অর্ডার" : "প্রিভিউ"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
