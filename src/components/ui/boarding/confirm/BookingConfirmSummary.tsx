import React from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import { CalendarDays, PawPrint } from "lucide-react";
import { formatThaiDateTime, getPlanLabel } from "@/lib/boarding/boarding.logic";

export default function BookingConfirmSummary({
  serviceLabel,
  startDate,
  endDate,
  startTime,
  endTime,
  nights,
  plan,
  petLines,
  roomsCount,
}: {
  serviceLabel: string; // เช่น "รับฝากเลี้ยง"
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  nights: number;
  plan: 1 | 2 | 3;
  petLines: { idx: number; label: string }[];
  roomsCount: { SMALL: number; LARGE: number; VIP: number };
}) {
  const planLabel = getPlanLabel(plan);

  return (
    <PoikaiCard
      title="ยืนยันรายการจอง"
      subtitle="ตรวจสอบรายละเอียดก่อนกดยืนยัน"
      icon={<CalendarDays className="w-5 h-5 text-[#399199]" />}
    >
      <div className="space-y-3 text-gray-900">
        <p className="font-semibold">
          ประเภทบริการ: <span className="font-normal">{serviceLabel}</span>
        </p>

        <div>
          <p className="font-semibold">วันที่จองใช้บริการ:</p>
          <p>{formatThaiDateTime(startDate, startTime)}</p>
          <p>ถึง {formatThaiDateTime(endDate, endTime)}</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-[#399199]" />
            <p className="font-semibold">สัตว์เลี้ยงที่ใช้บริการ:</p>
          </div>

          <ol className="mt-1 list-decimal pl-5">
            {petLines.map((x) => (
              <li key={x.idx}>{x.label}</li>
            ))}
          </ol>
        </div>

        <div>
          <p className="font-semibold">รูปแบบห้องพัก</p>

          <div className="mt-1 space-y-1">
            {roomsCount.SMALL > 0 && (
              <div className="flex items-center justify-between">
                <span>1. ตึกหมาเล็ก</span>
                <span>{roomsCount.SMALL} ห้อง</span>
              </div>
            )}

            {roomsCount.LARGE > 0 && (
              <div className="flex items-center justify-between">
                <span>{roomsCount.SMALL > 0 ? "2." : "1."} ตึกหมาใหญ่</span>
                <span>{roomsCount.LARGE} ห้อง</span>
              </div>
            )}

            {roomsCount.VIP > 0 && (
              <div className="flex items-center justify-between">
                <span>{roomsCount.SMALL + roomsCount.LARGE > 0 ? "3." : "1."} ห้อง VIP</span>
                <span>{roomsCount.VIP} ห้อง</span>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-600">
              ({planLabel} • {Math.max(1, nights)} คืน)
            </p>
          </div>
        </div>
      </div>
    </PoikaiCard>
  );
}
