"use client";

import PoikaiCard from "@/components/ui/PoikaiCard";
import PoikaiChip from "@/components/ui/PoikaiChip";

export default function SwimConfirmSummary(props: {
  serviceLabel: string;
  date: string;
  time: string;
  isVip: boolean;
  petLines: { idx: number; label: string }[];
  total: number;
  ownerPlay?: boolean; // ✅ เพิ่ม
}) {
  const { serviceLabel, date, time, isVip, petLines, total, ownerPlay } = props;

  return (
    <PoikaiCard title="สรุปการจอง" subtitle={serviceLabel}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">วัน</p>
          <p className="font-semibold text-gray-900">{date || "-"}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">รอบ</p>
          <p className="font-semibold text-gray-900">{time || "-"}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">ประเภท</p>
          <PoikaiChip tone={isVip ? "danger" : "neutral"}>
            {isVip ? "VIP" : "ปกติ"}
          </PoikaiChip>
        </div>

        {/* ✅ เพิ่มบรรทัด ownerPlay */}
        {typeof ownerPlay === "boolean" && (
          <div className="flex items-center justify-between">
            <p className="text-gray-600">เจ้าของลงเล่น</p>
            <PoikaiChip tone={ownerPlay ? "success" : "neutral"}>
              {ownerPlay ? "ใช่ (ฟรี)" : "ไม่"}
            </PoikaiChip>
          </div>
        )}

        <div className="pt-2 border-t border-black/5">
          <p className="text-gray-700 font-semibold mb-2">สัตว์ที่เลือก</p>
          <div className="space-y-1">
            {petLines.map((p) => (
              <p key={p.idx} className="text-gray-700">
                {p.idx}. {p.label}
              </p>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-black/5 flex items-center justify-between">
          <p className="text-gray-700 font-semibold">ราคารวม</p>
          <p className="text-gray-900 font-extrabold">
            {total.toLocaleString()} บาท
          </p>
        </div>
      </div>
    </PoikaiCard>
  );
}
