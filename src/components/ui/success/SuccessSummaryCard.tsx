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
  selectedContent?: React.ReactNode;

  totalLabel?: string;
  totalValue: React.ReactNode;
}) {
  return (
    <PoikaiCard title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {/* 1) Details */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5">
            <p className="text-sm font-semibold text-gray-900">รายละเอียด</p>
            <p className="text-xs text-gray-500 mt-0.5">ตรวจสอบข้อมูลก่อนยืนยัน</p>
          </div>

          <div className="px-4">
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 py-2 border-b border-black/5 last:border-b-0"
              >
                <p className="text-sm text-gray-600">{r.label}</p>
                <div className="text-sm font-semibold text-gray-900 text-right">
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2) Selected (optional) */}
        {selectedContent ? (
          <section className="rounded-2xl bg-[#FFF7EA]/60 ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{selectedTitle}</p>
              <span className="text-xs text-gray-500">Selected</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">{selectedContent}</div>
          </section>
        ) : null}

        {/* 3) Total */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{totalLabel}</p>
            <p className="text-lg font-extrabold text-gray-900">{totalValue}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            * ราคานี้รวมตามรายการที่เลือก
          </p>
        </section>
      </div>
    </PoikaiCard>
  );
}
