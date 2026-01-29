"use client";

import React from "react";
import BottomSheetModal from "@/components/ui/BottomSheetModal";
import { Pricing } from "@/lib/boarding/boarding.logic";

export default function CostBreakdownSheet({
  open,
  onClose,
  pricing,
  nights,
}: {
  open: boolean;
  onClose: () => void;
  pricing: Pricing;
  nights: number;
}) {
  return (
    <BottomSheetModal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">คำนวณค่าใช้จ่ายเบื้องต้น</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-black/5"
        >
          ปิด
        </button>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4">
        <p className="font-semibold text-gray-900">รายละเอียดราคา (ต่อคืน)</p>

        {pricing.roomCosts.length > 0 ? (
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            {pricing.roomCosts.map((x) => (
              <div key={x.label} className="flex items-center justify-between">
                <span>{x.label}</span>
                <span className="font-medium">{x.perNight.toLocaleString()} บาท</span>
              </div>
            ))}

            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              <span className="text-gray-600">รวมต่อคืน</span>
              <span className="font-semibold">{pricing.perNight.toLocaleString()} บาท</span>
            </div>

            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              <span className="text-gray-600">จำนวนคืน</span>
              <span className="font-semibold">{Math.max(1, nights)} คืน</span>
            </div>

            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              <span className="text-gray-600">ราคารวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-gray-900">
                {pricing.total.toLocaleString()} บาท
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">ยังไม่มีรายละเอียดราคา</p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-2xl bg-[#F0A23A] py-3 font-semibold text-white"
      >
        ตกลง
      </button>
    </BottomSheetModal>
  );
}
