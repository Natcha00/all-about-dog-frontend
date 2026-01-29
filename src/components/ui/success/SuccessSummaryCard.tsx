"use client";

import React from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";

export type SummaryRow = {
  label: string;
  value: React.ReactNode;
};

export default function SuccessSummaryCard({
  title = "สรุปรายการ",
  subtitle = "รายละเอียดการจอง",
  rows,
  selectedTitle = "สัตว์ที่เลือก",
  selectedContent,
  totalLabel = "ราคารวม",
  totalValue,
}: {
  title?: string;
  subtitle?: string;
  rows: SummaryRow[];

  selectedTitle?: string;
  selectedContent?: React.ReactNode; // optional section

  totalLabel?: string;
  totalValue: React.ReactNode;
}) {
  return (
    <PoikaiCard title={title} subtitle={subtitle}>
      <div className="space-y-3 text-sm">
        {/* rows */}
        {rows.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <p className="text-gray-600">{r.label}</p>
            <div className="font-semibold text-gray-900 text-right">{r.value}</div>
          </div>
        ))}

        {/* selected pets (optional) */}
        {selectedContent ? (
          <div className="pt-2 border-t border-black/5">
            <p className="font-semibold text-gray-900 mb-2">{selectedTitle}</p>
            <div className="text-gray-700">{selectedContent}</div>
          </div>
        ) : null}

        {/* total */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-between">
          <p className="font-semibold text-gray-900">{totalLabel}</p>
          <p className="font-extrabold text-gray-900">{totalValue}</p>
        </div>
      </div>
    </PoikaiCard>
  );
}
