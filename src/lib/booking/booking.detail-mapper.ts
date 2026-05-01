import type { Booking, BookingStatus } from "./booking.types";
import type { ReservationDetailResult } from "@/app/api/reservation/detail/route";

export function mapStatusFromBackend(status: string): BookingStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "waiting_slip":
      return "waiting_slip";
      case "slip_uploaded":
        return "slip_uploaded";
        case "slip_verified":
          return "slip_verified";
          case "pay_at_store":
            return "pay_at_store";
    case "check_in":
    case "check-in":
      return "check-in";
    case "finished":
      return "finished";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "rejected";
    default:
      return status as BookingStatus;
  }
}

export function mapServiceType(apiType: string): Booking["serviceType"] {
  if (apiType === "boarding") return "boarding";
  if (apiType === "swimming") return "swimming";
  return apiType as Booking["serviceType"];
}

export function mapDetailToBooking(detail: ReservationDetailResult): Booking {
  const serviceType = mapServiceType(detail.serviceType);

  const pets =
    detail.groups?.flatMap((g) => {
      const animals = (g as any).dogIds ?? (g as any).petIds ?? [];
      return (
        animals?.map((p: any) => ({
          petId: p.dogId ?? p.petId ?? p.id,
          petName: p.name,
          petSize: (p.sizeLabel === "large" ? "large" : "small") as "small" | "large",
        })) ?? []
      );
    }) ?? [];

  let startAt = "";
  let endAt: string | undefined;
  let slotLabel: string | undefined;

  if (serviceType === "boarding") {
    startAt = detail.period?.start ?? "";
    endAt = detail.period?.end;
  } else {
    const anyDetail = detail as any;
    const dateFromApi = anyDetail.date as string | undefined;
    const dateFromPeriod = (anyDetail.period?.date as string | undefined) ?? undefined;

    let dateFromCode: string | undefined;
    const m = /^RSV-(\d{4})(\d{2})(\d{2})-/.exec(detail.bookingCode);
    if (m) {
      const [, y, mm, dd] = m;
      dateFromCode = `${y}-${mm}-${dd}`;
    }

    // สำหรับ swimming ให้ใช้ period.date เป็นหลัก (ถ้ามี) รองลงมาคือ date, รหัส RSV, และ period.start
    const date = dateFromPeriod ?? dateFromApi ?? dateFromCode ?? detail.period?.start ?? "";
    const slotStart = (anyDetail.timeSlot?.start as string | undefined) ?? detail.period?.start ?? "";
    const slotEnd = (anyDetail.timeSlot?.end as string | undefined) ?? detail.period?.end ?? "";

    startAt = date;
    if (slotStart && slotEnd) {
      slotLabel = `${slotStart} - ${slotEnd}`;
    }
  }

  const booking: Booking = {
    id: detail.bookingCode,
    status: mapStatusFromBackend(detail.status),
    serviceType,
    pets,
    startAt,
    endAt,
    slotLabel,
    price: detail.totalPrice ?? 0,
    actions: detail.actions ?? undefined,
    slip: detail.slip ?? undefined,
    timeline: detail.timeline ?? [],
    paymentMethod:
      detail.paymentMethod === undefined ? undefined : detail.paymentMethod,
    statusHint: detail.statusHint ?? undefined,
    detailStatusLabel: detail.statusLabel ?? undefined,
  };

  const b = booking as Booking & { groups?: unknown[]; note?: unknown | null; plan?: number };
  b.groups = detail.groups ?? [];
  b.note = detail.note ?? null;
  b.plan = 1;

  const anyDetail = detail as {
    cancelledReason?: string;
    cancelled_reason?: string;
    cancelledBy?: "customer" | "staff";
    cancelled_by?: string;
    cancelledByStaffName?: string;
    cancelled_by_staff_name?: string;
  };
  const reason = detail.cancelledReason ?? anyDetail.cancelled_reason;
  const by = detail.cancelledBy ?? anyDetail.cancelled_by;
  const byStaff = detail.cancelledByStaffName ?? anyDetail.cancelled_by_staff_name;
  if (reason !== undefined && reason !== null) booking.cancelledReason = String(reason);
  if (by === "staff" || by === "customer") booking.cancelledBy = by;
  if (byStaff !== undefined && byStaff !== null) booking.cancelledByStaffName = String(byStaff);

  return booking;
}

