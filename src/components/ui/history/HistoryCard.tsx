import React from "react";
import { useRouter } from "next/navigation";
import type { ServiceHistoryItem } from "./types";
import { formatDateThai } from "@/lib/date/date.utils";

export default function HistoryCard({ item }: { item: ServiceHistoryItem }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/service/booking/${item.id}`)}
      className="w-full text-left rounded-3xl bg-white ring-1 ring-[#f0a23a]/60 shadow-sm px-4 py-4 hover:bg-[#fff7ea] transition cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold text-gray-900">
            ประเภทบริการ: <span className="font-semibold">{item.kindLabel}</span>
          </div>

          <div className="mt-2 space-y-1 text-[15px] leading-relaxed">
            {/* 🐶 ฝากเลี้ยง */}
            {item.type === "BOARDING" && (
              <>
                <div className="flex gap-1">
                  <span className="font-extrabold">ใช้บริการ:</span>
                  <span>{formatDateThai(item.startAt)}</span>
                </div>

                <div className="flex gap-1">
                  <span className="font-extrabold">ออกบริการ:</span>
                  <span>{formatDateThai(item.endAt)}</span>
                </div>
              </>
            )}

            {/* 🏊 ว่ายน้ำ */}
            {item.type === "SWIMMING" && (
              <>
                <div className="flex gap-2">
                  <span className="font-extrabold">วันที่:</span>
                  <span>{formatDateThai(item.date)}</span>
                </div>

                <div className="flex gap-2">
                  <span className="font-extrabold">รอบ:</span>
                  <span>{item.slotLabel}</span>
                </div>
              </>
            )}

            <div className="pt-1 text-[15px]">
              (อ้างอิงรายการจอง : <span className="font-semibold">{item.id}</span>)
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}