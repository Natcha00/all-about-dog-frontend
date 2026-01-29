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

/* =======================
   component
======================= */

export default function BookingCard({ booking }: { booking: Booking }) {
  const isBoarding = booking.serviceType === "boarding" && !!booking.endAt;

  return (
    <div className="rounded-2xl border border-[#3AA6A6] bg-[#FFFDF8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-extrabold">
          สถานะ: {statusLabel(booking.status)}
        </div>

        <Link
          href={`/service/booking/${booking.id}`}
          className="text-sm font-semibold text-black/60 underline underline-offset-4"
        >
          ดูรายละเอียด
        </Link>
      </div>

      <div className="mt-3 space-y-2 text-[18px] leading-relaxed">
        <div>
          <span className="font-extrabold">รายการจอง:</span>{" "}
          <span className="tracking-wide">{booking.id}</span>
        </div>

        <div>
          <span className="font-extrabold">ประเภทบริการ:</span>{" "}
          {serviceLabel(booking.serviceType)}
        </div>

        <div>
          <span className="font-extrabold">วันที่จองใช้บริการ:</span>
          {isBoarding ? (
            <div className="mt-1">
              <div>{booking.startAt}</div>
              <div>ถึง {booking.endAt}</div>
            </div>
          ) : (
            <div className="mt-1">
              <div>{booking.startAt}</div>
              {booking.slotLabel ? (
                <div className="text-center font-medium">
                  {booking.slotLabel}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <div className="font-extrabold">สัตว์เลี้ยงที่ใช้บริการ:</div>
          <div className="mt-1 pl-2">
            • {booking.petName}
          </div>
        </div>

        <div>
          <span className="font-extrabold">ราคา:</span>{" "}
          {booking.price.toLocaleString()} บาท
        </div>
      </div>
    </div>
  );
}
