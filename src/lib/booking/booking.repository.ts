import type { Booking } from "@/lib/schedule/schedule.types";

// ✅ ตอนนี้ใช้ mockBookings ก่อน (ของที่คุณมีอยู่แล้ว)
import { mockBookings } from "@/lib/schedule/schedule.mock";

// ในอนาคตเปลี่ยนเป็น fetch จาก backend ได้ในไฟล์นี้ไฟล์เดียว
export async function getBookingById(id: string): Promise<Booking | null> {
  // TODO: backend future:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, { cache: "no-store" })
  // return res.ok ? await res.json() : null;

  const found = mockBookings.find((b) => b.id === id);
  return found ?? null;
}

export async function cancelBookingById(id: string): Promise<{ ok: boolean }> {
  // TODO: backend future:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/cancel`, { method: "PATCH" })
  // return { ok: res.ok };

  // mock simulate
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
