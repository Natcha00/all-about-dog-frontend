"use client";

import React, { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import PoikaiField from "@/components/ui/PoikaiField";

function DateInput({
  value,
  onChange,
  min,
  inputCls,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  inputCls: string;
}) {
  return (
    <div className="w-full min-w-0">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={[
          // ✅ กันล้นแบบ “หายชัวร์”
          "block w-full min-w-0 max-w-full box-border appearance-none",
          inputCls,
        ].join(" ")}
      />
    </div>
  );
}

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
  useEffect(() => {
    if (!startTime) setStartTime("09:00");
    if (!endTime) setEndTime("18:59");
  }, [startTime, endTime, setStartTime, setEndTime]);

  return (
    <PoikaiCard
      title="กำหนดวันและเวลา"
      subtitle="กรอกให้ครบทั้งวันเข้า/วันออก และเวลา"
      icon={<CalendarDays className="w-5 h-5 text-[#399199]" />}
    >
      {/* ✅ สำคัญ: min-w-0 ทั้งกล่อง */}
      <div className="space-y-4 min-w-0">
        <PoikaiField label="วันเข้า" required>
          <DateInput
            value={startDate}
            onChange={onStartDateChange}
            inputCls={inputCls}
          />
        </PoikaiField>

        <PoikaiField label="เวลาเข้า (ตั้งแต่ 09:00)" error={startTimeError}>
          <div className="w-full min-w-0">
            <input
              type="time"
              value={startTime}
              min="09:00"
              step={300}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className={[
                "block w-full min-w-0 max-w-full box-border appearance-none",
                inputCls,
              ].join(" ")}
            />
          </div>
        </PoikaiField>

        <PoikaiField label="วันออก" required>
          <DateInput
            value={endDate}
            min={startDate || undefined}
            onChange={onEndDateChange}
            inputCls={inputCls}
          />
        </PoikaiField>

        <PoikaiField label="เวลารับกลับ (ก่อน 19:00)" error={endTimeError}>
          <div className="w-full min-w-0">
            <input
              type="time"
              value={endTime}
              max="18:59"
              step={300}
              min={
                startDate && endDate && startDate === endDate && startTime
                  ? startTime
                  : undefined
              }
              onChange={(e) => setEndTime(e.target.value)}
              className={[
                "appearance-none",
                inputCls,
              ].join(" ")}
            />
          </div>
        </PoikaiField>
      </div>
    </PoikaiCard>
  );
}
