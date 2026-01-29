"use client";

import React, { useMemo } from "react";
import BookingCard from "./BookingCard";
import { Booking, TabKey } from "@/lib/booking/booking.types";
import { statusToTab } from "@/lib/booking/booking.logic";

export default function BookingList({
  bookings,
  tab,
  onUploadSlip,
  onViewDetail,
  onViewHistory,
}: {
  bookings: Booking[];
  tab: TabKey;
  onUploadSlip?: (bookingId: string) => void;
  onViewDetail?: (bookingId: string) => void;
  onViewHistory?: (bookingId: string) => void;
}) {
  const filtered = useMemo(() => {
    return bookings.filter((b) => statusToTab(b.status) === tab);
  }, [bookings, tab]);

  if (filtered.length === 0) {
    return (
      <div className="px-4">
        <div className="rounded-3xl bg-white/60 ring-1 ring-black/5 p-6 text-center text-black/50">
          ยังไม่มีรายการในแท็บนี้
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3">
      {filtered.map((b) => (
        <BookingCard
          key={b.id}
          b={b}
          onUploadSlip={onUploadSlip}
          onViewDetail={onViewDetail}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );
}
