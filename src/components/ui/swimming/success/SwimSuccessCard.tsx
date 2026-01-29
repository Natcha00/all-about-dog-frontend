"use client";

import { CalendarDays, Clock, PawPrint, Waves } from "lucide-react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import PoikaiChip from "@/components/ui/PoikaiChip";

function formatThaiDate(raw: string) {
  if (!raw || raw === "-") return "-";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export default function SwimSuccessCard(props: {
  bookingNo: string;
  date: string;
  time: string;
  vip: boolean;
  ownerPlay: boolean;
  total: number;
  petIds: number[];
}) {
  const { bookingNo, date, time, vip, ownerPlay, total, petIds } = props;

  return (
    <PoikaiCard title="รายละเอียดการจอง" subtitle="ตรวจสอบข้อมูลก่อนกลับหน้า service">
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">รายการจอง</p>
          <p className="font-extrabold text-gray-900">{bookingNo}</p>
        </div>

        <div className="h-px bg-black/5" />

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#E8F7F6] ring-1 ring-[#BFE7E9]">
              <CalendarDays className="h-5 w-5 text-[#399199]" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600">วันที่ใช้บริการ</p>
              <p className="font-semibold text-gray-900">{formatThaiDate(date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF6EC] ring-1 ring-[#F2B680]">
              <Clock className="h-5 w-5 text-[#D77F2F]" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600">รอบเวลา</p>
              <p className="font-semibold text-gray-900">
                {time || "-"} {vip ? "(VIP)" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-black/5" />

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-gray-200">
            <PawPrint className="h-5 w-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-600">สัตว์เลี้ยงที่ใช้บริการ</p>

            {petIds.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {petIds.map((id, i) => (
                  <PoikaiChip key={`${id}-${i}`} tone="neutral">
                    {i + 1}. ID {id}
                  </PoikaiChip>
                ))}
              </div>
            ) : (
              <p className="mt-1 font-semibold text-gray-900">-</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
            <Waves className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-600">เจ้าของลงเล่นกับสุนัข</p>
            <p className="font-semibold text-gray-900">{ownerPlay ? "ใช่ (ฟรี)" : "ไม่"}</p>
          </div>
        </div>

        <div className="h-px bg-black/5" />

        <div className="flex items-center justify-between">
          <p className="text-gray-600">ราคารวม</p>
          <p className="text-lg font-extrabold text-gray-900">
            {total.toLocaleString()} บาท
          </p>
        </div>
      </div>
    </PoikaiCard>
  );
}
