import Link from "next/link";
import { BookOpen, BriefcaseBusiness, Home, MessageSquareText } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-ps-ivory px-4 py-16"
    >
      <div className="max-w-xl w-full rounded-[16px] bg-ps-white border border-ps-border p-8 text-center space-y-5 shadow-sm">
        <p className="font-editorial text-sm uppercase tracking-widest text-ps-navy" lang="en">
          404 • Page Not Found
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-ps-navy">
          কাঙ্ক্ষিত পাতাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-sm md:text-base text-ps-ink/85">
          আপনি যে ঠিকানায় যেতে চাইছেন সেটি পরিবর্তিত হয়ে থাকতে পারে অথবা এখনো প্রকাশিত হয়নি।
          নিচের যেকোনো বিভাগ থেকে সহজেই শুরু করতে পারেন:
        </p>
        <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
          <Link href="/" className="ps-primary-button">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>
          <Link href="/courses" className="ps-secondary-button">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>সকল কোর্স</span>
          </Link>
          <Link href="/services" className="ps-secondary-button">
            <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />
            <span>সকল সেবা</span>
          </Link>
          <Link href="/consultancy" className="ps-secondary-button">
            <MessageSquareText className="w-4 h-4" aria-hidden="true" />
            <span>পরামর্শ চান</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
