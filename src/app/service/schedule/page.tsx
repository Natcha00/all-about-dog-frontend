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
  const [anchorMonth, setAnchorMonth] = useState(() => new Date("2026-01-01T00:00:00"));
  const [selectedDate, setSelectedDate] = useState(() => new Date("2026-01-16T00:00:00"));
  const [petFilter, setPetFilter] = useState<string>("ทั้งหมด");

  // ✅ รวมรายชื่อสัตว์เลี้ยงจาก pets[]
  const allPets = useMemo(() => {
    const set = new Set<string>();
    bookingMock.forEach((b) => {
      b.pets.forEach((p) => set.add(p.petName));
    });
    return ["ทั้งหมด", ...Array.from(set)];
  }, []);

  // ✅ filter ตามสัตว์เลี้ยง: booking ผ่านถ้ามีอย่างน้อย 1 pet ตรง
  const filteredBookings = useMemo(() => {
    if (petFilter === "ทั้งหมด") return bookingMock;
    return bookingMock.filter((b) => b.pets.some((p) => p.petName === petFilter));
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
    <main className="min-h-screen bg-[#F7F4E8]">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-10 space-y-5">
        <ScheduleHeader
          monthLabel={format(anchorMonth, "MMMM yyyy")}
          pets={allPets}
          selectedPet={petFilter}
          onPrevMonth={() => setAnchorMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setAnchorMonth((m) => addMonths(m, 1))}
          onChangePet={setPetFilter}
        />

        <section className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-4">
          <MonthCalendar
            anchorMonth={anchorMonth}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
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