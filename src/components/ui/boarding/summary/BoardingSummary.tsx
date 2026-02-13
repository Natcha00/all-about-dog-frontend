"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  allocateAssignments,
  calcPricing,
  countRooms,
  DEFAULT_PRICE,
  getPlanLabel,
  Pet,
  Plan,
  PriceConfig,
} from "@/lib/boarding/boarding.logic";

type Props = {
  pets: Pet[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  nights: number;
  initialPlan?: Plan;
  priceConfig?: PriceConfig;
};

function PlanCard({
  active,
  title,
  desc,
  badge,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-w-[220px] rounded-2xl border p-4 text-left shadow-sm transition",
        active
          ? "border-[#F0A23A] bg-[#F0A23A]/15"
          : "border-gray-200 bg-white hover:bg-gray-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {badge ? (
          <span className="shrink-0 rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-gray-600">{desc}</p>
    </button>
  );
}

export default function BoardingSummary(props: Props) {
  const {
    pets,
    startDate,
    endDate,
    startTime,
    endTime,
    nights,
    initialPlan = 1,
    priceConfig = DEFAULT_PRICE,
  } = props;

  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);

  // ✅ ใช้ logic ชุดเดียว
  const assignments = useMemo(
    () => allocateAssignments(pets, plan),
    [pets, plan],
  );
  const roomsCount = useMemo(() => countRooms(assignments), [assignments]);
  const pricing = useMemo(
    () => calcPricing({ plan, nights, assignments, price: priceConfig }),
    [plan, nights, assignments, priceConfig],
  );

  // ✅ เทียบ plan 1 เพื่อหาความประหยัด (ก็ใช้ logic เดียว)
  const standardAssignments = useMemo(
    () => allocateAssignments(pets, 1),
    [pets],
  );
  const standardPricing = useMemo(
    () =>
      calcPricing({
        plan: 1,
        nights,
        assignments: standardAssignments,
        price: priceConfig,
      }),
    [nights, standardAssignments, priceConfig],
  );

  const savings = useMemo(
    () => Math.max(0, standardPricing.total - pricing.total),
    [standardPricing.total, pricing.total],
  );

  const canConfirm = pets.length > 0;

  // ✅ map id -> display name
  const petNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of pets) {
      const label = p.name?.trim() ? p.name.trim() : `ID: ${p.id}`;
      m.set(p.id, label);
    }
    return m;
  }, [pets]);

  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-8 pb-44">
      {/* Header */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">สรุปรายการฝากเลี้ยง</h1>
          <p className="mt-1 text-sm text-gray-500">
            {startDate} {startTime} → {endDate} {endTime} • {Math.max(1, nights)} คืน • {pets.length} ตัว
          </p>
        </div>
  
        {/* 1) Choose plan + Price highlight */}
        <section className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-gray-900">เลือกรูปแบบห้องพัก</p>
              <p className="text-xs text-gray-500 mt-0.5">ระบบจะจัดห้องให้ตามขนาดและแผนที่เลือก</p>
            </div>
  
            {/* Price pill */}
            <div className="shrink-0 rounded-2xl bg-[#FFF7EA] ring-1 ring-black/5 px-3 py-2 text-right">
              <p className="text-[11px] text-black/50">ราคารวม</p>
              <p className="text-base font-extrabold text-black/90">{pricing.total.toLocaleString()} บาท</p>
            </div>
          </div>
  
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            <PlanCard
              active={plan === 1}
              title="แบบ 1 : มาตรฐาน"
              desc="แยกห้อง 1 ตัว/ห้อง ตามขนาด"
              onClick={() => setPlan(1)}
            />
            <PlanCard
              active={plan === 2}
              title="แบบ 2 : นอนด้วยกัน"
              desc="รวม 2–3 ตัว/ห้อง (ขนาดเดียวกัน)"
              badge="แนะนำ"
              onClick={() => setPlan(2)}
            />
            <PlanCard
              active={plan === 3}
              title="แบบ 3 : VIP"
              desc="นอนบ้านเดียวกัน (บ้านเดี่ยว)"
              onClick={() => setPlan(3)}
            />
          </div>
  
          {/* Smart recommendation summary */}
          <div className="mt-4 rounded-2xl bg-[#E9F4F4] ring-1 ring-[#7DB7B9]/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-gray-900">แผนที่เลือก</p>
                <p className="mt-0.5 text-sm text-gray-700">{getPlanLabel(plan)}</p>
              </div>
  
              {plan !== 1 && savings > 0 ? (
                <span className="shrink-0 rounded-full bg-white/70 ring-1 ring-black/5 px-3 py-1 text-xs font-bold text-red-600">
                  ประหยัด {savings.toLocaleString()} บาท
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-white/70 ring-1 ring-black/5 px-3 py-1 text-xs font-bold text-black/60">
                  Standard
                </span>
              )}
            </div>
  
            {/* Room chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/80 ring-1 ring-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                ตึกหมาเล็ก {roomsCount.SMALL} ห้อง
              </span>
              <span className="rounded-full bg-white/80 ring-1 ring-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                ตึกหมาใหญ่ {roomsCount.LARGE} ห้อง
              </span>
              <span className="rounded-full bg-white/80 ring-1 ring-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                VIP {roomsCount.VIP} ห้อง
              </span>
            </div>
  
            <p className="mt-2 text-xs text-black/45">
              * จำนวนห้องเป็นผลลัพธ์จากการจัดอัตโนมัติ (ตามตัวและขนาด)
            </p>
          </div>
        </section>
  
        {/* 2) Details (Collapsible) */}
        <DetailsSection
          title="รายละเอียดห้อง (อ่านเพิ่มเติม)"
          defaultOpen={false}
        >
          {/* Rooms (readonly) */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="font-extrabold text-gray-900 mb-3">แยกห้อง / ตัวเลือก</p>
  
            <div className="space-y-3">
              {(["SMALL", "LARGE", "VIP"] as const).map((k) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={roomsCount[k] > 0} disabled className="h-5 w-5" />
                    <span className="text-gray-900 font-semibold">
                      {k === "SMALL" ? "ตึกหมาเล็ก" : k === "LARGE" ? "ตึกหมาใหญ่" : "ห้อง VIP"}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">จำนวน</span>
                    <input
                      type="number"
                      value={roomsCount[k]}
                      disabled
                      className="w-16 rounded-lg border px-2 py-1 text-center bg-gray-100"
                    />
                    <span className="text-sm text-gray-500">ห้อง</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* ตัวไหนอยู่ห้องอะไร */}
          <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
            <p className="font-extrabold text-gray-900 mb-3">การจัดห้อง (ตัวไหนอยู่ห้องอะไร)</p>
  
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-600">ยังไม่มีข้อมูลการจัดห้อง</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((r) => (
                  <div
                    key={`${r.roomType}-${r.roomNo}`}
                    className="rounded-2xl bg-black/[0.02] ring-1 ring-black/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-gray-900">
                        {r.roomType === "SMALL"
                          ? `ห้องเล็ก ${r.roomNo}`
                          : r.roomType === "LARGE"
                          ? `ห้องใหญ่ ${r.roomNo}`
                          : `VIP ${r.roomNo}`}
                      </p>
                      <p className="text-xs text-black/50">{r.petIds.length} ตัว</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {r.petIds.map((id) => petNameById.get(id) ?? `ID: ${id}`).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailsSection>
      </div>
  
      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-[#FFF7EA]/95 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-4">
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              const petsQ = encodeURIComponent(pets.map((p) => p.id).join(","));
              router.push(
                `/service/boarding/confirm?pets=${petsQ}` +
                  `&start=${encodeURIComponent(startDate)}` +
                  `&end=${encodeURIComponent(endDate)}` +
                  `&startTime=${encodeURIComponent(startTime)}` +
                  `&endTime=${encodeURIComponent(endTime)}` +
                  `&nights=${encodeURIComponent(String(Math.max(1, nights)))}` +
                  `&plan=${encodeURIComponent(String(plan))}`
              );
            }}
            className={[
              "w-full py-4 rounded-2xl text-xl font-extrabold text-white transition active:scale-[0.99]",
              canConfirm ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ต่อไป
          </button>
        </div>
      </div>
    </main>
  );  
}

function DetailsSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-sm px-4 py-3 flex items-center justify-between"
      >
        <span className="text-sm font-extrabold text-black/80">{title}</span>
        <span className="text-xs font-semibold text-black/50">{open ? "ซ่อน" : "แสดง"}</span>
      </button>

      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

