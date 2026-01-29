"use client";

import { formatDateRange, serviceLabel, statusLabel, statusTone } from "@/lib/booking/booking.logic";
import { Booking } from "@/lib/booking/booking.types";
import React from "react";

function Chip({ text, tone }: { text: string; tone: "neutral" | "warning" | "info" | "success" | "danger" }) {
  const cls =
    tone === "danger"
      ? "bg-red-50 text-red-700 ring-red-100"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : tone === "warning"
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : tone === "info"
            ? "bg-sky-50 text-sky-700 ring-sky-100"
            : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ${cls}`}>
      {text}
    </span>
  );
}

export default function BillSummaryCard({ b }: { b: Booking }) {
  return (
    <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[20px] font-semibold text-black/90">รายละเอียดบิล</p>
          <p className="mt-1 text-[13px] text-black/45">รหัส {b.id}</p>
        </div>
        <Chip text={statusLabel(b.status)} tone={statusTone(b.status)} />
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-black/5 ring-1 ring-black/5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.petImage || "/images/facedog.png"} alt={b.petName} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-semibold text-black/90 truncate">{b.petName}</p>
          <p className="mt-1 text-[14px] text-black/55">
            {serviceLabel(b.serviceType)} · {formatDateRange(b)}
          </p>

          <div className="mt-4 flex items-end justify-between">
            <p className="text-[14px] text-black/55">ราคารวม</p>
            <p className="text-[22px] font-semibold text-black/90">{b.price.toLocaleString()} บาท</p>
          </div>
        </div>
      </div>

      {b.status === "cancelled" && b.cancelledReason ? (
        <div className="mt-4 rounded-2xl bg-red-50 ring-1 ring-red-100 px-3 py-2">
          <p className="text-[12px] text-red-800">
            <span className="font-semibold">เหตุผลที่ยกเลิก:</span> {b.cancelledReason}
          </p>
        </div>
      ) : null}
    </div>
  );
}
