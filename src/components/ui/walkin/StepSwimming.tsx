"use client";

import { PetPicked, ReservationConfirmLine, SwimmingDraft } from "@/lib/walkin/walkin/types.mock";
import React, { useEffect, useMemo, useState } from "react";

type SwimmingSlot = {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  statusLabel: string;
  isFull: boolean;
  isEmpty: boolean;
  /** If true, this hour slot already has a reservation on the selected day (close only these hours). */
  isEverReserved: boolean;
  sizeBooked: { large: number; small: number };
};

type SwimmingPackagePricingResponse = {
  offerType: string;
  date: string;
  petsSummary: { total: number; small: number; large: number; label: string };
  rules: { ownerPlayHint: string; slotHint: string };
  slots: SwimmingSlot[];
  pricing: {
    currency: string;
    items: Array<{ dogId: number; name: string; breed: string; price: number }>;
    total: number;
  };
  lines: ReservationConfirmLine[];
};

function todayISO() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSlotSelectable(slot: SwimmingSlot, isVip: boolean, petCount: number) {
  // Requirement: close only the hour slots that were already reserved on that day.
  if (slot.isEverReserved === true) return false;
  if (isVip) return slot.isEmpty;
  return !slot.isFull && slot.remaining >= petCount;
}

export type SwimmingFormState = {
  dateISO: string;
  selectedTime: string;
  isVip: boolean;
  ownerPlay: boolean;
  note: string;
};

export default function StepSwimming(props: {
  pets: PetPicked[];
  form: SwimmingFormState;
  setForm: React.Dispatch<React.SetStateAction<SwimmingFormState>>;
  onBack: () => void;
  onNext: (draft: SwimmingDraft) => void;
}) {
  const { pets, form, setForm, onBack, onNext } = props;

  const dateISO = form.dateISO;
  const setDateISO = (v: string) => setForm((p) => ({ ...p, dateISO: v }));
  const selectedTime = form.selectedTime;
  const setSelectedTime = (v: string) => setForm((p) => ({ ...p, selectedTime: v }));
  const isVip = form.isVip;
  const setIsVip = (v: boolean) => setForm((p) => ({ ...p, isVip: v }));
  const ownerPlay = form.ownerPlay;
  const setOwnerPlay = (v: boolean) => setForm((p) => ({ ...p, ownerPlay: v }));
  const note = form.note;
  const setNote = (v: string) => setForm((p) => ({ ...p, note: v }));

  const [swimmingResult, setSwimmingResult] = useState<SwimmingPackagePricingResponse | null>(null);
  const [swimmingLoading, setSwimmingLoading] = useState(false);
  const [swimmingError, setSwimmingError] = useState<string | null>(null);

  const canFetchSwimming = !!dateISO && pets.length > 0;

  const handleDateChange = (value: string) => {
    if (!value) {
      setDateISO("");
      return;
    }
    const today = todayISO();
    setDateISO(value < today ? today : value);
  };

  useEffect(() => {
    if (!canFetchSwimming) {
      setSwimmingResult(null);
      setSwimmingError(null);
      return;
    }
    const dogIds = pets.map((p) => p.id).join(",");
    const pkg = isVip ? "vip" : "standard";

    setSwimmingLoading(true);
    setSwimmingError(null);
    const url = `/api/offering/swimming/package-pricing?${new URLSearchParams({
      dogIds,
      offeringType: "swimming",
      date: dateISO,
      package: pkg,
    }).toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error ?? d.detail ?? res.statusText)));
        return res.json();
      })
      .then((data: SwimmingPackagePricingResponse) => {
        setSwimmingResult(data);
      })
      .catch((e: Error) => {
        setSwimmingResult(null);
        setSwimmingError(e.message ?? "ไม่สามารถโหลดรอบและราคาได้");
      })
      .finally(() => {
        setSwimmingLoading(false);
      });
  }, [canFetchSwimming, dateISO, pets, isVip]);

  const slots: SwimmingSlot[] = swimmingResult?.slots ?? [];

  // เปลี่ยนวันแล้วล้างเวลาที่เลือก
  useEffect(() => {
    setSelectedTime("");
  }, [dateISO]);

  // If the selected time becomes not selectable (VIP toggle, reserved hours, capacity, etc.) -> reset
  useEffect(() => {
    if (!selectedTime) return;
    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return;
    if (!isSlotSelectable(slot, isVip, pets.length)) setSelectedTime("");
  }, [isVip, selectedTime, slots, pets.length]);

  const total = swimmingResult?.pricing?.total ?? 0;
  const priceBreakdown = swimmingResult?.pricing?.items ?? [];
  // const petsSummaryLabel = swimmingResult?.petsSummary?.label ?? `สุนัขของฉัน เล็ก ${pets.filter((p) => p.size === "small").length} • ใหญ่ ${pets.filter((p) => p.size === "large").length}`;
  const slotHint = swimmingResult?.rules?.slotHint ?? "เลือกรอบที่รองรับขนาดใกล้เคียงกับน้อง ๆ เพื่อป้องกันอุบัติเหตุ";
  const ownerPlayHint = swimmingResult?.rules?.ownerPlayHint ?? "ฟรี (เลือกได้)";

  const selectedSlot = selectedTime ? slots.find((s) => s.time === selectedTime) : undefined;
  const selectedSlotIsEverReserved = selectedSlot?.isEverReserved === true;

  const canNext = useMemo(() => {
    if (!dateISO || !selectedTime || !swimmingResult) return false;
    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot) return false;
    return isSlotSelectable(slot, isVip, pets.length);
  }, [dateISO, selectedTime, isVip, slots, pets.length, swimmingResult]);

  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">สระว่ายน้ำ</h2>
        <p className="text-sm text-black/50">เลือกวัน → เลือกรอบ</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-gray-900">วันที่</p>
        <input
          type="date"
          value={dateISO}
          min={todayISO()}
          onChange={(e) => handleDateChange(e.target.value)}
          className="appearance-none h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]"
        />
      </div>
      <div className="rounded-2xl ring-1 ring-black/10 bg-white p-4 space-y-3">
      <div>
            <p className="text-sm font-extrabold text-gray-900">เลือกรอบ</p>
            <p className="text-xs text-black/45 mt-0.5">
              {slotHint}
            </p>
          </div>
        <div className="flex justify-end  gap-3">
          {/* <div className="shrink-0 rounded-2xl bg-black/[0.03] ring-1 ring-black/5 px-3 py-2 text-xs font-extrabold text-black/60">
            {petsSummaryLabel}
          </div> */}
        </div>

        {swimmingLoading ? (
          <p className="text-sm text-black/50 py-4">กำลังโหลดรอบ...</p>
        ) : swimmingError ? (
          <p className="text-sm text-rose-600 py-4">{swimmingError}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-black/50 py-4">ไม่มีรอบในวันนี้</p>
        ) : (
        <div className="grid grid-cols-3 gap-3">
          {slots.map((s) => {
            const disabled = !isSlotSelectable(s, isVip, pets.length);
            const active = selectedTime === s.time;

            return (
              <div key={s.time} className="flex flex-col items-center justify-center h-full">
                <button
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
                  <div className={s.isFull ? "text-black/45" : "text-black/70"}>{s.statusLabel}</div>
                  {s.isEverReserved ? (
                    <div className="text-black/45">เคยจองแล้ว</div>
                  ) : null}
                  {s.isEverReserved ? (
                    <div className="text-black/45">จองแล้ว (ปิดรอบ)</div>
                  ) : (
                    <div className="text-black/45">จองแล้ว {s.booked}/{s.capacity}</div>
                  )}
                  <div className="text-black/45">พันธุ์ใหญ่: {s.sizeBooked.large}</div>
                  <div className="text-black/45">พันธุ์เล็ก: {s.sizeBooked.small}</div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsVip(e.target.checked)}
            className="mt-1 h-5 w-5"
          />
          <div>
            <p className="text-sm font-extrabold text-gray-900">เหมารอบ (VIP)</p>
            <p className="text-xs text-black/45">* VIP เลือกได้เฉพาะรอบที่ “ว่างสนิท”</p>
            <p className="text-xs text-black/45">* เฉพาะวันธรรมดา ไม่รวมวันหยุดและนักขัตฤกษ์</p>
          </div>
        </div> */}

        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <p className="text-sm font-extrabold text-gray-900">เจ้าของลงเล่นกับสุนัข</p>
            <p className="text-xs text-black/45">{ownerPlayHint}</p>
          </div>

          <button
            type="button"
            onClick={() => setOwnerPlay(!ownerPlay)}
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

          <p className="text-sm font-extrabold text-gray-900 mt-2">รายละเอียดราคาประมาณ</p>
          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3 shadow-sm mt-2">
            <div className="space-y-2">
              {priceBreakdown.map((item) => (
                <div key={item.dogId} className="flex items-center justify-between text-sm">
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
              <span className="text-sm font-bold text-gray-900">รวมทั้งหมด (ประมาณ)</span>
              <span className="text-lg font-extrabold text-[#F0A23A]">{total.toLocaleString()} บาท</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-black/55">
            * ราคานี้เป็นราคาโดยประมาณ ราคาจริงจะอิงจากน้ำหนักที่ชั่งที่ร้าน</p>
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
              package: isVip ? "vip" : "standard",
              lines: swimmingResult?.lines ?? [],
              pricingItems: swimmingResult?.pricing?.items ?? [],
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
        <p className="text-xs text-rose-600 text-center">
          {selectedTime && selectedSlotIsEverReserved
            ? "ไม่สามารถดำเนินการต่อได้ เนื่องจากรอบที่เลือกถูกจองไปแล้ว กรุณาเลือกรอบอื่น"
            : "กรุณาเลือกวัน + รอบ ให้ครบ "}
        </p>
      ) : null}
    </section>
  );
}