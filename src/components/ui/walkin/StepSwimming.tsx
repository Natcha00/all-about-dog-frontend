"use client";

import { swimPricePerDog, swimTotalPrice } from "@/lib/walkin/swimming/swimming.price.logic";
import { PetPicked, SwimmingDraft } from "@/lib/walkin/walkin/types.mock";
import React, { useEffect, useMemo, useState } from "react";

/**
 * ✅ Slot แบบแยกขนาดเพื่อกัน "กัดกัน"
 * capacity: โควต้าต่อรอบแยก small/large
 * booked: จำนวนที่ถูกจองแล้วแยก small/large
 */
type Slot = {
  time: string;
  capacity: { small: number; large: number };
  booked: { small: number; large: number };
};

function todayISO() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function countPicked(pets: PetPicked[]) {
  return pets.reduce(
    (acc, p) => {
      if (p.size === "large") acc.large += 1;
      else acc.small += 1;
      return acc;
    },
    { small: 0, large: 0 },
  );
}

/**
 * ✅ เลือกได้ไหม
 * - VIP: ต้องว่างสนิททั้ง small/large และต้องพอจุตามขนาด
 * - ปกติ: ต้องมีที่ว่างพอตามขนาด
 */
function isSelectable(slot: Slot, isVip: boolean, pets: PetPicked[]) {
  const need = countPicked(pets);

  const totalCap = slot.capacity.small + slot.capacity.large;
  const totalBooked = slot.booked.small + slot.booked.large;

  // ถ้าเลือกมาเกินความจุรวม (กันเคสแปลก ๆ)
  if (need.small + need.large > totalCap) return false;

  if (isVip) {
    const empty = totalBooked === 0;
    const enough =
      need.small <= slot.capacity.small &&
      need.large <= slot.capacity.large;
    return empty && enough;
  }

  const availSmall = slot.capacity.small - slot.booked.small;
  const availLarge = slot.capacity.large - slot.booked.large;

  return need.small <= availSmall && need.large <= availLarge;
}

/**
 * ✅ mock slots by date
 * (ทำให้เลขใน UI สื่อว่า: จองแล้ว x/y + แยก small/large)
 */
const SLOTS_BY_DATE: Record<string, Slot[]> = {
  "2026-03-20": [
    { time: "10:00", capacity: { small: 3, large: 2 }, booked: { small: 2, large: 0 } }, // จองแล้ว 2/5 (เล็ก2 ใหญ่0)
    { time: "11:00", capacity: { small: 2, large: 3 }, booked: { small: 0, large: 3 } }, // จองแล้ว 3/5 (เล็ก0 ใหญ่3)
    { time: "12:00", capacity: { small: 3, large: 2 }, booked: { small: 0, large: 0 } }, // ว่าง
    { time: "13:00", capacity: { small: 3, large: 2 }, booked: { small: 0, large: 2 } }, // จองแล้ว 2/5 (เล็ก0 ใหญ่2)
    { time: "14:00", capacity: { small: 2, large: 3 }, booked: { small: 2, large: 3 } }, // เต็ม 5/5
    { time: "15:00", capacity: { small: 3, large: 2 }, booked: { small: 0, large: 3 } }, // (ถ้าเกิน capacity.large ให้ปรับ)
    { time: "16:00", capacity: { small: 2, large: 3 }, booked: { small: 0, large: 4 } }, // (ตัวอย่างเลข—ควรไม่เกิน capacity.large)
    { time: "17:00", capacity: { small: 4, large: 1 }, booked: { small: 1, large: 0 } },
  ],
  "2026-03-21": [
    { time: "10:00", capacity: { small: 4, large: 2 }, booked: { small: 1, large: 0 } },
    { time: "11:00", capacity: { small: 4, large: 2 }, booked: { small: 4, large: 2 } }, // เต็ม
    { time: "12:00", capacity: { small: 4, large: 2 }, booked: { small: 1, large: 1 } },
    { time: "13:00", capacity: { small: 4, large: 2 }, booked: { small: 2, large: 2 } },
    { time: "14:00", capacity: { small: 4, large: 2 }, booked: { small: 0, large: 0 } }, // ว่าง
    { time: "15:00", capacity: { small: 4, large: 2 }, booked: { small: 3, large: 0 } },
  ],
  "2026-03-22": [
    { time: "10:00", capacity: { small: 2, large: 2 }, booked: { small: 2, large: 2 } }, // เต็ม
    { time: "11:00", capacity: { small: 2, large: 2 }, booked: { small: 1, large: 1 } },
    { time: "12:00", capacity: { small: 2, large: 2 }, booked: { small: 1, large: 0 } },
    { time: "13:00", capacity: { small: 2, large: 2 }, booked: { small: 0, large: 0 } },
    { time: "14:00", capacity: { small: 2, large: 2 }, booked: { small: 1, large: 2 } },
    { time: "15:00", capacity: { small: 2, large: 2 }, booked: { small: 1, large: 0 } },
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

    if (!isSelectable(slot, true, pets)) setSelectedTime("");
  }, [isVip, selectedTime, slots, pets]);

  // ✅ ทำข้อมูลให้ตรง SwimPetInfo (breed/weight เป็น optional ได้)
  const petsForPricing = useMemo(
    () =>
      pets.map((p) => ({
        breed: p.breed?.trim() || undefined,
        weightKg: typeof p.weightKg === "number" && Number.isFinite(p.weightKg) ? p.weightKg : undefined,
      })),
    [pets],
  );

  // ✅ คิดเงินตาม breed/weight
  const total: number = useMemo(() => {
    return swimTotalPrice(petsForPricing);
  }, [petsForPricing]);

  const canNext = useMemo(() => {
    if (!dateISO || !selectedTime) return false;
    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return false;
    return isSelectable(slot, isVip, pets);
  }, [dateISO, selectedTime, isVip, slots, pets]);

  const priceBreakdown = useMemo(() => {
    return pets.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: swimPricePerDog({breed: p.breed ?? undefined, weightKg: p.weightKg ?? undefined, }),
    }));
  }, [
    pets.map(p => `${p.id}|${p.breed ?? ""}|${p.weightKg ?? ""}`).join("::")
  ]);

  const [note, setNote] = useState<string>("");
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  const need = useMemo(() => countPicked(pets), [pets]);

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-gray-900">เลือกรอบ</p>
            <p className="text-xs text-black/45 mt-0.5">
              เลือกรอบที่รองรับขนาดใกล้เคียงกับน้อง ๆ เพื่อป้องกันอุบัติเหตุ
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-black/[0.03] ring-1 ring-black/5 px-3 py-2 text-xs font-extrabold text-black/60">
            สุนัขของฉัน เล็ก {need.small} • ใหญ่ {need.large}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {slots.map((s) => {
            const disabled = !isSelectable(s, isVip, pets);
            const active = selectedTime === s.time;

            const totalCap = s.capacity.small + s.capacity.large;
            const totalBooked = s.booked.small + s.booked.large;
            const remaining = Math.max(0, totalCap - totalBooked);

            const statusText =
              totalBooked >= totalCap ? "เต็ม" : totalBooked === 0 ? "ว่าง" : `เหลืออีก ${remaining} ที่`;

            return (
              <div className="flex flex-col items-center justify-center h-full">
                <button
                  key={s.time}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedTime(s.time)}
                  className={[
                    "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99] text-left px-3",
                    disabled
                      ? "bg-gray-200 ring-gray-200 text-black/30 cursor-not-allowed"
                      : active
                        ? "bg-[#fff7ea] ring-[#F0A23A] text-black"
                        : "bg-white ring-black/10 text-black/70 hover:bg-black/[0.02]",
                  ].join(" ")}
                >
                  <div className="text-center">{s.time}</div>
                </button>
                <div className="mt-2 w-full text-center text-[11px] font-semibold leading-4">
                  <div className={totalBooked >= totalCap ? "text-black/45" : "text-black/70"}>{statusText}</div>
                  <div className="text-black/45">จองแล้ว {totalBooked}/{totalCap}</div>
                  <div className="text-black/45">พันธุ์ใหญ่: {s.booked.large}</div>
                  <div className="text-black/45">พันธุ์เล็ก: {s.booked.small}</div>
                </div>
              </div>
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

      {selectedTime ? (
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-gray-900">สรุป</p>

          <p className="text-sm font-extrabold text-gray-900 mt-2">รายละเอียดราคา</p>
          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3 shadow-sm mt-2">
            <div className="space-y-2">
              {priceBreakdown.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="text-black/70">
                    <span className="font-semibold text-gray-900">{item.name}</span>{" "}
                    <span className="text-xs text-black/45">({item.breed || "-"})</span>
                  </div>

                  <span className="font-extrabold text-gray-900">{item.price.toLocaleString()} บาท</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-black/10" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">รวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-[#F0A23A]">{total.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      ) : null}

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
              {note?.trim() ? `มีข้อความแล้ว (${note.trim().length} ตัวอักษร)` : "เพิ่มข้อความประกอบรายการ (ถ้ามี)"}
            </p>
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
              noteOpen ? "bg-[#fff7ea] text-[#B25A00] ring-[#F0A23A]/40" : "bg-black/[0.04] text-black/60 ring-black/10",
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
                <button type="button" onClick={() => setNote("")} className="text-xs font-extrabold text-rose-600 hover:underline">
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
              customerNote: note.trim() || undefined,
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
        <p className="text-xs text-rose-600 text-center">กรุณาเลือกวัน + รอบ ให้ครบ (VIP ต้องว่างสนิท และต้องมีโควต้าตามขนาด)</p>
      ) : null}
    </section>
  );
}