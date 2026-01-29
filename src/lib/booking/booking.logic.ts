import type { Booking, BookingStatus, TabKey, BillStatusEvent } from "./booking.types";

export function statusToTab(status: BookingStatus): TabKey {
  if (status === "pending") return "pending";
  if (status === "WaitingSlip" || status === "slip_uploaded") return "payment";
  if (status === "slip_verified" || status === "check-in") return "active";
  if (status === "finished") return "finished";
  if (status === "cancelled") return "cancelled";
  return "other";
}

export function tabMeta(tab: TabKey) {
  switch (tab) {
    case "pending":
      return { label: "รอดำเนินการ", hint: "รอร้านอนุมัติ", tone: "neutral" as const };
    case "payment":
      return { label: "รอชำระเงิน", hint: "แนบสลิป/รอตรวจ", tone: "warning" as const };
    case "active":
      return { label: "กำลังให้บริการ", hint: "ชำระแล้ว/เช็คอิน", tone: "info" as const };
    case "finished":
      return { label: "เสร็จสิ้น", hint: "จบงานแล้ว", tone: "success" as const };
    case "cancelled":
      return { label: "ยกเลิก", hint: "ถูกยกเลิก", tone: "danger" as const };
    default:
      return { label: "อื่น ๆ", hint: "สถานะอื่น", tone: "neutral" as const };
  }
}

export function statusLabel(status: BookingStatus) {
  switch (status) {
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
      return status;
  }
}

export function serviceLabel(serviceType: Booking["serviceType"]) {
  return serviceType === "boarding" ? "ฝากเลี้ยง" : "ว่ายน้ำ";
}

export function formatDateRange(b: Booking) {
  // คุณจะเปลี่ยนเป็น date-fns ได้ภายหลัง
  if (b.serviceType === "boarding") {
    return b.endAt ? `${b.startAt} – ${b.endAt}` : b.startAt;
  }
  return b.slotLabel ? `${b.startAt} • ${b.slotLabel}` : b.startAt;
}


export function statusTone(status: BookingStatus) {
    if (status === "cancelled" || status === "rejected") return "danger" as const;
    if (status === "finished") return "success" as const;
    if (status === "WaitingSlip" || status === "slip_uploaded") return "warning" as const;
    if (status === "slip_verified" || status === "check-in") return "info" as const;
    return "neutral" as const;
  }
  
  export function buildBillTimeline(b: Booking): BillStatusEvent[] {
    const base: BillStatusEvent[] = [
      { key: "pending", label: "สร้างบิล", tone: "neutral" },
      { key: "waiting_payment", label: "รอชำระเงิน", tone: "warning" },
      { key: "slip_uploaded", label: "อัปโหลดสลิปแล้ว", tone: "info" },
  
      // จุดที่คุณต้องการ: ใครเป็นคนตรวจ/เวลา
      {
        key: "slip_verified",
        label: "ยืนยันการชำระเงินโดยพนักงาน",
        tone: "success",
        at: b.verifiedAt,
        by: b.verifiedBy,
      },
  
      { key: "checked_in", label: "Check-in", tone: "info", at: b.checkInAt },
      { key: "finished", label: "จบการใช้บริการ", tone: "success", at: b.checkOutAt },
    ];
  
    // กรณีถูกยกเลิก/ปฏิเสธ ให้ timeline จบที่เหตุผล
    if (b.status === "cancelled") {
      return [
        ...base.slice(0, 4),
        { key: "cancelled", label: "ถูกยกเลิก", tone: "danger", note: b.cancelledReason || "—" },
      ];
    }
  
    if (b.status === "rejected") {
      return [
        ...base.slice(0, 4),
        { key: "rejected", label: "ปฏิเสธบิล", tone: "danger", note: b.cancelledReason || "—" },
      ];
    }
  
    return base;
  }
  