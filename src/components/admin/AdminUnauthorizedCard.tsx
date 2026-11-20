import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { AdminRoleValue } from "@/types/domain";
import { hasPermission } from "@/lib/security/rbac";

interface AdminUnauthorizedCardProps {
  role: AdminRoleValue;
  titleBn?: string;
  messageBn?: string;
}

export function AdminUnauthorizedCard({
  role,
  titleBn = "এই পাতায় প্রবেশের অনুমতি নেই (403 Forbidden)",
  messageBn = "আপনার বর্তমান অ্যাডমিন রোল দিয়ে এই অংশটি দেখার অনুমতি নির্ধারিত নেই। প্রয়োজনে অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।",
}: AdminUnauthorizedCardProps) {
  const canViewDashboard = hasPermission(role, "dashboard:view");

  return (
    <section
      aria-labelledby="admin-forbidden-heading"
      className="max-w-xl mx-auto my-12 p-8 rounded-[16px] bg-ps-navy border border-ps-gold/30 text-ps-ivory shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-[12px] bg-rose-950/70 border border-rose-400/40 text-rose-200 flex-shrink-0">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-en font-semibold uppercase tracking-wider text-ps-gold">
            Access Restricted · Role: {role}
          </p>
          <h1
            id="admin-forbidden-heading"
            className="text-xl font-bn font-bold text-ps-white"
          >
            {titleBn}
          </h1>
          <p className="text-sm text-ps-ivory/85 leading-relaxed">{messageBn}</p>
          <div className="pt-2">
            <Link
              href={canViewDashboard ? "/admin/dashboard" : "/"}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[12px] bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>
                {canViewDashboard ? "ড্যাশবোর্ডে ফিরে যান" : "মূল ওয়েবসাইটে যান"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
