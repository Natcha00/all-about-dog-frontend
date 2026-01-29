"use client";

import PoikaiChip from "@/components/ui/PoikaiChip";
// ✅ เปลี่ยน path นี้ให้ตรงกับโปรเจกต์คุณ (ตัว BottomSheet เดิม)
import BottomSheetModal from "@/components/ui/BottomSheetModal";
import type { SwimPricing } from "@/lib/swimming/types";

export default function SwimCostBreakdownSheet(props: {
  open: boolean;
  onClose: () => void;
  pricing: SwimPricing;
  isVip: boolean;
}) {
  const { open, onClose, pricing, isVip } = props;

  return (
    <BottomSheetModal open={open} onClose={onClose} title="คำนวณค่าใช้จ่าย">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">ประเภท</p>
          <PoikaiChip tone={isVip ? "danger" : "neutral"}>{isVip ? "VIP" : "ปกติ"}</PoikaiChip>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="font-semibold text-gray-900 mb-2">รายละเอียด</p>
          <div className="space-y-2">
            {pricing.lines.map((l, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-700">{l.label}</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {l.amount.toLocaleString()} บาท
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <p className="font-semibold text-gray-900">รวม</p>
            <p className="font-extrabold text-gray-900">{pricing.total.toLocaleString()} บาท</p>
          </div>
        </div>
      </div>
    </BottomSheetModal>
  );
}
