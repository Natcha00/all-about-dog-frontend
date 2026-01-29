"use client";

import type { Booking } from "@/lib/booking/booking.types";
import BookingCard from "./BookingCard";

export default function BookingList({ bookings }: { bookings: Booking[] }) {
  if (!bookings.length) {
    return (
      <div className="mt-3 rounded-3xl bg-white/70 ring-1 ring-black/5 p-5 text-black/45">
        ไม่มีรายการจองในวันนี้
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}
