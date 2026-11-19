import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  labelBn: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  dark?: boolean;
}

export function Breadcrumbs({ items, dark = false }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.labelBn}-${idx}`} className="inline-flex items-center gap-1.5">
              {idx > 0 ? (
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${dark ? "text-ps-gold/80" : "text-ps-muted"}`}
                  aria-hidden="true"
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`hover:underline underline-offset-4 ${
                    dark ? "text-white/80 hover:text-ps-white" : "text-ps-muted hover:text-ps-navy"
                  }`}
                >
                  {item.labelBn}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={`font-medium ${dark ? "text-ps-white" : "text-ps-navy"}`}
                >
                  {item.labelBn}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
