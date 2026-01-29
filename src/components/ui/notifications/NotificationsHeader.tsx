"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function NotificationsHeader({
  title = "แจ้งเตือน",
  subtitle = "อัปเดตล่าสุดเกี่ยวกับบริการของคุณ",
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="h-[env(safe-area-inset-top)] bg-white" />
      <div className="border-b border-black/10">
        <div className="mx-auto flex h-14 max-w-[720px] items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 hover:bg-black/[0.03] active:scale-[0.98] transition"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-black">{title}</p>
            <p className="truncate text-[12px] text-black/60">{subtitle}</p>
          </div>

          <div className="ml-auto" />
        </div>
      </div>
    </header>
  );
}
