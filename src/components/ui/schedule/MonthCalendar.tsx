"use client";

import type { Booking } from "@/lib/booking/booking.types";
import { dayKey, inSameMonth, monthGridDays, sameDay } from "@/lib/schedule/schedule.utils";
import { format } from "date-fns";
import DayCell from "./DayCell";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthCalendar({
  anchorMonth,
  selectedDate,
  onSelectDate,
  markersByDay,
}: {
  anchorMonth: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  markersByDay: Map<string, Booking[]>;
}) {
  const days = monthGridDays(anchorMonth);

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm overflow-hidden">
      {/* DOW header */}
      <div className="grid grid-cols-7 bg-white/70 px-2 pt-3 pb-2">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-black/50">
            {d}
          </div>
        ))}
      </div>

      {/* days grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-black/5">
        {days.map((d) => {
          const k = dayKey(d);
          const bookings = markersByDay.get(k) ?? [];

          const hasSwim = bookings.some((b) => b.serviceType === "swim");
          const hasBoarding = bookings.some((b) => b.serviceType === "boarding");

          return (
            <DayCell
              key={k}
              label={format(d, "d")}
              muted={!inSameMonth(d, anchorMonth)}
              selected={sameDay(d, selectedDate)}
              hasSwim={hasSwim}
              hasBoarding={hasBoarding}
              onClick={() => onSelectDate(d)}
            />
          );
        })}
      </div>
    </section>
  );
}
