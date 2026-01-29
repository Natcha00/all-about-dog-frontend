import { eachDayOfInterval, startOfDay } from "date-fns";
import type { Booking } from "@/lib/booking/booking.types";

export function dayKey(d: Date) {
  const x = startOfDay(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function inSameMonth(a: Date, anchor: Date) {
  return a.getFullYear() === anchor.getFullYear() && a.getMonth() === anchor.getMonth();
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** สร้างวันใน grid ของปฏิทิน (6 แถว x 7 วัน) */
export function monthGridDays(anchorMonth: Date) {
  const first = new Date(anchorMonth.getFullYear(), anchorMonth.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // เริ่มที่วันอาทิตย์

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

/** parse "dd/MM/2569" (พ.ศ.) -> Date (ค.ศ.) */
export function parseThaiDate(dmy: string): Date {
  const [dd, mm, yyyy] = dmy.split("/").map((v) => Number(v));
  const yearCE = yyyy >= 2400 ? yyyy - 543 : yyyy;
  return new Date(yearCE, (mm ?? 1) - 1, dd ?? 1, 0, 0, 0);
}

/** คืน day keys ที่ booking ครอบคลุม */
export function bookingDayKeys(b: Booking): string[] {
  const start = startOfDay(parseThaiDate(b.startAt));

  if (b.serviceType === "boarding" && b.endAt) {
    const end = startOfDay(parseThaiDate(b.endAt));
    return eachDayOfInterval({ start, end }).map(dayKey);
  }

  return [dayKey(start)];
}
