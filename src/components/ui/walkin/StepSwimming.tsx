"use client";


import { swimPricePerDog, swimTotalPrice } from "@/lib/walkin/swimming/swimming.price.logic";
import { PetPicked, SwimmingDraft } from "@/lib/walkin/walkin/types.mock";
import React, { useEffect, useMemo, useState } from "react";

type Slot = { time: string; capacity: number; booked: number };

function todayISO() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSelectable(slot: Slot, isVip: boolean, petsCount: number) {
  const count = Math.max(0, petsCount);

  // ถ้าเลือกมาเกิน capacity ต่อรอบ เลือกไม่ได้ทุกกรณี
  if (count > slot.capacity) return false;

  // VIP ต้องว่างสนิท และต้องพอจุจำนวนหมาที่เลือก
  if (isVip) return slot.booked === 0 && count <= slot.capacity;

  // ปกติ ต้องมีที่ว่างพอ
  return slot.booked + count <= slot.capacity;
}

// ✅ ย้ายออกนอก component ให้ไม่สร้างใหม่ทุก render (ไม่กระทบ UI)
const SLOTS_BY_DATE: Record<string, Slot[]> = {
  "2026-02-16": [
    { time: "10:00", capacity: 5, booked: 2 },
    { time: "11:00", capacity: 5, booked: 3 },
    { time: "12:00", capacity: 5, booked: 0 },
    { time: "13:00", capacity: 5, booked: 2 },
    { time: "14:00", capacity: 5, booked: 5 },
    { time: "15:00", capacity: 5, booked: 1 },
  ],
  "2026-02-18": [
    { time: "10:00", capacity: 6, booked: 1 },
    { time: "11:00", capacity: 6, booked: 6 },
    { time: "12:00", capacity: 6, booked: 2 },
    { time: "13:00", capacity: 6, booked: 4 },
    { time: "14:00", capacity: 6, booked: 0 },
    { time: "15:00", capacity: 6, booked: 3 },
  ],
  "2026-02-19": [
    { time: "10:00", capacity: 4, booked: 4 },
    { time: "11:00", capacity: 4, booked: 2 },
    { time: "12:00", capacity: 4, booked: 1 },
    { time: "13:00", capacity: 4, booked: 0 },
    { time: "14:00", capacity: 4, booked: 3 },
    { time: "15:00", capacity: 4, booked: 1 },
  ],
};

export default function StepSwimming(props: {
  pets: PetPicked[];
  onBack: () => void;
  onNext: (draft: SwimmingDraft) => void;
}) {
  const { pets, onBack, onNext } = props;

  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [isVip, setIsVip] = useState<boolean>(false);
  const [ownerPlay, setOwnerPlay] = useState<boolean>(false);

  const slots: Slot[] = useMemo(() => {
    return SLOTS_BY_DATE[dateISO] ?? [];
  }, [dateISO]);

  // ✅ เปลี่ยนวันแล้วล้างเวลาที่เลือก
  useEffect(() => {
    setSelectedTime("");
  }, [dateISO]);

  // ✅ ถ้าเปิด VIP แล้ว "รอบนี้เลือกไม่ได้" -> reset
  useEffect(() => {
    if (!isVip) return;
    if (!selectedTime) return;

    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return;

    if (!isSelectable(slot, true, pets.length)) setSelectedTime("");
  }, [isVip, selectedTime, slots, pets.length]);

  // ✅ ทำข้อมูลให้ตรง SwimPetInfo (breed/weight เป็น optional ได้)
  const petsForPricing = useMemo(
    () =>
      pets.map((p) => ({
        breed: p.breed?.trim() || undefined,
        weightKg: typeof p.weightKg === "number" && Number.isFinite(p.weightKg) ? p.weightKg : undefined,
      })),
    [pets],
  );

  // ✅ คิดเงินตาม breed/weight (VIP ไม่บวกเพิ่มตาม logic คุณ)
  const total: number = useMemo(() => {
    return swimTotalPrice(petsForPricing);
  }, [petsForPricing]);

  const canNext = useMemo(() => {
    if (!dateISO || !selectedTime) return false;
    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return false;
    return isSelectable(slot, isVip, pets.length);
  }, [dateISO, selectedTime, isVip, slots, pets.length]);

  const priceBreakdown = pets.map((p) => ({
    id: p.id,
    name: p.name,
    breed: p.breed,
    price: swimPricePerDog({
      breed: p.breed,
      weightKg: p.weightKg,
    }),
  }));

  const [note, setNote] = useState<string>("");
  const [noteOpen, setNoteOpen] = useState<boolean>(false);


  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">สระว่ายน้ำ</h2>
        <p className="text-sm text-black/50">เลือกวัน → เลือกรอบ → VIP/เจ้าของลงเล่น</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-gray-900">วันที่</p>
        <input
          type="date"
          value={dateISO}
           min={todayISO()} 
          onChange={(e) => setDateISO(e.target.value)}
          className="appearance-none h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]"
        />
      </div>

      <div className="rounded-2xl ring-1 ring-black/10 bg-white p-4 space-y-3">
        <p className="text-sm font-extrabold text-gray-900">เลือกรอบ</p>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((s) => {
            const disabled = !isSelectable(s, isVip, pets.length);
            const active = selectedTime === s.time;

            return (
              <button
                key={s.time}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedTime(s.time)}
                className={[
                  "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
                  disabled
                    ? "bg-gray-200 ring-gray-200 text-black/30 cursor-not-allowed"
                    : active
                      ? "bg-[#F7F4E8] ring-[#F0A23A] text-black"
                      : "bg-white ring-black/10 text-black/60",
                ].join(" ")}
              >
                {s.time}
                <div className="text-[10px] font-semibold text-black/40 mt-1">
                  {s.booked}/{s.capacity}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsVip(e.target.checked)}
            className="mt-1 h-5 w-5"
          />
          <div>
            <p className="text-sm font-extrabold text-gray-900">เหมารอบ (VIP)</p>
            <p className="text-xs text-black/45">* VIP เลือกได้เฉพาะรอบที่ “ว่างสนิท”</p>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <p className="text-sm font-extrabold text-gray-900">เจ้าของลงเล่นกับสุนัข</p>
            <p className="text-xs text-black/45">ฟรี (เลือกได้)</p>
          </div>

          <button
            type="button"
            onClick={() => setOwnerPlay((v) => !v)}
            className={[
              "relative inline-flex h-9 w-16 items-center rounded-full transition",
              ownerPlay ? "bg-emerald-500" : "bg-gray-200",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition",
                ownerPlay ? "translate-x-8" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        </div>
      </div>
      {selectedTime && (
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-gray-900">สรุป</p>
          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3 shadow-sm mt-2">
            <p className="text-sm font-extrabold text-gray-900">รายละเอียดราคา</p>

            {/* รายตัว */}
            <div className="space-y-2">
              {priceBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="text-black/70">
                    <span className="font-semibold text-gray-900">
                      {item.name}
                    </span>{" "}
                    <span className="text-xs text-black/45">
                      ({item.breed || "-"})
                    </span>
                  </div>

                  <span className="font-extrabold text-gray-900">
                    {item.price.toLocaleString()} บาท
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-black/10" />

            {/* Summary */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">รวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-[#F0A23A]">
                {total.toLocaleString()} บาท
              </span>
            </div>
          </div>

        </div>
      )
      }

      {/* ✅ Note (toggle box) */}
      <div className="rounded-2xl bg-white ring-1 ring-black/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 bg-white hover:bg-black/[0.03] transition"
        >
          <div className="text-left">
            <p className="text-sm font-extrabold text-gray-900">แนบหมายเหตุ</p>
            <p className="text-xs text-black/45">
              {note?.trim()
                ? `มีข้อความแล้ว (${note.trim().length} ตัวอักษร)`
                : "เพิ่มข้อความประกอบรายการ (ถ้ามี)"}
            </p>
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
              noteOpen ? "bg-[#F7F4E8] text-[#B25A00] ring-[#F0A23A]/40" : "bg-black/[0.04] text-black/60 ring-black/10",
            ].join(" ")}
          >
            {noteOpen ? "ซ่อน" : "เปิด"}
          </span>
        </button>

        {noteOpen ? (
          <div className="px-4 pb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="เช่น น้องกลัวน้ำ / ขอให้ใช้ชูชีพ / แพ้น้ำหอม ฯลฯ"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-black/45">* หมายเหตุนี้เป็นข้อความภายในรายการจอง</p>

              {note.trim() ? (
                <button
                  type="button"
                  onClick={() => setNote("")}
                  className="text-xs font-extrabold text-rose-600 hover:underline"
                >
                  ล้างข้อความ
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
        >
          กลับ
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() =>
            onNext({
              serviceType: "swimming",
              date: dateISO,
              time: selectedTime,
              isVip,
              ownerPlay,
              total, 
              note: note.trim() || undefined,
            })
          }
          className={[
            "w-full rounded-2xl py-3 font-extrabold text-white active:scale-[0.99] transition",
            canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          ต่อไป
        </button>
      </div>

      {!canNext ? (
        <p className="text-xs text-rose-600 text-center">
          กรุณาเลือกวัน + รอบ ให้ครบ (VIP ต้องว่างสนิท)
        </p>
      ) : null}
    </section>
  );
}
