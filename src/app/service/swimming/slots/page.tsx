"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SlotCard, { type Slot } from "@/components/ui/swimming/SlotCard";

function isSlotSelectable(slot: Slot, isVip: boolean) {
  if (slot.booked >= slot.capacity) return false;
  if (isVip) return slot.booked === 0; // ✅ VIP ต้องว่างสนิท
  return true;
}

export default function SwimSlotsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ รับค่าจากหน้าก่อน (ตัวอย่าง: /service/swimming/slots?pets=1,2&date=2026-01-20)
  const petsParam = sp.get("pets") || "";
  const date = sp.get("date") || "";

  const petIds = useMemo(() => {
    return petsParam
      ? petsParam
          .split(",")
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];
  }, [petsParam]);

  // ✅ ทำให้ slots “คงที่” ไม่สร้างใหม่ทุก render
  const slots: Slot[] = useMemo(
    () => [
      { time: "10:00", capacity: 5, booked: 2, bigCount: 0, smallCount: 2 },
      { time: "11:00", capacity: 5, booked: 3, bigCount: 3, smallCount: 0 },
      { time: "12:00", capacity: 5, booked: 0, bigCount: 0, smallCount: 0 },
      { time: "13:00", capacity: 5, booked: 2, bigCount: 2, smallCount: 0 },
      { time: "14:00", capacity: 5, booked: 5, bigCount: 0, smallCount: 0 },
      { time: "15:00", capacity: 5, booked: 5, bigCount: 0, smallCount: 0 },
      { time: "16:00", capacity: 5, booked: 4, bigCount: 4, smallCount: 0 },
      { time: "17:00", capacity: 5, booked: 1, bigCount: 0, smallCount: 1 },
    ],
    []
  );

  const [isVip, setIsVip] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // ✅ กัน VIP เลือกรอบที่มีคนจองแล้ว (auto ยกเลิก)
  useEffect(() => {
    if (!isVip) return;
    if (!selectedTime) return;

    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return;

    if (slot.booked !== 0) {
      setSelectedTime("");
    }
  }, [isVip, selectedTime, slots]);

  const canNext = useMemo(() => {
    if (petIds.length === 0) return false;
    if (!date) return false;
    if (!selectedTime) return false;

    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return false;

    return isSlotSelectable(slot, isVip);
  }, [petIds.length, date, selectedTime, isVip, slots]);

  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-10 pb-44">
      <h1 className="text-3xl font-extrabold text-center text-gray-900">จองสระว่ายน้ำ</h1>

      {/* (optional) โชว์วันที่ที่เลือกมา */}
      <p className="mt-2 text-center text-sm text-gray-600">
        วันที่เลือก: <span className="font-semibold">{date || "-"}</span>
      </p>

      <div className="mt-6">
        <p className="text-l font-bold text-gray-900">เลือกรอบ</p>
        <p className="text-xs text-gray-600">
          (เลือกรอบที่เพื่อนขนาดใกล้เคียงกันน้องๆเพื่อลดอุบัติเหตุ)
        </p>
      </div>

      {/* slots grid */}
      <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-8">
        {slots.map((slot) => {
          const disabled = !isSlotSelectable(slot, isVip);
          const active = selectedTime === slot.time;

          return (
            <SlotCard
              key={slot.time}
              slot={slot}
              active={active}
              disabled={disabled}
              isVip={isVip}
              onSelect={(time) => setSelectedTime(time)} // ✅ time เป็น string
            />
          );
        })}
      </div>

      {/* vip checkbox */}
      <div className="mt-10 flex items-start gap-4">
        <input
          type="checkbox"
          checked={isVip}
          onChange={(e) => setIsVip(e.target.checked)}
          className="mt-1 h-6 w-6"
        />
        <div>
          <p className="text-lg font-bold text-gray-900">จองเป็นรอบ VIP มีเฉพาะบ้านเรา</p>
          <p className="text-sm text-gray-600">(เฉพาะวันธรรมดา ไม่รวมวันหยุดและนักขัตฤกษ์)</p>
          {isVip ? (
            <p className="mt-1 text-xs text-gray-700">
              * VIP เลือกได้เฉพาะรอบที่ “ว่างสนิท” (ยังไม่มีใครจอง)
            </p>
          ) : null}
        </div>
      </div>

      {/* bottom button */}
      <div className="fixed inset-x-0 bottom-16 z-20 bg-[#FFF7EA]/95 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-4">
          <button
            type="button"
            disabled={!canNext}
            onClick={() => {
              const qs = new URLSearchParams({
                pets: petIds.join(","),
                date,
                time: selectedTime,
                vip: isVip ? "1" : "0",
              });

              router.push(`/service/swimming/confirm?${qs.toString()}`);
            }}
            className={[
              "w-full py-4 rounded-2xl text-xl font-bold text-white transition",
              canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ต่อไป
          </button>

          {!canNext ? (
            <p className="mt-2 text-center text-xs text-gray-600">
              กรุณาเลือกสัตว์ + วันที่ + รอบ ให้ครบ (VIP เลือกได้เฉพาะรอบที่ว่างสนิท)
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
