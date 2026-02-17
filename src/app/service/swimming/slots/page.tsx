"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SlotCard, { type Slot } from "@/components/ui/swimming/SlotCard";

function isSlotSelectable(slot: Slot, isVip: boolean) {
  if (slot.booked >= slot.capacity) return false;
  if (isVip) return slot.booked === 0; // ✅ VIP ต้องว่างสนิท
  return true;
}

function SwimSlotsPage() {
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
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <div className="mx-auto w-full max-w-md space-y-4">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">
            เลือกรอบว่ายน้ำ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            วันที่ {date || "-"} • {petIds.length} ตัว
          </p>
        </div>
  
        {/* เลือกรอบ */}
        <section className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-5">
          <div className="mb-3">
            <p className="text-sm font-extrabold text-gray-900">ขั้นตอนที่ 1: เลือกรอบ</p>
            <p className="text-xs text-gray-500">
              เลือกรอบที่เพื่อนขนาดใกล้เคียงกันเพื่อลดอุบัติเหตุ
            </p>
          </div>
  
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
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
                  onSelect={(time) => setSelectedTime(time)}
                />
              );
            })}
          </div>
        </section>
  
        {/* VIP Section */}
        <section className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
            <div>
              <p className="text-sm font-extrabold text-gray-900">
                จองเป็นรอบ VIP
              </p>
              <p className="text-xs text-gray-500">
                เฉพาะวันธรรมดา ไม่รวมวันหยุดและนักขัตฤกษ์
              </p>
              {isVip && (
                <p className="mt-1 text-xs font-semibold text-black/60">
                  * VIP เลือกได้เฉพาะรอบที่ว่างสนิท
                </p>
              )}
            </div>
          </div>
        </section>
  
        {/* Summary (ถ้าเลือกแล้ว) */}
        {selectedTime && (
          <div className="rounded-2xl bg-[#F7F4E8] ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-black/60">รอบที่เลือก</p>
              <p className="text-base font-extrabold text-black/90">
                {selectedTime} {isVip ? "(VIP)" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
  
      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-[#F7F4E8]/95 backdrop-blur border-t border-black/5">
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
              "w-full py-4 rounded-2xl text-xl font-extrabold text-white transition active:scale-[0.99]",
              canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ต่อไป
          </button>
  
          {!canNext && (
            <p className="mt-2 text-center text-xs text-gray-600">
              กรุณาเลือกสัตว์ + วันที่ + รอบ ให้ครบ
            </p>
          )}
        </div>
      </div>
    </main>
  );
}


export default function Page(){
  return <Suspense>
    <SwimSlotsPage/>
  </Suspense>
}
