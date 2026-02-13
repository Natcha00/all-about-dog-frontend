"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import PoikaiCard from "@/components/ui/PoikaiCard";
import PoikaiChip from "@/components/ui/PoikaiChip";
import SelectedPetsChips, { SelectedPet } from "@/components/ui/boarding/calendar/SelectedPetsChips";
import AvailabilityBox from "@/components/ui/boarding/calendar/AvailabilityBox";
import BoardingDateTimeForm from "@/components/ui/boarding/calendar/BoardingDateTimeForm";
import RangeCalendar from "@/components/ui/boarding/calendar/RangeCalendar";

type StoredPet = {
  id: number;
  name: string;
  image: string;
  size: "small" | "large";
};

function calcNights(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil(diffDays));
}

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export default function BoardingCalendarPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // pets=1,2,3
  const petsParam = sp.get("pets") || "";
  const petIds = useMemo(() => {
    return petsParam
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
  }, [petsParam]);

  // อ่านชื่อ/รูปจาก sessionStorage (ที่มาจากหน้า select pet)
  const [storedPets, setStoredPets] = useState<StoredPet[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedPets");
      if (!raw) return;
      const arr = JSON.parse(raw) as StoredPet[];
      if (Array.isArray(arr)) setStoredPets(arr);
    } catch {
      // ignore
    }
  }, []);

  const selectedPets: SelectedPet[] = useMemo(() => {
    if (petIds.length === 0) return [];

    if (storedPets.length > 0) {
      const map = new Map(storedPets.map((p) => [p.id, p]));
      return petIds
        .map((id) => map.get(id))
        .filter(Boolean)
        .map((p) => ({ id: p!.id, name: p!.name, image: p!.image }));
    }

    // fallback: ถ้า refresh แล้ว session หาย
    return petIds.map((id) => ({ id, name: `ID: ${id}`, image: "/images/dogSwimmingLanding.jpg" }));
  }, [petIds, storedPets]);

  // ✅ state วัน/เวลา
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");     // YYYY-MM-DD
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:59");

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calcNights(startDate, endDate);
  }, [startDate, endDate]);

  const startTimeOk = startTime ? timeToMinutes(startTime) >= timeToMinutes("09:00") : false;
  const endTimeOk = endTime ? timeToMinutes(endTime) < timeToMinutes("19:00") : false;

  const sameDayTimeOk = useMemo(() => {
    if (!startDate || !endDate || !startTime || !endTime) return false;
    if (startDate !== endDate) return true;
    return timeToMinutes(endTime) > timeToMinutes(startTime);
  }, [startDate, endDate, startTime, endTime]);

  const canNext =
    petIds.length > 0 &&
    startDate &&
    endDate &&
    startTime &&
    endTime &&
    startTimeOk &&
    endTimeOk &&
    sameDayTimeOk;

  const goNext = () => {
    router.push(
      `/service/boarding/summary?pets=${encodeURIComponent(petIds.join(","))}` +
        `&start=${encodeURIComponent(startDate)}` +
        `&end=${encodeURIComponent(endDate)}` +
        `&startTime=${encodeURIComponent(startTime)}` +
        `&endTime=${encodeURIComponent(endTime)}` +
        `&nights=${encodeURIComponent(String(nights))}`
    );
  };

  // handlers คุมการล้างเวลา (ถ้าเลือกวันใหม่)
  const onStartDateChange = (newStart: string) => {
    setStartDate(newStart);

    if (endDate && newStart > endDate) {
      setEndDate("");
      setEndTime("");
    }

    if (endDate && newStart === endDate && startTime && endTime) {
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) setEndTime("");
    }
  };

  const onEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);

    if (startDate && newEnd === startDate && startTime && endTime) {
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) setEndTime("");
    }
  };

  const onStartTimeChange = (t: string) => {
    setStartTime(t);

    if (startDate && endDate && startDate === endDate && endTime) {
      if (timeToMinutes(endTime) <= timeToMinutes(t)) setEndTime("");
    }
  };

  const startTimeError = startTime && !startTimeOk ? "เวลาเข้าต้องตั้งแต่ 09:00 เป็นต้นไป" : undefined;

  const endTimeError =
    (endTime && !endTimeOk
      ? "เวลารับกลับต้องก่อน 19:00"
      : startDate && endDate && startTime && endTime && !sameDayTimeOk
      ? "ถ้าวันเข้าและวันออกเป็นวันเดียวกัน เวลารับกลับต้องมากกว่าเวลาเข้า"
      : undefined) || undefined;

      const inputCls = `
      rounded-2xl
      border border-gray-200
      bg-white px-4 py-3
      text-sm outline-none
      focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]
    `;
    
  return (
    <main className="min-h-screen bg-[#FFF7EA] pb-28">
      <div className="mx-auto w-full max-w-md px-4 pt-8 space-y-4">
        {/* Header */}
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-extrabold text-gray-900">เลือกวันเข้าพัก</h1>
          <p className="text-sm text-gray-500">บริการฝากเลี้ยง</p>
        </div>
  
        {/* Selected pets */}
        <section className="space-y-2">
          <p className="text-xs font-semibold text-black/50 px-1">สัตว์ที่เลือก</p>
          <SelectedPetsChips pets={selectedPets} />
        </section>
  
        {/* วัน + เวลา รวมไว้ในการ์ดเดียว */}
        <PoikaiCard
          title="เลือกวันและเวลาเข้าพัก"
          subtitle="เวลาเข้า ≥ 09:00 และรับกลับก่อน 19:00"
        >
          <div className="space-y-4">
            <BoardingDateTimeForm
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              inputCls={inputCls}
              startTimeError={startTimeError}
              endTimeError={endTimeError}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
              onStartTimeChange={onStartTimeChange}
            />
  
            <AvailabilityBox startDate={startDate} endDate={endDate} />
          </div>
        </PoikaiCard>
  
        {/* Summary */}
        {startDate && endDate ? (
          <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-black/50">สรุปจำนวนคืน</p>
                <p className="text-sm font-extrabold text-black/80">
                  {startDate} → {endDate}
                </p>
              </div>
  
              <PoikaiChip tone="success">{nights} คืน</PoikaiChip>
            </div>
  
            <div className="mt-2 text-xs text-black/45">
              เวลาเข้า {startTime || "-"} • รับกลับ {endTime || "-"}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/60 ring-1 ring-black/5 p-4 text-sm text-black/55">
            เลือกวันเข้าและวันออกเพื่อให้ระบบคำนวณจำนวนคืน
          </div>
        )}
      </div>
  
      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-[#FFF7EA]/95 backdrop-blur border-t border-black/5">
        <div className="mx-auto max-w-md px-6 py-4">
          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className={[
              "w-full py-4 rounded-2xl text-xl font-extrabold text-white transition active:scale-[0.99]",
              canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ต่อไป
          </button>
  
          {!canNext ? (
            <p className="mt-2 text-center text-xs text-gray-600">
              กรุณาเลือกวัน/เวลาให้ครบ (เข้า ≥ 09:00, รับกลับก่อน 19:00)
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
  
  
}
