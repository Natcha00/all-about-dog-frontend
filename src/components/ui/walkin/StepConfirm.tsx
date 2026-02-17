"use client";

import { swimPricePerDog } from "@/lib/walkin/swimming/swimming.price.logic";
import { BookingDraft, CustomerDraft, PetPicked } from "@/lib/walkin/walkin/types.mock";
import React, { useMemo, useState } from "react";
function calcBoardingPetLines(pets: PetPicked[], plan: 1 | 2 | 3, nights: number) {
  if (!pets.length || !nights) return [];

  // VIP: ตัวแรก 1500/คืน ตัวถัดไป 500/คืน
  if (plan === 3) {
    return pets.map((p, idx) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: nights * (idx === 0 ? 1500 : 500),
      meta: `${nights} คืน • VIP`,
    }));
  }

  // Plan 1: คิดตาม size
  if (plan === 1) {
    return pets.map((p) => {
      const perNight = p.size === "small" ? 450 : 600;
      return {
        id: p.id,
        name: p.name,
        breed: p.breed,
        price: nights * perNight,
        meta: `${nights} คืน • ${perNight}/คืน`,
      };
    });
  }

  // Plan 2: นอนด้วยกัน (ตัวแรกเต็ม ตัวถัดไปลด)
  const smallPets = pets.filter((p) => p.size === "small");
  const largePets = pets.filter((p) => p.size === "large");

  const lines: Array<{ id: number; name: string; breed?: string; price: number; meta: string }> = [];

  smallPets.forEach((p, i) => {
    const perNight = i === 0 ? 450 : 380;
    lines.push({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: nights * perNight,
      meta: `${nights} คืน • ${perNight}/คืน`,
    });
  });

  largePets.forEach((p, i) => {
    const perNight = i === 0 ? 600 : 510;
    lines.push({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: nights * perNight,
      meta: `${nights} คืน • ${perNight}/คืน`,
    });
  });

  return lines;
}

function makeRef(prefix: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${prefix}${yyyy}${mm}${dd}-${rand}`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <p className="text-sm font-semibold text-black/55">{label}</p>
      <div className="text-sm font-extrabold text-gray-900 text-right">{value}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1 text-xs font-extrabold text-black/70 ring-1 ring-black/10">
      {children}
    </span>
  );
}

export default function StepConfirm(props: {
  customer: CustomerDraft;
  customerId: string;
  pets: PetPicked[];
  booking: BookingDraft;
  onBack: () => void;
  onConfirm: (ref: string) => void;
}) {
  const { customer, customerId, pets, booking, onBack, onConfirm } = props;

  const [showConfirm, setShowConfirm] = useState(false);

  const title =
    booking.serviceType === "boarding" ? "ยืนยันการจองฝากเลี้ยง" : "ยืนยันการจองสระว่ายน้ำ";

  const ref = useMemo(() => {
    return booking.serviceType === "boarding" ? makeRef("BD") : makeRef("SW");
  }, [booking.serviceType]);

  const total = booking.total ?? 0;
  // ✅ breakdown boarding
  const boardingBreakdown = useMemo(() => {
    if (booking.serviceType !== "boarding") return [];

    // ต้องมี nights เพื่อคิดแบบต่อคืน
    const nights =
      booking.start && booking.end
        ? Math.max(
          1,
          Math.ceil(
            (new Date(`${booking.end}T00:00:00`).getTime() -
              new Date(`${booking.start}T00:00:00`).getTime()) /
            (1000 * 60 * 60 * 24)
          )
        )
        : 1;

    return calcBoardingPetLines(pets, booking.plan, nights);
  }, [booking, pets]);

  // ✅ breakdown เฉพาะสระ 
  const swimBreakdown = useMemo(() => {
    if (booking.serviceType !== "swimming") return [];
    return pets.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: swimPricePerDog({ breed: p.breed, weightKg: p.weightKg }),
    }));
  }, [booking.serviceType, pets]);
  const breakdownToShow = booking.serviceType === "swimming" ? swimBreakdown : boardingBreakdown;

  const serviceRows = useMemo(() => {
    if (booking.serviceType === "boarding") {
      const planLabel =
        booking.plan === 2 ? "แบบ 2 : นอนด้วยกัน" : booking.plan === 3 ? "แบบ 3 : VIP" : "แบบ 1 : มาตรฐาน";

      return [
        { label: "รายการจอง", value: ref },
        { label: "วันที่เข้า", value: booking.start || "-" },
        { label: "วันที่ออก", value: booking.end || "-" },
        { label: "เวลาเข้า", value: booking.startTime || "-" },
        { label: "เวลารับกลับ", value: booking.endTime || "-" },
        { label: "แพ็กเกจ", value: planLabel },
      ];
    }

    // swimming
    return [
      { label: "รายการจอง", value: ref },
      { label: "วันที่ใช้บริการ", value: booking.date || "-" },
      { label: "รอบเวลา", value: booking.time || "-" },
      { label: "ประเภท", value: <Pill>{booking.isVip ? "VIP" : "ปกติ"}</Pill> },
      { label: "เจ้าของลงเล่น", value: <Pill>{booking.ownerPlay ? "ใช่" : "ไม่"}</Pill> },
    ];
  }, [booking, ref]);

  const noteText = (booking as any).note?.trim() || ""; // ถ้าเพิ่ม note ใน type แล้วจะไม่ต้อง any

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-black/45">
          {booking.serviceType === "boarding" ? "บริการฝากเลี้ยง" : "บริการสระว่ายน้ำ"}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs text-black/45">ตรวจสอบข้อมูลก่อนกดยืนยัน</p>
      </div>

      {/* Card: รายละเอียด */}
      <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <p className="text-lg font-extrabold text-gray-900">รายละเอียด</p>
          <p className="text-sm text-black/45 mt-1">ตรวจสอบข้อมูลก่อนยืนยัน</p>
        </div>
        <div className="mt-4 mx-4 rounded-2xl bg-white/70 ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-gray-900">ลูกค้า</p>
          <p className="text-sm text-black/70 mt-1">
            {customer.firstName} {customer.lastName} • {customer.phone}
          </p>
          <p className="text-xs text-black/45 mt-1">customerId: {customerId}</p>
        </div>

        <div className="px-5 divide-y divide-black/5">
          {serviceRows.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </div>

      {/* Card: ราคา */}
      <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-black/45">ราคารวม</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{total.toLocaleString()} บาท</p>
            <p className="text-xs text-black/40 mt-1">* ราคารวมตามรายการที่เลือก</p>
          </div>
        </div>



        {/* breakdown เฉพาะสระ */}
        {breakdownToShow.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
            <p className="text-sm font-extrabold text-gray-900">รายละเอียดราคา</p>

            <div className="mt-3 space-y-2">
              {breakdownToShow.map((x: any) => (
                <div key={x.id} className="flex items-center justify-between text-sm">
                  <div className="text-black/70">
                    <span className="font-semibold text-gray-900">{x.name}</span>{" "}
                    <span className="text-xs text-black/45">({x.breed || "-"})</span>
                    {"meta" in x && x.meta ? (
                      <div className="text-[11px] text-black/40 mt-0.5">{x.meta}</div>
                    ) : null}
                  </div>

                  <span className="font-extrabold text-gray-900">{x.price.toLocaleString()} บาท</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </div>

      {/* Note */}
      {noteText ? (
        <div className="mt-4 rounded-2xl bg-white/70 ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-gray-900">หมายเหตุ</p>
          <p className="mt-1 text-sm text-black/70 whitespace-pre-wrap">{noteText}</p>
        </div>
      ) : null}

      {/* Actions */}
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
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-2xl bg-[#F0A23A] py-3 font-extrabold text-white active:scale-[0.99] transition"
        >
          ยืนยัน
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-black/5 bg-white/70">
              <p className="text-base font-extrabold text-gray-900">ยืนยันการทำรายการ</p>
              <p className="mt-1 text-sm text-black/55">ระบบจะบันทึกและไปหน้าสำเร็จ</p>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-2xl bg-[#F7F4E8]/60 ring-1 ring-black/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/60">ราคารวม</p>
                  <p className="text-sm font-extrabold text-black/90">{total.toLocaleString()} บาท</p>
                </div>
                <p className="mt-2 text-xs text-black/45">ref: {ref}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
                  onClick={() => setShowConfirm(false)}
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-[#F0A23A] py-3 font-extrabold text-white active:scale-[0.99] transition"
                  onClick={() => {
                    setShowConfirm(false);
                    onConfirm(ref);
                  }}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
