"use client";

import React, { useEffect, useState } from "react";
import HistoryList from "@/components/ui/history/HistoryList";
import PageLoading from "@/components/ui/PageLoading";
import type { ServiceHistoryItem } from "@/components/ui/history/types";

type ReservationApiItem = {
  id: string;
  status: string;
  serviceType: string;
  dogs: Array<{ name: string }>;
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

function mapServiceTypeToKind(serviceType: string): ServiceHistoryItem["type"] {
  return serviceType === "boarding" ? "BOARDING" : "SWIMMING";
}

function mapItemToHistory(item: ReservationApiItem): ServiceHistoryItem {
  const type = mapServiceTypeToKind(item.serviceType);

  if (type === "BOARDING") {
    return {
      type: "BOARDING",
      id: item.id,
      kindLabel: "บริการฝากเลี้ยง",
      startAt: item.checkInDate ?? "",
      endAt: item.checkOutDate ?? "",
    };
  }

  const date = item.date ?? "";
  const slotLabel =
    item.timeSlot?.start && item.timeSlot?.end
      ? `${item.timeSlot.start} - ${item.timeSlot.end}`
      : "";

  return {
    type: "SWIMMING",
    id: item.id,
    kindLabel: "บริการว่ายน้ำ",
    date,
    slotLabel,
  };
}

export default function ServiceHistoryPage() {
  const [items, setItems] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reservation?tab=finished");
        const data: ReservationApiResponse = await res
          .json()
          .catch(() => ({ counts: null, items: [] } as any));

        if (!res.ok) {
          if (cancelled) return;
          setError((data as any)?.error ?? "โหลดประวัติการใช้บริการไม่สำเร็จ");
          setItems([]);
          return;
        }

        if (cancelled) return;
        setItems(data.items.map(mapItemToHistory));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดประวัติการใช้บริการ");
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F4E8]">
      <div className="mx-auto w-full max-w-md px-4 pt-8 pb-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-900">
          ประวัติการใช้บริการ
        </h1>

        <div className="mt-6">
          {loading ? (
            <PageLoading fullScreen={false} message="กำลังโหลดประวัติการใช้บริการ..." />
          ) : error ? (
            <div className="rounded-3xl bg-rose-50 ring-1 ring-rose-100 p-6 text-center text-rose-700 text-sm">
              {error}
            </div>
          ) : (
            <HistoryList items={items} />
          )}
        </div>
      </div>
    </main>
  );
}
