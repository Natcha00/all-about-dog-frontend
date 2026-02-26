import React from "react";
import type { ServiceHistoryItem } from "./types";

function formatThaiDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

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
    <div className="rounded-3xl bg-white ring-1 ring-[#f0a23a]/60 shadow-sm px-4 py-4">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#f7efdb] ring-1 ring-[#f0a23a] grid place-items-center overflow-hidden">
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
            {/* 🐶 ฝากเลี้ยง */}
            {item.type === "BOARDING" && (
              <>
                <div className="flex gap-1">
                  <span className="font-extrabold">ใช้บริการ:</span>
                  <span>{formatThaiDateTime(item.startAt)} น.</span>
                </div>

                <div className="flex gap-1">
                  <span className="font-extrabold">ออกบริการ:</span>
                  <span>{formatThaiDateTime(item.endAt)} น.</span>
                </div>
              </>
            )}

            {/* 🏊 ว่ายน้ำ */}
            {item.type === "SWIMMING" && (
              <>
                <div className="flex gap-2">
                  <span className="font-extrabold">วันที่:</span>
                  <span>{formatThaiDate(item.date)}</span>
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
    </div>
  );
}