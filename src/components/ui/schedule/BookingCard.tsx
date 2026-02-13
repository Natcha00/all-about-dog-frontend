import type { Booking } from "@/lib/booking/booking.types";
import Link from "next/link";

/* =======================
   helpers
======================= */

function statusLabel(s: Booking["status"]) {
  switch (s) {
    case "pending":
      return "รออนุมัติ";
    case "WaitingSlip":
      return "รอชำระเงิน";
    case "slip_uploaded":
      return "รอตรวจสลิป";
    case "slip_verified":
      return "ชำระเงินแล้ว";
    case "check-in":
      return "กำลังใช้บริการ";
    case "finished":
      return "เสร็จสิ้น";
    case "cancelled":
      return "ยกเลิก";
    case "rejected":
      return "ปฏิเสธ";
    default:
      return s;
  }
}

function serviceLabel(t: Booking["serviceType"]) {
  return t === "boarding" ? "ฝากเลี้ยง" : "ว่ายน้ำ";
}

function statusTone(s: Booking["status"]) {
  if (s === "slip_verified" || s === "finished") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "cancelled" || s === "rejected") return "bg-red-50 text-red-700 ring-red-200";
  if (s === "check-in") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-black/[0.04] text-black/70 ring-black/10";
}

/* =======================
   component
======================= */

export default function BookingCard({ booking }: { booking: Booking }) {
  const isBoarding = booking.serviceType === "boarding" && !!booking.endAt;

  return (
    <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-4 py-3 border-b border-black/5 bg-white/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-black/45">รายการจอง</p>
            <p className="text-sm font-extrabold text-black/90 truncate">{booking.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={[
                "shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1",
                statusTone(booking.status),
              ].join(" ")}
            >
              {statusLabel(booking.status)}
            </span>

            <Link
              href={`/service/booking/${booking.id}`}
              className="shrink-0 rounded-full bg-white ring-1 ring-black/10 px-3 py-1 text-xs font-bold text-black/70 active:scale-[0.99] transition"
            >
              ดูรายละเอียด
            </Link>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="p-4 space-y-3 text-sm">
        {/* service */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-black/55">ประเภทบริการ</p>
          <p className="font-extrabold text-black/85">{serviceLabel(booking.serviceType)}</p>
        </div>

        {/* date */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-black/55">วันที่จองใช้บริการ</p>
          <div className="text-right font-extrabold text-black/85">
            {isBoarding ? (
              <>
                <div>{booking.startAt}</div>
                <div className="text-xs font-semibold text-black/50">ถึง {booking.endAt}</div>
              </>
            ) : (
              <>
                <div>{booking.startAt}</div>
                {booking.slotLabel ? (
                  <div className="text-xs font-semibold text-black/50">{booking.slotLabel}</div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* pet */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-black/55">สัตว์เลี้ยงที่ใช้บริการ</p>
          <p className="font-extrabold text-black/85 text-right">{booking.petName}</p>
        </div>

        {/* price */}
        <div className="pt-3 border-t border-black/5 flex items-center justify-between">
          <p className="text-black/55">ราคา</p>
          <p className="text-base font-extrabold text-black/90">
            {booking.price.toLocaleString()} บาท
          </p>
        </div>
      </div>
    </div>
  );
}
