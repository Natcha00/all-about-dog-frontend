"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function Navbar({
  title = "All About Dog",
  subtitle = "บริการดูแลสุนัขครบวงจร",
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ใช้สีพื้นหลังเดียวกับหน้า */}
      <div className="bg-[#F7EEDB]">
        <div className="h-[env(safe-area-inset-top)]" />

        <div className="border-b border-black/10">
          <div className="mx-auto flex h-14 max-w-[420px] items-center gap-3 px-4">
            {/* Back แบบนุ่ม ๆ */}
            <button
              type="button"
              onClick={() => router.back()}
              className="
                inline-flex h-10 w-10 items-center justify-center
                rounded-full
                bg-white/70
                ring-1 ring-black/10
                hover:bg-white/90
                active:scale-[0.98]
                transition
              "
              aria-label="ย้อนกลับ"
            >
              <ChevronLeft className="h-5 w-5 text-black" />
            </button>

            {/* Title block */}
            <div className="min-w-0 flex-1">
              <button 
               type="button"
               onClick={() => router.push("/")}
               className="truncate text-[16px] font-semibold text-black">
                {title}
              </button>
              <p
                className="truncate text-[12px] text-black/60">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/account")}
              className="
                relative h-10 w-10 overflow-hidden rounded-full
                ring-1 ring-black/10
                hover:scale-[1.03]
                active:scale-[0.97]
                transition
              "
              aria-label="โปรไฟล์"
            >
              <Image
                src="/images/user.png"   // เปลี่ยนเป็น path รูปของคุณ
                alt="Profile"
                fill
                className="object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
