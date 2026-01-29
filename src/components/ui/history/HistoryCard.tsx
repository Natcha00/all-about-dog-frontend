import React from "react";
import type { ServiceHistoryItem } from "./types";

function formatThaiDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryCard({ item }: { item: ServiceHistoryItem }) {
  return (
    <div
      className="
        rounded-3xl bg-white
        ring-1 ring-[#399199]/60
        shadow-sm
        px-4 py-4
      "
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#E8F7F6] ring-1 ring-[#BFE7E9] grid place-items-center overflow-hidden">
          {item.iconSrc ? (
            <img src={item.iconSrc} alt={item.kindLabel} className="w-10 h-10 object-contain" />
          ) : (
            <div className="text-[#399199] font-bold">P</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold text-gray-900">
            ประเภทบริการ: <span className="font-semibold">{item.kindLabel}</span>
          </div>

          <div className="mt-2 space-y-1 text-[15px] leading-relaxed">
            <div className="flex gap-2">
              <span className="font-extrabold text-gray-900">เข้าใช้บริการ:</span>
              <span className="text-gray-900">{formatThaiDateTime(item.startAt)} น.</span>
            </div>

            <div className="flex gap-2">
              <span className="font-extrabold text-gray-900">ออกจากบริการ:</span>
              <span className="text-gray-900">{formatThaiDateTime(item.endAt)} น.</span>
            </div>

            <div className="pt-1 text-[15px] text-gray-900">
              (อ้างอิงรายการจอง : <span className="font-semibold">{item.id}</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
