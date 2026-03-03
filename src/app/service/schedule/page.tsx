"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";

import type { Booking } from "@/lib/booking/booking.types";
import { bookingDayKeys, dayKey } from "@/lib/schedule/schedule.utils";

import ScheduleHeader from "@/components/ui/schedule/ScheduleHeader";
import MonthCalendar from "@/components/ui/schedule/MonthCalendar";
import BookingList from "@/components/ui/schedule/BookingList";

type ReservationApiItem = {
  id: string;
  status: string;
  serviceType: string;
  statusLabel: string;
  dogs: Array<{ name: string }>;
  dogsLabel: string;
  totalPrice: number;
  date?: string;
  timeSlot?: { start: string; end: string };
  checkInDate?: string;
  checkOutDate?: string;
};

type ReservationApiResponse = {
  counts: unknown;
  items: ReservationApiItem[];
};

function mapStatusFromBackend(status: string): Booking["status"] {
  switch (status) {
    case "pending":
      return "pending";
    case "waiting_slip":
      return "WaitingSlip";
    case "slip_uploaded":
      return "slip_uploaded";
    case "slip_verified":
      return "slip_verified";
    case "check_in":
    case "check-in":
      return "check-in";
    case "finished":
      return "finished";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "rejected";
    default:
      return status as Booking["status"];
  }
}

function mapServiceType(apiType: string): Booking["serviceType"] {
  if (apiType === "boarding") return "boarding";
  if (apiType === "swimming") return "swimming";
  return apiType as Booking["serviceType"];
}

function mapItemToBooking(item: ReservationApiItem): Booking {
  const serviceType = mapServiceType(item.serviceType);

  const pets =
    item.dogs?.map((d, idx) => ({
      petId: idx + 1,
      petName: d.name,
      petSize: "small" as const,
    })) ?? [];

  let startAt = "";
  let endAt: string | undefined;
  let slotLabel: string | undefined;

  if (serviceType === "boarding") {
    startAt = item.checkInDate ?? "";
    endAt = item.checkOutDate;
  } else {
    startAt = item.date ?? "";
    if (item.timeSlot?.start && item.timeSlot?.end) {
      slotLabel = `${item.timeSlot.start} - ${item.timeSlot.end}`;
    }
  }

  return {
    id: item.id,
    status: mapStatusFromBackend(item.status),
    serviceType,
    pets,
    startAt,
    endAt,
    slotLabel,
    price: item.totalPrice ?? 0,
  };
}

export default function SchedulePage() {
  const [anchorMonth, setAnchorMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [petFilter, setPetFilter] = useState<string>("ทั้งหมด");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reservation");
        const data: ReservationApiResponse = await res
          .json()
          .catch(() => ({ counts: null, items: [] } as any));

        if (!res.ok) {
          if (cancelled) return;
          setError((data as any)?.error ?? "โหลดตารางการจองไม่สำเร็จ");
          setBookings([]);
          return;
        }

        if (cancelled) return;
        setBookings(data.items.map(mapItemToBooking));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดตารางการจอง");
        setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ รวมรายชื่อสัตว์เลี้ยงจาก pets[]
  const allPets = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      (b.pets ?? []).forEach((p) => set.add(p.petName));
    });
    return ["ทั้งหมด", ...Array.from(set)];
  }, [bookings]);

  // ✅ filter ตามสัตว์เลี้ยง: booking ผ่านถ้ามีอย่างน้อย 1 pet ตรง
  const filteredBookings = useMemo(() => {
    if (petFilter === "ทั้งหมด") return bookings;
    return bookings.filter((b) => (b.pets ?? []).some((p) => p.petName === petFilter));
  }, [bookings, petFilter]);

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

          {loading ? (
            <div className="mt-3 rounded-3xl bg-white/60 ring-1 ring-black/5 p-4 text-center text-black/60">
              กำลังโหลดรายการจอง...
            </div>
          ) : error ? (
            <div className="mt-3 rounded-3xl bg-rose-50 ring-1 ring-rose-100 p-4 text-center text-rose-700 text-sm">
              {error}
            </div>
          ) : (
            <BookingList bookings={selectedDayBookings} />
          )}
        </section>
      </div>
    </main>
  );
}
