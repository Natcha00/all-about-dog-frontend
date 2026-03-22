"use client";

import { tabMeta } from "@/lib/booking/booking.logic";
import { TabKey } from "@/lib/booking/booking.types";
import React from "react";

export default function BookingTabs({
  value,
  onChange,
  counts,
}: {
  value: TabKey;
  onChange: (t: TabKey) => void;
  counts: Record<TabKey, number>;
}) {
  const tabs: TabKey[] = [
    "pending",
    "waiting_slip",
    "slip_uploaded",
    "slip_verified",
    "pay_at_store",
    "check_in",
    "finished",
    "cancelled",
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((t) => {
        const meta = tabMeta(t);
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition shrink-0",
              active
                ? "bg-[#F0A23A]/15 border-[#F0A23A] text-[#B86B12]"
                : "bg-white border-black/10 text-gray-700 hover:bg-black/5",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span>{meta.label}</span>
              <span
                className={[
                  "ml-0.5 px-2 py-0.5 text-[10px] rounded-full tabular-nums",
                  active ? "bg-[#F0A23A] text-white" : "bg-black/5 text-gray-600",
                ].join(" ")}
              >
                {counts[t] ?? 0}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
