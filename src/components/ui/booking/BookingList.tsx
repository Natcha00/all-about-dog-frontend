"use client";

import React from "react";
import BookingCard from "./BookingCard";
import { Booking, TabKey } from "@/lib/booking/booking.types";

export default function BookingList({
  bookings,
  tab, // ตอนนี้ใช้สำหรับข้อความ/behavior ภายนอกเท่านั้น ข้อมูลที่ส่งเข้ามาถือว่า filtered แล้วจาก API
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
  if (bookings.length === 0) {
    return (
      <div className="px-4">
        <div className="rounded-3xl bg-white/60 ring-1 ring-black/5 p-6 text-center text-black/50">
          ยังไม่มีรายการในแท็บนี้
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
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
