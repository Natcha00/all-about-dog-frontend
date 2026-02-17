"use client";

import React from "react";
import HistoryList from "@/components/ui/history/HistoryList";
import type { ServiceHistoryItem } from "@/components/ui/history/types";

const mock: ServiceHistoryItem[] = [
  {
    id: "202320034",
    kind: "swimming",
    kindLabel: "สระว่ายน้ำ",
    iconSrc: "/icons/swimming.png",
    startAt: "2023-03-17T14:45:00",
    endAt: "2023-03-17T16:00:00",
  },
  {
    id: "202330060",
    kind: "boarding",
    kindLabel: "รับฝากเลี้ยง",
    iconSrc: "/icons/boarding.png",
    startAt: "2023-04-01T10:00:00",
    endAt: "2023-04-03T12:00:00",
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
