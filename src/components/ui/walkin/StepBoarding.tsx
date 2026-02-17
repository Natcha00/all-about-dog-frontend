"use client";

import { calcBoardingTotal } from "@/lib/walkin/boarding/boarding.price.logic";
import { BoardingDraft, PetPicked } from "@/lib/walkin/walkin/types.mock";
import { useMemo, useState } from "react";
type Plan = 1 | 2 | 3;

function chunkCount(count: number, size: number) {
  return Math.ceil(Math.max(0, count) / size);
}

// จำนวนห้องที่ต้องใช้ "ต่อคืน"
function requiredRoomsPerNight(pets: PetPicked[], plan: Plan) {
  const smallCount = pets.filter((p) => p.size === "small").length;
  const largeCount = pets.filter((p) => p.size === "large").length;

  if (plan === 1) {
    return {
      SMALL: smallCount, // 1 ตัว/ห้อง
      LARGE: largeCount, // 1 ตัว/ห้อง
      VIP: 0,
    };
  }

  if (plan === 2) {
    // ตาม logic ที่คุณเคยใช้: small 3 ตัว/ห้อง, large 2 ตัว/ห้อง
    return {
      SMALL: chunkCount(smallCount, 3),
      LARGE: chunkCount(largeCount, 2),
      VIP: 0,
    };
  }

  // plan 3: VIP บ้านเดียว (1 ห้อง)
  return {
    SMALL: 0,
    LARGE: 0,
    VIP: pets.length > 0 ? 1 : 0,
  };
}

type DailyCapacity = {
  SMALL: number; // ห้องว่างฝั่งหมาเล็ก
  LARGE: number; // ห้องว่างฝั่งหมาใหญ่
  VIP: number;   // ห้องว่าง VIP
};

// ✅ mock: ความจุห้องว่างในแต่ละคืน (คุณแทนด้วย backend ได้ทีหลัง)
const CAPACITY_BY_DATE: Record<string, DailyCapacity> = {
  "2026-02-16": { SMALL: 5, LARGE: 2, VIP: 1 },
  "2026-02-17": { SMALL: 0, LARGE: 2, VIP: 1 }, // ตัวอย่าง: หมดห้องเล็ก
  "2026-02-18": { SMALL: 7, LARGE: 0, VIP: 1 }, // ตัวอย่าง: หมดห้องใหญ่
  "2026-02-19": { SMALL: 7, LARGE: 0, VIP: 1 }, // ตัวอย่าง: หมดห้องใหญ่
  "2026-02-20": { SMALL: 8, LARGE: 8, VIP: 0 }, // ตัวอย่าง: VIP เต็ม
  "2026-02-21": { SMALL: 8, LARGE: 8, VIP: 0 }, // ตัวอย่าง: VIP เต็ม
};

// คืนลิสต์คืน (คืนที่ 1..คืนสุดท้าย) เช่น start=1 end=10 => ได้คืน 1..9
function listNights(start: string, end: string): string[] {
  if (!start || !end) return [];
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const out: string[] = [];

  for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out;
}

function checkAvailabilityRange(params: {
  pets: PetPicked[];
  plan: Plan;
  start: string;
  end: string;
}) {
  const { pets, plan, start, end } = params;
  const nights = listNights(start, end);

  const need = requiredRoomsPerNight(pets, plan);

  const fails = nights
    .map((date) => {
      const cap = CAPACITY_BY_DATE[date] ?? { SMALL: 999, LARGE: 999, VIP: 999 }; // ถ้าไม่มีข้อมูล mock ให้ถือว่าว่าง (กัน dev ง่าย)
      const ok =
        need.SMALL <= cap.SMALL &&
        need.LARGE <= cap.LARGE &&
        need.VIP <= cap.VIP;

      return ok
        ? null
        : {
          date,
          need,
          cap,
        };
    })
    .filter(Boolean) as Array<{
      date: string;
      need: { SMALL: number; LARGE: number; VIP: number };
      cap: DailyCapacity;
    }>;

  return {
    ok: fails.length === 0,
    nightsCount: nights.length,
    need,
    fails,
  };
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcNights(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil(diff));
}

export default function StepBoarding(props: {
  pets: PetPicked[];
  onBack: () => void;
  onNext: (draft: BoardingDraft) => void;
}) {
  const { pets, onBack, onNext } = props;

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [plan, setPlan] = useState<1 | 2 | 3>(1);

  const nights = useMemo(() => (start && end ? calcNights(start, end) : 0), [start, end]);

  // ✅ ใช้ pricing logic จากไฟล์เดียว (อ้างอิง PetPicked size จาก mock)
  const total = useMemo(() => {
    if (!nights || pets.length === 0) return 0;
    return calcBoardingTotal({ pets, plan, nights }).total;
  }, [nights, pets, plan]);

  const canShowSummary =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start) &&
    !!plan;
  const priceBreakdown = useMemo(() => {
    if (!canShowSummary || !nights) return [];

    // 👑 VIP
    if (plan === 3) {
      return pets.map((p, index) => ({
        id: p.id,
        name: p.name,
        breed: p.breed,
        price: nights * (index === 0 ? 1500 : 500),
      }));
    }

    // Plan 1 และ 2
    const smallPets = pets.filter((p) => p.size === "small");
    const largePets = pets.filter((p) => p.size === "large");

    const result: any[] = [];

    if (plan === 1) {
      pets.forEach((p) => {
        const perNight = p.size === "small" ? 450 : 600;
        result.push({
          id: p.id,
          name: p.name,
          breed: p.breed,
          price: nights * perNight,
        });
      });
    }

    if (plan === 2) {
      smallPets.forEach((p, i) => {
        const perNight = i === 0 ? 450 : 380;
        result.push({
          id: p.id,
          name: p.name,
          breed: p.breed,
          price: nights * perNight,
        });
      });

      largePets.forEach((p, i) => {
        const perNight = i === 0 ? 600 : 510;
        result.push({
          id: p.id,
          name: p.name,
          breed: p.breed,
          price: nights * perNight,
        });
      });
    }

    return result;
  }, [pets, plan, nights, canShowSummary]);

  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const canCheckAvailability =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start);

  const availability = useMemo(() => {
    if (!canCheckAvailability) return null;
    return checkAvailabilityRange({ pets, plan, start, end });
  }, [canCheckAvailability, pets, plan, start, end]);

  const isAvailableAllNights = availability?.ok ?? false;

  const canNext =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start) &&
    isAvailableAllNights;


  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">ฝากเลี้ยง</h2>
        <p className="text-sm text-black/50">เลือกวันเข้า-ออก + แพ็กเกจ</p>
      </div>

      {/* วันที่ */}
      <div className="appearance-none grid grid-cols-2 gap-3">
        <Field
          label="วันเข้า"
          type="date"
          value={start}
          min={todayISO()}
          onChange={(v) => {
            setStart(v);
            if (end && new Date(end) <= new Date(v)) {
              setEnd("");
            }
          }}
        />

        <Field
          label="วันออก"
          type="date"
          value={end}
          min={start || todayISO()}
          onChange={setEnd}
        />
      </div>

      {/* แพ็กเกจ */}
      <div className="space-y-2">
        <p className="text-sm font-extrabold text-gray-900">แพ็กเกจ</p>
        <div className="grid grid-cols-3 gap-2">
          <PlanButton active={plan === 1} onClick={() => setPlan(1)}>
            แบบ 1 : มาตรฐาน
          </PlanButton>
          <PlanButton active={plan === 2} onClick={() => setPlan(2)}>
            แบบ 2 : นอนด้วยกัน
          </PlanButton>
          <PlanButton active={plan === 3} onClick={() => setPlan(3)}>
            แบบ 3 : VIP บ้านเดี่ยว
          </PlanButton>
        </div>
      </div>
      {/* ✅ Availability card */}
      {canCheckAvailability ? (
        availability ? (
          availability.ok ? (
            <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
              <p className="text-sm font-extrabold text-emerald-900">ห้องว่างตลอดช่วงที่เลือก ✅</p>
              <p className="text-xs text-emerald-800/80 mt-1">
                {start} → {end} • {availability.nightsCount} คืน • ต้องใช้ต่อคืน:
                {" "}
                {plan === 3
                  ? `VIP ${availability.need.VIP} ห้อง`
                  : `เล็ก ${availability.need.SMALL} ห้อง, ใหญ่ ${availability.need.LARGE} ห้อง`}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
              <p className="text-sm font-extrabold text-rose-900">ห้องไม่ว่างครบทุกคืน ❌</p>
              <p className="text-xs text-rose-800/80 mt-1">
                กรุณาเลือกวันใหม่ (มีอย่างน้อย 1 คืนที่ห้องไม่พอ)
              </p>

              <div className="mt-3 rounded-2xl bg-white/70 ring-1 ring-black/5 p-3 space-y-2">
                <p className="text-xs font-extrabold text-black/70">คืนที่มีปัญหา</p>

                <div className="space-y-2">
                  {availability.fails.slice(0, 3).map((f) => {
                    const smallNotEnough = f.need.SMALL > f.cap.SMALL;
                    const largeNotEnough = f.need.LARGE > f.cap.LARGE;
                    const vipNotEnough = f.need.VIP > f.cap.VIP;

                    return (
                      <div
                        key={f.date}
                        className="rounded-2xl bg-white ring-1 ring-rose-200 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-gray-900">
                            {f.date}
                          </span>

                          <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-extrabold text-rose-700">
                            ห้องไม่พอ
                          </span>
                        </div>

                        {/* ต้องใช้ */}
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">ต้องการจอง:</span>{" "}
                          {plan === 3 ? (
                            <span className={vipNotEnough ? "text-rose-600 font-bold" : ""}>
                              VIP {f.need.VIP}
                            </span>
                          ) : (
                            <>
                              <span className={smallNotEnough ? "text-rose-600 font-bold" : ""}>
                                ห้องเล็ก {f.need.SMALL}
                              </span>
                              {" • "}
                              <span className={largeNotEnough ? "text-rose-600 font-bold" : ""}>
                                ห้องใหญ่ {f.need.LARGE}
                              </span>
                            </>
                          )}
                        </div>

                        {/* ว่าง */}
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">ห้องคงเหลือ:</span>{" "}
                          {plan === 3 ? (
                            <span className={vipNotEnough ? "text-rose-600 font-bold" : ""}>
                              VIP {f.cap.VIP}
                            </span>
                          ) : (
                            <>
                              <span className={smallNotEnough ? "text-rose-600 font-bold" : ""}>
                                เล็ก {f.cap.SMALL}
                              </span>
                              {" • "}
                              <span className={largeNotEnough ? "text-rose-600 font-bold" : ""}>
                                ใหญ่ {f.cap.LARGE}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>

                {availability.fails.length > 3 ? (
                  <p className="text-[11px] text-black/45">
                    และอีก {availability.fails.length - 3} คืน…
                  </p>
                ) : null}
              </div>
            </div>
          )
        ) : null
      ) : (
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-black/70">เช็คห้องว่าง</p>
          <p className="text-xs text-black/45 mt-1">เลือกวันเข้า/ออกให้ครบก่อน แล้วระบบจะตรวจห้องว่างให้</p>
        </div>
      )}

      {/* สรุป */}
      {canShowSummary && (
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-gray-900">สรุป</p>

          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3 shadow-sm mt-2">
            <p className="text-sm font-extrabold text-gray-900">
              รายละเอียดราคา ({nights} คืน)
            </p>

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

            <div className="h-px bg-black/10" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">รวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-[#F0A23A]">
                {total.toLocaleString()} บาท
              </span>
            </div>
          </div>
        </div>
      )}
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
              noteOpen
                ? "bg-[#F7F4E8] text-[#B25A00] ring-[#F0A23A]/40"
                : "bg-black/[0.04] text-black/60 ring-black/10",
            ].join(" ")}
          >
            {noteOpen ? "ซ่อน" : "เปิด"}
          </span>
        </button>

        {noteOpen && (
          <div className="px-4 pb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="เช่น ต้องการห้องใกล้กล้อง / น้องแพ้อาหาร / โทรแจ้งก่อนรับกลับ ฯลฯ"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-black/45">
                * หมายเหตุนี้เป็นข้อความภายในรายการจอง
              </p>

              {note.trim() && (
                <button
                  type="button"
                  onClick={() => setNote("")}
                  className="text-xs font-extrabold text-rose-600 hover:underline"
                >
                  ล้างข้อความ
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70"
        >
          กลับ
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() =>
            onNext({
              serviceType: "boarding",
              start,
              end,
              startTime,
              endTime,
              plan,
              total,
              note,
            })
          }
          className={[
            "w-full rounded-2xl py-3 font-extrabold text-white",
            canNext
              ? "bg-[#F0A23A] hover:bg-[#e99625]"
              : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          ต่อไป
        </button>
      </div>

      {!canNext && (
        <p className="text-xs text-rose-600 text-center">
          วันออกต้องมากกว่าวันเข้า และห้ามเลือกย้อนหลัง
        </p>
      )}
    </section>
  );
}

function Field(props: {
  label: string;
  type: "date";
  value: string;
  min: string;
  onChange: (v: string) => void;
}) {
  const { label, type, value, onChange, min } = props;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm"
      />
    </div>
  );
}

function PlanButton(props: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { active, onClick, children } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl py-3 text-sm font-extrabold ring-2 transition",
        active
          ? "bg-[#F7F4E8] ring-[#F0A23A] text-gray-900"
          : "bg-white ring-black/10 text-black/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
