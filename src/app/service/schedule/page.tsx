"use client";

import { useMemo, useState } from "react";
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

  return (
    <main className="min-h-screen bg-[#FFF7EA]">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-8">
        <ScheduleHeader
          monthLabel={format(anchorMonth, "MMMM yyyy")}
          pets={allPets}
          selectedPet={petFilter}
          onPrevMonth={() => setAnchorMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setAnchorMonth((m) => addMonths(m, 1))}
          onChangePet={setPetFilter}
        />

        <MonthCalendar
          anchorMonth={anchorMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markersByDay={bookingsByDay}
        />

        <div className="mt-5">
          <h2 className="text-[28px] font-extrabold tracking-tight text-black">
            {format(selectedDate, "d MMMM yyyy")}
          </h2>

          <BookingList bookings={selectedDayBookings} />
        </div>
      </div>
    </main>
  );
}
