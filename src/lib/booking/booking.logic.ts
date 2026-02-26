import type { Booking, BookingStatus, TabKey, BillStatusEvent } from "./booking.types";

export function statusToTab(status: BookingStatus): TabKey {
  if (status === "pending") return "pending";
  if (status === "WaitingSlip" || status === "slip_uploaded") return "waitingSlip";
  if (status === "slip_verified") return "slipVerified";
  if (status === "check-in") return "active";
  if (status === "finished") return "finished";
  return "cancelled";
}

export function tabMeta(tab: TabKey) {
  switch (tab) {
    case "pending":
      return { label: "รอดำเนินการ", hint: "รอร้านอนุมัติ", tone: "neutral" as const };
    case "waitingSlip":
      return { label: "รอชำระเงิน", hint: "แนบสลิป/รอตรวจ", tone: "warning" as const };
    case "slipVerified":
      return { label: "ชำระเงินแล้ว", hint: "รอเข้าใช้บริการ", tone: "success" as const };
    case "active":
      return { label: "กำลังใช้บริการ", hint: "ชำระแล้ว/เช็คอิน", tone: "info" as const };
    case "finished":
      return { label: "เสร็จสิ้น", hint: "จบงานแล้ว", tone: "success" as const };
    default:
      return { label: "ยกเลิก", hint: "ถูกยกเลิก", tone: "danger" as const };
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
  // boarding = ช่วงวันเข้า-ออก
  if (b.serviceType === "boarding") {
    return b.endAt ? `${b.startAt} – ${b.endAt}` : b.startAt;
  }

  // swimming = วัน + รอบ (slotLabel)
  return b.slotLabel ? `${b.startAt}\n ${b.slotLabel}` : b.startAt;}

  export function statusTone(status: BookingStatus) {
    if (status === "cancelled" || status === "rejected") return "danger" as const;
    if (status === "finished") return "success" as const;
    if (status === "WaitingSlip" || status === "slip_uploaded") return "warning" as const;
    if (status === "slip_verified") return "success" as const;
    if (status === "check-in") return "info" as const;
    return "neutral" as const;
  }

  export function buildBillTimeline(b: Booking): BillStatusEvent[] {
    const base: BillStatusEvent[] = [
      { key: "pending", label: "สร้างบิล", tone: "neutral" },
      { key: "waiting_payment", label: "รอชำระเงิน", tone: "warning" },
      { key: "slip_uploaded", label: "อัปโหลดสลิปแล้ว", tone: "info" },
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
  
  /** ✅ Helpers สำหรับ booking ที่มีหลายตัว */
  export function primaryPet(b: Booking) {
    return b.pets?.[0];
  }
  
  export function petsLabel(b: Booking) {
    if (b.petsSummary?.label) return b.petsSummary.label;
  
    const names = (b.pets ?? []).map((p) => p.petName).filter(Boolean);
    if (names.length === 0) return "—";
    if (names.length <= 3) return names.join(", ");
    return `${names[0]}, ${names[1]} และอีก ${names.length - 2} ตัว`;
  }

  export function petsList(b: Booking): string[] {
    const fromArray = (b.pets ?? [])
      .map((p) => String((p as any).petName ?? "").trim())
      .filter(Boolean);
  
    if (fromArray.length) return fromArray;
  
    // ✅ fallback กรณี mock มี petName ตัวเดียว
    const single = String((b as any).petName ?? "").trim();
    return single ? [single] : [];
  }