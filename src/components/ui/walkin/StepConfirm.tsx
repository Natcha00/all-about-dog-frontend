"use client";

import { swimPricePerDog } from "@/lib/walkin/swimming/swimming.price.logic";
import type { BookingDraft, CustomerDraft, PetPicked } from "@/lib/walkin/walkin/types.mock";
import React, { useMemo, useState } from "react";

/* =========================
   ✅ type guards (แก้ union access)
========================= */
function isBoardingDraft(b: BookingDraft): b is Extract<BookingDraft, { serviceType: "boarding" }> {
  return b.serviceType === "boarding";
}
function isSwimmingDraft(b: BookingDraft): b is Extract<BookingDraft, { serviceType: "swimming" }> {
  return b.serviceType === "swimming";
}

/* =========================
   boarding pricing helpers
========================= */
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
      breed: p.breed?? undefined,
      price: nights * perNight,
      meta: `${nights} คืน • ${perNight}/คืน`,
    });
  });

  largePets.forEach((p, i) => {
    const perNight = i === 0 ? 600 : 510;
    lines.push({
      id: p.id,
      name: p.name,
      breed: p.breed?? undefined,
      price: nights * perNight,
      meta: `${nights} คืน • ${perNight}/คืน`,
    });
  });

  return lines;
}

/* =========================
   ✅ room assignment helpers (เหมือนหน้า detail)
========================= */
type RoomType = "SMALL" | "LARGE" | "VIP";
type RoomAssignment = {
  type: RoomType;
  roomNo: number;
  pets: Array<{ id: number; name: string; breed?: string | null; size?: "small" | "large" }>;
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildRoomAssignments(params: {
  pets: Array<{ id: number; name: string; size: "small" | "large"; breed?: string | null }>;
  plan: 1 | 2 | 3;
}): RoomAssignment[] {
  const { pets, plan } = params;
  if (!pets.length) return [];

  if (plan === 3) {
    return [
      {
        type: "VIP",
        roomNo: 1,
        pets: pets.map((p) => ({ ...p })),
      },
    ];
  }

  const small = pets.filter((p) => p.size === "small");
  const large = pets.filter((p) => p.size === "large");

  if (plan === 1) {
    const smallRooms: RoomAssignment[] = small.map((p, idx) => ({
      type: "SMALL",
      roomNo: idx + 1,
      pets: [{ ...p }],
    }));
    const largeRooms: RoomAssignment[] = large.map((p, idx) => ({
      type: "LARGE",
      roomNo: idx + 1,
      pets: [{ ...p }],
    }));
    return [...smallRooms, ...largeRooms];
  }

  // plan 2: small 3/room, large 2/room
  const smallRooms: RoomAssignment[] = chunk(small, 3).map((grp, idx) => ({
    type: "SMALL",
    roomNo: idx + 1,
    pets: grp.map((p) => ({ ...p })),
  }));

  const largeRooms: RoomAssignment[] = chunk(large, 2).map((grp, idx) => ({
    type: "LARGE",
    roomNo: idx + 1,
    pets: grp.map((p) => ({ ...p })),
  }));

  return [...smallRooms, ...largeRooms];
}

function planLabel(plan: 1 | 2 | 3) {
  if (plan === 1) return "แบบ 1 : มาตรฐาน";
  if (plan === 2) return "แบบ 2 : นอนด้วยกัน";
  return "แบบ 3 : VIP บ้านเดี่ยว";
}

function roomTypeLabel(type: RoomType) {
  if (type === "SMALL") return "ตึกหมาเล็ก";
  if (type === "LARGE") return "ตึกหมาใหญ่";
  return "VIP";
}

/* =========================
   misc UI helpers
========================= */
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

/* ✅ Collapse section (เล็ก ๆ ไม่รก) */
function Collapsible({
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  title: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/70 ring-1 ring-black/5 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 active:scale-[0.99] transition"
        aria-expanded={open}
      >
        <div className="text-left">
          <p className="text-sm font-extrabold text-gray-900">{title}</p>
          {hint ? <p className="text-xs text-black/45 mt-0.5">{hint}</p> : null}
        </div>

        <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-extrabold text-black/70 ring-1 ring-black/10">
          {open ? "ซ่อน" : "ดู"}
        </span>
      </button>

      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
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
  const { pets, booking, onBack, onConfirm } = props;

  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ ซ่อนเฉพาะ 2 ส่วนใหญ่
  const [openRooms, setOpenRooms] = useState(false);
  const [openPriceBreakdown, setOpenPriceBreakdown] = useState(false);

  const title = isBoardingDraft(booking) ? "ยืนยันการจองฝากเลี้ยง" : "ยืนยันการจองสระว่ายน้ำ";

  const ref = useMemo(() => {
    return isBoardingDraft(booking) ? makeRef("BD") : makeRef("SW");
  }, [booking]);

  const total = booking.total ?? 0;

  // ✅ nights (เฉพาะ boarding) — end เป็นวันออกแบบ exclusive
  const nights = useMemo(() => {
    if (!isBoardingDraft(booking)) return 0;

    const startMs = new Date(`${booking.start}T00:00:00`).getTime();
    const endMs = new Date(`${booking.end}T00:00:00`).getTime();
    const diffDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [booking]);

  // ✅ normalize pets สำหรับจัดห้อง
  const pickedPets = useMemo(() => {
    return (pets ?? []).map((p) => ({
      id: Number(p.id),
      name: String(p.name ?? `ID:${p.id}`),
      size: (p.size === "large" ? "large" : "small") as "small" | "large",
      breed: (p.breed ?? null) as string | null,
    }));
  }, [pets]);

  // ✅ room assignments เฉพาะ boarding
  const roomAssignments = useMemo<RoomAssignment[]>(() => {
    if (!isBoardingDraft(booking)) return [];
    if (!pickedPets.length) return [];
    return buildRoomAssignments({ pets: pickedPets, plan: booking.plan });
  }, [booking, pickedPets]);

  // ✅ breakdown boarding
  const boardingBreakdown = useMemo(() => {
    if (!isBoardingDraft(booking)) return [];
    return calcBoardingPetLines(pets, booking.plan, nights || 1);
  }, [booking, pets, nights]);

  // ✅ breakdown swimming
  const swimBreakdown = useMemo(() => {
    if (!isSwimmingDraft(booking)) return [];
    return pets.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      price: swimPricePerDog({ breed: p.breed?? undefined, weightKg: p.weightKg?? undefined }),
    }));
  }, [booking, pets]);

  const breakdownToShow = isSwimmingDraft(booking) ? swimBreakdown : boardingBreakdown;

  // ✅ service rows: “แสดงเลย” แต่ลดจำนวนช่องให้เหลือจำเป็น
  const serviceRows = useMemo(() => {
    if (isBoardingDraft(booking)) {
      return [
        { label: "รายการจอง", value: ref },
        { label: "ประเภทบริการ", value: "ฝากเลี้ยง" },
        { label: "วันที่เข้า", value: booking.start || "-" },
        { label: "วันที่ออก", value: booking.end || "-" },
        { label: "แพ็กเกจ", value: planLabel(booking.plan) },
        { label: "จำนวนคืน", value: `${nights || 1} คืน` },
      ];
    }

    return [
      { label: "รายการจอง", value: ref },
      { label: "ประเภทบริการ", value: "ว่ายน้ำ" },
      { label: "วันที่ใช้บริการ", value: booking.date || "-" },
      { label: "รอบเวลา", value: booking.time || "-" },
      {
        label: "ตัวเลือก",
        value: (
          <div className="flex items-center gap-2 justify-end">
            <Pill>{booking.isVip ? "VIP" : "-"}</Pill>
            <Pill>{booking.ownerPlay ? "เจ้าของลงเล่น" : "เจ้าของไม่ลงเล่น"}</Pill>
          </div>
        ),
      },
    ];
  }, [booking, ref, nights]);

  const noteText = (booking.customerNote ?? "").trim();

  // ✅ pets inline (สรุปเป็นบรรทัดเดียว)
  const petsInline = useMemo(() => (pets ?? []).map((p) => p.name).filter(Boolean).join(", ") || "-", [pets]);

  const [openNote, setOpenNote] = useState(false);
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-black/45">{isBoardingDraft(booking) ? "บริการฝากเลี้ยง" : "บริการสระว่ายน้ำ"}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs text-black/45">ตรวจสอบข้อมูลก่อนกดยืนยัน</p>
      </div>

      {/* ✅ Card: รายละเอียด (แสดงเลย แต่สั้นลง) */}
      <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <p className="text-lg font-extrabold text-gray-900">รายละเอียด</p>
          <p className="text-xs text-black/45 mt-1 truncate">{petsInline}</p>
        </div>

        <div className="px-5 divide-y divide-black/5">
          {serviceRows.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </div>

      {/* ✅ Card: ราคา (โฟกัสราคารวม + ซ่อนเฉพาะส่วนยาว) */}
      <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-black/45">ราคารวม</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{total.toLocaleString()} บาท</p>
          </div>
        </div>

        {/* ✅ รูปแบบเข้าพัก: ซ่อน (เฉพาะ boarding) */}
        {isBoardingDraft(booking) && roomAssignments.length > 0 ? (
          <div className="mt-4">
            <Collapsible
              title="รูปแบบเข้าพัก"
              hint={`${planLabel(booking.plan)} • ${roomAssignments.length} ห้อง`}
              open={openRooms}
              onToggle={() => setOpenRooms((v) => !v)}
            >
              <div className="space-y-3">
                {roomAssignments.map((rm) => (
                  <div key={`${rm.type}-${rm.roomNo}`} className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-extrabold text-gray-900">
                        {roomTypeLabel(rm.type)} • ห้อง {rm.roomNo}
                      </p>
                      <p className="text-xs font-bold text-black/45">{rm.pets.length} ตัว</p>
                    </div>

                    {/* ✅ รายชื่อสัตว์แบบบรรทัดเดียว */}
                    <p className="mt-2 text-sm text-black/70">{rm.pets.map((p) => p.name).join(", ") || "-"}</p>
                  </div>
                ))}
                <p className="text-[11px] text-black/40">* เป็นการจัดห้องแบบแนะนำอัตโนมัติ</p>
              </div>
            </Collapsible>
          </div>
        ) : null}

        {/* ✅ รายละเอียดราคา: ซ่อน (default ปิด) */}
        {breakdownToShow.length > 0 ? (
          <div className="mt-3">
            <Collapsible
              title="รายละเอียดราคา"
              hint={isBoardingDraft(booking) ? `${nights || 1} คืน` : "ต่อรอบบริการ"}
              open={openPriceBreakdown}
              onToggle={() => setOpenPriceBreakdown((v) => !v)}
            >
              <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
                <div className="space-y-3">
                  {breakdownToShow.map((x: any) => (
                    <div key={x.id} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900 truncate">
                          {x.name}{" "}
                          <span className="text-xs font-semibold text-black/45">({x.breed || "-"})</span>
                        </p>
                        {"meta" in x && x.meta ? <p className="mt-1 text-[11px] text-black/45">{x.meta}</p> : null}
                      </div>

                      <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap">
                        {x.price.toLocaleString()} บาท
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Collapsible>
          </div>
        ) : null}
      </div>

      {/* Note */}
      {noteText ? (
  <div className="mt-4 rounded-2xl bg-white/70 ring-1 ring-black/5 overflow-hidden">
    <button
      type="button"
      onClick={() => setOpenNote((v) => !v)}
      className="w-full flex items-center justify-between px-4 py-4 active:scale-[0.99] transition"
      aria-expanded={openNote}
    >
      <div className="text-left">
        <p className="text-sm font-extrabold text-gray-900">หมายเหตุ</p>
        <p className="text-xs text-black/45 mt-0.5">
          ข้อความจากลูกค้า
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-extrabold text-black/70 ring-1 ring-black/10">
        {openNote ? "ปิด" : "เปิด"}
      </span>
    </button>

    {openNote ? (
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          <p className="text-sm text-black/70 whitespace-pre-wrap">
            {noteText}
          </p>
        </div>
      </div>
    ) : null}
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

      {/* Confirm Modal (คงเดิม) */}
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
              <div className="rounded-2xl bg-[#fff7ea]/60 ring-1 ring-black/5 p-4">
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