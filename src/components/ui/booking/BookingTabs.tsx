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
  const tabs: TabKey[] = ["pending", "payment", "active", "finished", "cancelled"];

  return (
    <div className="px-2">
  <div className="rounded-3xl bg-white/40 ring-1 ring-black/5 shadow-sm p-2">
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 w-max m-1">
        {tabs.map((t) => {
          const meta = tabMeta(t);
          const active = value === t;

          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={[
                "shrink-0 px-4 py-2 rounded-2xl transition-all duration-200",
                "text-sm font-semibold whitespace-nowrap",
                active
                  ? "bg-[#F7F4E8] text-gray-900 ring-2 ring-[#F0A23A] shadow-sm"
                  : "bg-white/60 text-gray-600 ring-1 ring-black/10 hover:bg-black/[0.03]",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span>{meta.label}</span>
                <span
                  className={[
                    "px-2 py-0.5 text-xs rounded-full tabular-nums",
                    active
                      ? "bg-[#F0A23A] text-white"
                      : "bg-black/5 text-gray-600",
                  ].join(" ")}
                >
                  {counts[t] ?? 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
</div>

  
  );
}
