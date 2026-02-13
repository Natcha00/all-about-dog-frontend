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
    <div className="px-4">
  <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-2">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {tabs.map((t) => {
        const meta = tabMeta(t);
        const active = value === t;

        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              "rounded-2xl px-3 py-2 transition text-left",
              active
                ? "bg-[#F0A23A] text-white shadow-sm"
                : "bg-white/60 hover:bg-black/[0.03] text-black/70",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold leading-none">{meta.label}</p>
              <span
                className={[
                  "min-w-[28px] tabular-nums text-center text-[12px] px-2 py-0.5 rounded-full",
                  active ? "bg-white/15 text-white" : "bg-black/5 text-black/60",
                ].join(" ")}
              >
                {counts[t] ?? 0}
              </span>
            </div>

            <p className={active ? "text-[11px] text-white/70 mt-1" : "text-[11px] text-black/45 mt-1"}>
              {meta.hint}
            </p>
          </button>
        );
      })}
    </div>
  </div>
</div>

  

  );
}
