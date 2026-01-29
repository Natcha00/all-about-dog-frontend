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
    <section className="rounded-2xl border border-black/50 bg-[#FFF7EA] p-2">
      <div className="grid grid-cols-7">
        {DOW.map((d) => (
          <div
            key={d}
            className="px-1 pb-2 text-center text-sm font-semibold text-black/70"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-black/40">
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
