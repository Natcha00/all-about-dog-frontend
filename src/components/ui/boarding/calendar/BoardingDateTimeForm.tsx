"use client";

import React, { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import PoikaiField from "@/components/ui/PoikaiField";

export default function BoardingDateTimeForm({
  startDate,
  endDate,
  startTime,
  endTime,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  inputCls,
  startTimeError,
  endTimeError,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
}: {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  setStartTime: (v: string) => void;
  setEndTime: (v: string) => void;

  inputCls: string;
  startTimeError?: string;
  endTimeError?: string;

  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onStartTimeChange: (v: string) => void;
}) {
  // ✅ ตั้ง default เวลา ถ้าค่าว่าง
  useEffect(() => {
    if (!startTime) setStartTime("09:00");
    if (!endTime) setEndTime("18:59"); // เพราะคุณตั้ง max="18:59"
  }, [startTime, endTime, setStartTime, setEndTime]);

  return (
    <PoikaiCard
      title="กำหนดวันและเวลา"
      subtitle="กรอกให้ครบทั้งวันเข้า/วันออก และเวลา"
      icon={<CalendarDays className="w-5 h-5 text-[#399199]" />}
    >
      <div className="space-y-4">
        <PoikaiField label="วันเข้า" required>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={inputCls}
          />
        </PoikaiField>

        <PoikaiField label="เวลาเข้า (ตั้งแต่ 09:00)" error={startTimeError}>
          <input
            type="time"
            value={startTime}
            min="09:00"
            step={300}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={inputCls}
          />
        </PoikaiField>

        <PoikaiField label="วันออก" required>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={inputCls}
          />
        </PoikaiField>

        <PoikaiField label="เวลารับกลับ (ก่อน 19:00)" error={endTimeError}>
          <input
            type="time"
            value={endTime}
            max="18:59"
            step={300}
            min={startDate && endDate && startDate === endDate && startTime ? startTime : undefined}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputCls}
          />
        </PoikaiField>
      </div>
    </PoikaiCard>
  );
}
