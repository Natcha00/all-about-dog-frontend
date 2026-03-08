"use client";

import BookingList from "@/components/ui/booking/BookingList";
import BookingTabs from "@/components/ui/booking/BookingTabs";
import PageLoading from "@/components/ui/PageLoading";
import type { Booking, TabKey } from "@/lib/booking/booking.types";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ReservationApiCounts = {
  pending: number;
  waiting_slip: number;
  slip_uploaded: number;
  slip_verified: number;
  check_in: number;
  finished: number;
  cancelled: number;
};

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
  cancelledReason?: string;
  cancelled_reason?: string;
  cancelledBy?: "customer" | "staff";
  cancelled_by?: string;
  cancelledByStaffName?: string;
  cancelled_by_staff_name?: string;
};

type ReservationApiResponse = {
  counts: ReservationApiCounts;
  items: ReservationApiItem[];
};

const TAB_KEYS: TabKey[] = [
  "pending",
  "waiting_slip",
  "slip_uploaded",
  "slip_verified",
  "check_in",
  "finished",
  "cancelled",
];

function normalizeTab(param: string | null): TabKey {
  if (!param) return "pending";
  // อนุญาตให้ใช้ทั้งชื่อ tab ฝั่ง UI และ key ฝั่ง backend บางส่วนผ่าน URL
  if (TAB_KEYS.includes(param as TabKey)) return param as TabKey;
  // รองรับ alias เก่าจาก URL เดิม
  if (param === "waitingSlip") return "waiting_slip";
  if (param === "slipVerified") return "slip_verified";
  if (param === "active") return "check_in";
  if (param === "check-in") return "check_in";
  if (param === "finished") return "finished";
  if (param === "cancelled") return "cancelled";
  return "pending";
}

function mapStatusFromBackend(status: string): Booking["status"] {
  switch (status) {
    case "pending":
      return "pending";
    case "waiting_slip":
      // รวม waiting_slip / slip_uploaded อยู่ในกลุ่มรอชำระเงิน / สลิป
      return "waiting_slip";
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

function mapTabToBackend(tab: TabKey): string {
  // TabKey ตรงกับ key ฝั่ง backend อยู่แล้ว
  return tab;
}

function mapCounts(apiCounts: ReservationApiCounts | null): Record<TabKey, number> {
  if (!apiCounts) {
    return {
      pending: 0,
      waiting_slip: 0,
      slip_uploaded: 0,
      slip_verified: 0,
      check_in: 0,
      finished: 0,
      cancelled: 0,
    };
  }

  return {
    pending: apiCounts.pending ?? 0,
    waiting_slip: apiCounts.waiting_slip ?? 0,
    slip_uploaded: apiCounts.slip_uploaded ?? 0,
    slip_verified: apiCounts.slip_verified ?? 0,
    check_in: apiCounts.check_in ?? 0,
    finished: apiCounts.finished ?? 0,
    cancelled: apiCounts.cancelled ?? 0,
  };
}

function mapServiceType(apiType: string): Booking["serviceType"] {
  if (apiType === "boarding") return "boarding";
  // backend ส่ง "swimming" → map เป็น "swim" ให้ตรงกับ Booking type
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

  const reason =
    item.cancelledReason ??
    (item as { cancelled_reason?: string }).cancelled_reason;
  const by =
    item.cancelledBy ??
    (item as { cancelled_by?: string }).cancelled_by;
  const byStaffName =
    item.cancelledByStaffName ??
    (item as { cancelled_by_staff_name?: string }).cancelled_by_staff_name;

  const cancelledByNormalized: Booking["cancelledBy"] =
    by === "staff" ? "staff" : by === "customer" ? "customer" : undefined;

  return {
    id: item.id,
    status: mapStatusFromBackend(item.status),
    serviceType,
    pets,
    startAt,
    endAt,
    slotLabel,
    price: item.totalPrice ?? 0,
    ...(reason !== undefined && { cancelledReason: reason }),
    ...(cancelledByNormalized !== undefined && { cancelledBy: cancelledByNormalized }),
    ...(byStaffName !== undefined && { cancelledByStaffName: byStaffName }),
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const tab: TabKey = normalizeTab(tabParam);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [countsRaw, setCountsRaw] = useState<ReservationApiCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const backendTab = mapTabToBackend(tab);
        const url = `/api/reservation?tab=${encodeURIComponent(backendTab)}`;
        const res = await fetch(url);
        const data: ReservationApiResponse = await res.json().catch(() => ({ counts: null, items: [] } as any));
        if (!res.ok) {
          if (cancelled) return;
          setError((data as any)?.error ?? "โหลดรายการจองไม่สำเร็จ");
          setBookings([]);
          setCountsRaw(null);
          return;
        }
        if (cancelled) return;
        setCountsRaw(data.counts);
        const mapped = data.items.map(mapItemToBooking);
        setBookings(mapped);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดรายการจอง");
        setBookings([]);
        setCountsRaw(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const counts = useMemo(() => {
    return mapCounts(countsRaw);
  }, [countsRaw]);

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <header className="px-4 pt-5 text-center">
        <h1 className="text-[22px] font-semibold text-black/90 ">รายการจอง</h1>
        <p className="text-[13px] text-black/45 mt-1">
          ดูสถานะการจองและดำเนินการต่อได้จากแท็บด้านล่าง
        </p>
      </header>

      <div className="mt-4">
        <BookingTabs
          value={tab}
          onChange={(nextTab) => {
            const params = new URLSearchParams(searchParams.toString());
            if (nextTab === "pending") {
              // ค่า default: ลบ ?tab ออกให้ URL สั้น
              params.delete("tab");
            } else {
              params.set("tab", nextTab);
            }
            const query = params.toString();
            const path = query ? `/service/booking?${query}` : "/service/booking";
            router.replace(path);
          }}
          counts={counts}
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <PageLoading fullScreen={false} message="กำลังโหลดรายการจอง..." />
        ) : error ? (
          <div className="px-4">
            <div className="rounded-3xl bg-rose-50 ring-1 ring-rose-100 p-6 text-center text-rose-700 text-sm">
              {error}
            </div>
          </div>
        ) : (
          <BookingList
            bookings={bookings}
            tab={tab}
            onViewDetail={(bookingId) => {
              router.push(`/service/booking/${bookingId}`);
            }}
            onViewHistory={(bookingId) => {
              router.push(`/history?bookingId=${bookingId}`);
            }}
          />
        )}
      </div>
    </main>
  );
}
