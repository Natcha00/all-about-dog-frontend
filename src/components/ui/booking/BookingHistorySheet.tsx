"use client";

import React from "react";
import BottomSheetModal from "@/components/ui/BottomSheetModal";
import type { HistoryItem } from "@/lib/booking/booking.timeline";

function TimelineList({ items }: { items: HistoryItem[] }) {
  return (
    <div className="rounded-2xl bg-black/[0.02] ring-1 ring-black/5 max-h-80 overflow-y-auto">
      <div className="divide-y divide-black/5">
        {items.map((it, index) => {
          const isLatest = index === 0;
          const dot =
            isLatest && it.tone === "danger"
              ? "bg-red-500"
              : isLatest
              ? "bg-emerald-500"
              : "bg-gray-400";

          return (
            <div key={it.key + index} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black">{it.label}</div>
                  {it.at ? <div className="mt-1 text-xs text-black/50">{it.at}</div> : null}
                  {it.note ? <div className="mt-1 text-xs text-black/60">{it.note}</div> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type BookingHistorySheetProps = {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
  currentStatusLabel: string;
};

export default function BookingHistorySheet({
  open,
  onClose,
  items,
  currentStatusLabel,
}: BookingHistorySheetProps) {
  return (
    <BottomSheetModal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-extrabold text-black/90">สถานะบิล</p>
          <span className="text-[12px] text-black/45 font-semibold">
            ปัจจุบัน: {currentStatusLabel}
          </span>
        </div>

        {items.length > 0 ? (
          <TimelineList items={items} />
        ) : (
          <div className="rounded-2xl bg-black/[0.02] ring-1 ring-black/5 p-6 text-center text-sm text-black/50">
            ยังไม่มีประวัติสถานะ
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}

