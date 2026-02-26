"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BillHeader({
  title = "บิล",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20">
      <div className="bg-[#fff7ea]/90 backdrop-blur supports-[backdrop-filter]:bg-[#fff7ea]/75">
        <div className="mx-auto w-full max-w-md px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/70 ring-1 ring-black/10 shadow-sm hover:bg-black/[0.03] active:scale-95 transition"
              aria-label="ย้อนกลับ"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="text-[18px] font-semibold text-black/90 leading-tight">
                {title}
              </p>
              {subtitle ? (
                <p className="text-[13px] text-black/45 truncate">{subtitle}</p>
              ) : null}
            </div>

            <div className="ml-auto" />
          </div>
        </div>
      </div>
    </header>
  );
}
