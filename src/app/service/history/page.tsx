"use client";

import React from "react";
import HistoryList from "@/components/ui/history/HistoryList";
import type { ServiceHistoryItem } from "@/components/ui/history/types";

const mock: ServiceHistoryItem[] = [
  {
    type: "SWIMMING",
    id: "#202320034",
    kindLabel: "บริการว่ายน้ำ",
    date: "2023-03-17",
    slotLabel: "14:00 - 15:00"
  },
  {
    type: "BOARDING",
    id: "#BD20260321-0012",
    kindLabel: "บริการฝากเลี้ยง",
    startAt: "2026-03-21T14:00:00",
    endAt: "2026-03-23T10:00:00"
  },
];

export default function ServiceHistoryPage() {
  return (
    <main className="min-h-screen bg-[#F7F4E8]">
      <div className="mx-auto w-full max-w-md px-4 pt-8 pb-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-900">
          ประวัติการใช้บริการ
        </h1>

        <div className="mt-6">
          <HistoryList items={mock} />
        </div>
      </div>
    </main>
  );
}
