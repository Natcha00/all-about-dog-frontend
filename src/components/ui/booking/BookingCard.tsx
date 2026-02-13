"use client";

import React from "react";
import { Booking } from "@/lib/booking/booking.types";
import { formatDateRange, serviceLabel, statusLabel } from "@/lib/booking/booking.logic";

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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {text}
    </span>
  );
}

function statusTone(status: Booking["status"]) {
  if (status === "cancelled" || status === "rejected") return "danger";
  if (status === "finished") return "success";
  if (status === "WaitingSlip" || status === "slip_uploaded") return "warning";
  if (status === "slip_verified" || status === "check-in") return "info";
  return "neutral";
}

export default function BookingCard({
  b,
  onUploadSlip,
  onViewDetail,
  onViewHistory,
}: {
  b: Booking;
  onUploadSlip?: (bookingId: string) => void;
  onViewDetail?: (bookingId: string) => void;
  onViewHistory?: (bookingId: string) => void;
}) {
  const statusText = statusLabel(b.status);
  const tone = statusTone(b.status);

  // CTA ตามสถานะ (ฝั่งผู้ใช้)
  // const primaryCta =
  //   b.status === "WaitingSlip"
  //     ? { label: "แนบสลิป", onClick: () => onUploadSlip?.(b.id) }
  //     : b.status === "finished"
  //     ? { label: "ดูประวัติบริการ", onClick: () => onViewHistory?.(b.id) }
  //     : undefined;

  const secondaryCta = { label: "ดูรายละเอียด", onClick: () => onViewDetail?.(b.id) };

  return (
    <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-black/5 ring-1 ring-black/5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.petImage || "/images/facedog.png"} alt={b.petName} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-black/90 truncate">{b.petName}</p>
              <p className="text-[12px] text-black/55 mt-0.5">
                {serviceLabel(b.serviceType)}
              </p>
              <p className="text-[12px] text-black/55 mt-0.5">
                {formatDateRange(b)}
              </p>
            </div>
            <Chip text={statusText} tone={tone} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[13px] text-black/70">
              ราคา <span className="font-semibold text-black/90">{b.price.toLocaleString()}</span> บาท
            </p>
            <p className="text-[12px] text-black/45">รหัส {b.id}</p>
          </div>

          {/* Reason (ถ้ายกเลิก) */}
          {b.status === "cancelled" && b.cancelledReason ? (
            <div className="mt-3 rounded-2xl bg-red-50 ring-1 ring-red-100 px-3 py-2">
              <p className="text-[12px] text-red-800">
                <span className="font-semibold">เหตุผล:</span> {b.cancelledReason}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={secondaryCta.onClick}
          className="rounded-2xl bg-white/70 ring-1 ring-black/10 px-3 py-2 text-[13px] font-semibold text-black/80 hover:bg-black/[0.03] active:scale-[0.99] transition"
        >
          {secondaryCta.label}
        </button>

        {/* {primaryCta ? (
          <button
            type="button"
            onClick={primaryCta.onClick}
            className="rounded-2xl bg-black text-white px-3 py-2 text-[13px] font-semibold hover:bg-black/90 active:scale-[0.99] transition"
          >
            {primaryCta.label}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-2xl bg-black/10 text-black/30 px-3 py-2 text-[13px] font-semibold"
          >
            ไม่มีการดำเนินการ
          </button>
        )} */}
      </div>
    </div>
  );
}
