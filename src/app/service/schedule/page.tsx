"use client";

import { useMemo, useRef, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";

import type { Booking } from "@/lib/booking/booking.types";
import { bookingMock } from "@/lib/booking/booking.mock";
import { bookingDayKeys, dayKey } from "@/lib/schedule/schedule.utils";

import ScheduleHeader from "@/components/ui/schedule/ScheduleHeader";
import MonthCalendar from "@/components/ui/schedule/MonthCalendar";
import BookingList from "@/components/ui/schedule/BookingList";

export default function SchedulePage() {
  // 🔁 ปรับเดือนให้ตรงกับ mock (ม.ค. 2569 = 2026)
  const [anchorMonth, setAnchorMonth] = useState(() => new Date("2026-01-01T00:00:00"));
  const [selectedDate, setSelectedDate] = useState(() => new Date("2026-01-16T00:00:00"));
  const [petFilter, setPetFilter] = useState<string>("ทั้งหมด");

  // ✅ รวมรายชื่อสัตว์เลี้ยง (booking.types = petName เป็น string)
  const allPets = useMemo(() => {
    const set = new Set<string>();
    bookingMock.forEach((b) => set.add(b.petName));
    return ["ทั้งหมด", ...Array.from(set)];
  }, []);

  // ✅ filter ตามสัตว์เลี้ยง
  const filteredBookings = useMemo(() => {
    if (petFilter === "ทั้งหมด") return bookingMock;
    return bookingMock.filter((b) => b.petName === petFilter);
  }, [petFilter]);

  // ✅ Map วัน -> bookings (boarding = หลายวัน, swim = วันเดียว)
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();

    for (const b of filteredBookings) {
      const keys = bookingDayKeys(b);
      for (const k of keys) {
        map.set(k, [...(map.get(k) ?? []), b]);
      }
    }
    return map;
  }, [filteredBookings]);

  const selectedDayBookings = useMemo(() => {
    return bookingsByDay.get(dayKey(selectedDate)) ?? [];
  }, [bookingsByDay, selectedDate]);

  const bookingSectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="min-h-screen bg-[#FFF7EA]">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-10 space-y-5">

        {/* 1️⃣ Header */}
        <ScheduleHeader
          monthLabel={format(anchorMonth, "MMMM yyyy")}
          pets={allPets}
          selectedPet={petFilter}
          onPrevMonth={() => setAnchorMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setAnchorMonth((m) => addMonths(m, 1))}
          onChangePet={setPetFilter}
        />

        {/* 2️⃣ Calendar Section */}
        <section className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-4">
          <MonthCalendar
            anchorMonth={anchorMonth}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);

              // รอ render เสร็จนิดนึงแล้วค่อย scroll
              setTimeout(() => {
                bookingSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 50);
            }}
            markersByDay={bookingsByDay}
          />
        </section>

        {/* 3️⃣ Selected Day */}
        <section ref={bookingSectionRef}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-black/50">รายการในวันที่</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-black">
                {format(selectedDate, "d MMMM yyyy")}
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-black/[0.06] px-3 py-1 text-xs font-bold text-black/70">
              {selectedDayBookings.length} รายการ
            </span>
          </div>

          <BookingList bookings={selectedDayBookings} />
        </section>
      </div>
    </main>
  );
}
