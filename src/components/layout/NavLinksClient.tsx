"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/layout/MobileNavigation";

interface NavLinksClientProps {
  links: NavLinkItem[];
}

export function NavLinksClient({ links }: NavLinksClientProps) {
  const pathname = usePathname() || "/";

  return (
    <>
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "py-2 transition-colors whitespace-nowrap underline-offset-4 decoration-ps-gold decoration-2",
              isActive
                ? "text-ps-midnight font-bold underline"
                : "text-ps-navy hover:text-ps-midnight hover:underline",
            )}
          >
            {link.labelBn}
          </Link>
        );
      })}
    </>
  );
}
