import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { PublicBookPreview } from "@/types/domain";
import { BOOK_AVAILABILITY_BADGE_BN } from "@/lib/books/catalog";
import { buildWhatsAppBookMessage } from "@/lib/contact/whatsapp";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface BookCardProps {
  book: PublicBookPreview;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
}

export function BookCard({
  book,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
}: BookCardProps) {
  const bookPath = `/books/${book.slug}`;
  const enquiryHref = `/consultancy?pillar=CONSULTANCY&slug=${encodeURIComponent(
    book.slug,
  )}&topic=${encodeURIComponent(`প্রস্তাবিত বই: ${book.titleBn}`)}`;
  const bookWhatsAppMessage = buildWhatsAppBookMessage({
    bookTitle: book.titleBn,
    bookPath,
    canonicalBaseUrl,
  });

  return (
    <article className="group rounded-[16px] border border-[#D4CCE3] bg-white p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(81,64,111,0.04)] hover:border-[#51406F]/50 hover:shadow-[0_10px_24px_rgba(81,64,111,0.1)] transition-[border-color,box-shadow] duration-200">
      <div className="space-y-4">
        {/* Clean Editorial Hardcover Preview Mockup */}
        <Link
          href={bookPath}
          className="block rounded-[12px] bg-[#F2EFF8] border border-[#D4CCE3] p-4 flex items-center gap-4 group-hover:bg-[#ECE7F5] transition-colors"
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
              className="ps-1.5 text-[9px] font-en font-bold uppercase tracking-wider line-clamp-1"
              style={{ color: book.coverPalette.accentHex }}
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
              <span className="text-[#51406F]">{book.categoryNameBn}</span>
              <span aria-hidden="true" className="text-[#D4CCE3]">
                ·
              </span>
              <span className="text-[#9A6300]">{BOOK_AVAILABILITY_BADGE_BN}</span>
            </div>
            <p className="text-xs font-en font-medium text-[#596775] line-clamp-2" lang="en">
              {book.titleEn}
            </p>
          </div>
        </Link>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#081838] leading-snug group-hover:text-[#51406F] transition-colors">
            <Link href={bookPath} className="hover:underline underline-offset-4">
              {book.titleBn}
            </Link>
          </h3>

          <p className="text-sm text-[#181D26]/85 leading-relaxed line-clamp-2">
            {book.subtitleBn}
          </p>

          <ul className="space-y-1 pt-1 text-xs text-[#596775]">
            {book.topicsBn.slice(0, 2).map((topic, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#51406F] font-bold" aria-hidden="true">
                  ·
                </span>
                <span className="line-clamp-1">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-3.5 border-t border-[#D4CCE3]/70 flex flex-wrap items-center justify-between gap-2.5">
        <WhatsAppEnquiryButton
          verifiedWhatsapp={verifiedWhatsapp}
          serviceName={book.titleBn}
          servicePath={bookPath}
          canonicalBaseUrl={canonicalBaseUrl}
          customMessage={bookWhatsAppMessage}
          fallbackHref={enquiryHref}
          labelBn="প্রকাশনা আগ্রহ জানান"
          fallbackLabelBn="আগ্রহ নিবন্ধন"
          size="sm"
          variant="emerald"
        />

        <Link
          href={bookPath}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#51406F] hover:text-[#3F315A] hover:underline underline-offset-4 whitespace-nowrap shrink-0 ms-auto"
        >
          <span>বইটির প্রিভিউ দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
