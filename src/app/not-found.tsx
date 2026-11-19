import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-ps-ivory px-4 py-16"
    >
      <div className="max-w-lg w-full rounded-[16px] bg-ps-white border border-ps-border p-8 text-center space-y-5 shadow-sm">
        <p className="font-editorial text-sm uppercase tracking-widest text-ps-navy" lang="en">
          404 • Page Not Found
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-ps-navy">
          কাঙ্ক্ষিত পাতাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-sm md:text-base text-ps-ink/85">
          আপনি যে ঠিকানায় যেতে চাইছেন সেটি পরিবর্তিত হয়ে থাকতে পারে অথবা এখনো প্রকাশিত হয়নি।
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="ps-primary-button">
            মূল পাতায় ফিরে যান
          </Link>
        </div>
      </div>
    </main>
  );
}
