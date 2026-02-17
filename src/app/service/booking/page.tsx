"use client";

import BookingList from "@/components/ui/booking/BookingList";
import BookingTabs from "@/components/ui/booking/BookingTabs";
import { statusToTab } from "@/lib/booking/booking.logic";
import { bookingMock } from "@/lib/booking/booking.mock";
import { TabKey } from "@/lib/booking/booking.types";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>("pending");
  const bookings = bookingMock;

  const counts = useMemo(() => {
    const base: Record<TabKey, number> = {
      pending: 0,
      payment: 0,
      active: 0,
      finished: 0,
      cancelled: 0,
    };
    for (const b of bookings) base[statusToTab(b.status)] += 1;
    return base;
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <header className="px-4 pt-5 text-center">
        <h1 className="text-[22px] font-semibold text-black/90 ">รายการจอง</h1>
        <p className="text-[13px] text-black/45 mt-1">
          ดูสถานะการจองและดำเนินการต่อได้จากแท็บด้านล่าง
        </p>
      </header>

      <div className="mt-4">
        <BookingTabs value={tab} onChange={setTab} counts={counts} />
      </div>

      <div className="mt-4">
        <BookingList
          bookings={bookings}
          tab={tab}
          onUploadSlip={(bookingId) => {
            // ✅ จะทำเป็นหน้าแนบสลิปแยกก็ได้
            router.push(`/booking/${bookingId}?action=upload-slip`);
          }}
          onViewDetail={(bookingId) => {
            // ✅ ไปหน้ารายละเอียดจริง
            router.push(`/service/booking/${bookingId}`);
          }}
          onViewHistory={(bookingId) => {
            router.push(`/history?bookingId=${bookingId}`);
          }}
        />
      </div>
    </main>
  );
}
