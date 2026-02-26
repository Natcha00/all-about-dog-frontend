// src/components/ui/staff/BookingCardItem.tsx
"use client";

import React, { useMemo } from "react";
import type { Booking } from "@/lib/booking/booking.types";
import PoikaiCard from "@/components/ui/PoikaiCard";
import { serviceLabel, statusLabel, statusTone, petsList } from "@/lib/booking/booking.logic";

function badgeToneFromTone(tone: ReturnType<typeof statusTone>) {
  switch (tone) {
    case "warning":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "success":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "danger":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "neutral":
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function getUseAtRows(b: Booking) {
  if (b.serviceType === "boarding") {
    return [
      { label: "วันส่ง", value: b.startAt ?? "-" },
      { label: "วันรับกลับ", value: b.endAt ?? "-" },
    ];
  }

  return [
    { label: "วัน", value: b.startAt ?? "-" },
    { label: "รอบ", value: b.slotLabel ?? "-" },
  ];
}

export default function BookingCardItem({
  b,
  onViewDetail,
  onUploadSlip,
  onViewHistory,
}: {
  b: Booking;
  onUploadSlip?: (bookingId: string) => void;
  onViewDetail?: (bookingId: string) => void;
  onViewHistory?: (bookingId: string) => void;
}) {
  const tone = statusTone(b.status);
  const statusText = statusLabel(b.status);

  const petsText = useMemo(() => {
    const names = petsList(b);
    return names.length ? names.join(", ") : "-";
  }, [b]);

  const useAtRows = getUseAtRows(b);

  return (
    <div
      className="cursor-pointer"
      onClick={() => onViewDetail?.(b.id)} // ✅ optional chaining
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onViewDetail?.(b.id);
      }}
    >
      <PoikaiCard
        title={
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold shrink-0">[{b.id}]</span>
            <span className="font-semibold truncate">{serviceLabel(b.serviceType)}</span>
          </div>
        }
        right={
          <span
            className={[
              "rounded-full border px-2 py-1 text-[11px] font-semibold",
              badgeToneFromTone(tone),
            ].join(" ")}
          >
            {statusText}
          </span>
        }
      >
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">สัตว์เลี้ยง</span>
            <span className="font-semibold text-right truncate max-w-[60%]">
              {petsText}
            </span>
          </div>

          {/* ✅ แยก 2 row */}
          {useAtRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-semibold text-right">{r.value}</span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-black/5">
            <span className="font-semibold">ราคารวม</span>
            <span className="font-extrabold">
              {(b.price ?? 0).toLocaleString()} บาท
            </span>
          </div>


          {/* cancelled reason */}
          {b.status === "cancelled" && b.cancelledReason ? (
            <div className="mt-2 rounded-2xl bg-rose-50 ring-1 ring-rose-100 px-3 py-2">
              <p className="text-[12px] text-rose-800 leading-snug">
                <span className="font-semibold">เหตุผล:</span> {b.cancelledReason}
              </p>
            </div>
          ) : null}
        </div>
      </PoikaiCard>
    </div>
  );
}