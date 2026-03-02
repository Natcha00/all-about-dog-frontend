"use client";

import { BoardingDraft, PetPicked } from "@/lib/walkin/walkin/types.mock";
import { useEffect, useMemo, useState } from "react";
type Plan = 1 | 2 | 3;

type BoardingPackagePricingResponse = {
  offerType: string;
  period: { start: string; end: string; nights: number };
  package: string;
  dogs: Array<{
    dogId: number;
    name: string;
    groupNumber: number;
    sizeLabel: string;
    breed: string;
    size: string;
    perNight: number;
    subtotal: number;
  }>;
  groups: Array<{
    groupNumber: number;
    offerCode: string;
    offerLabel: string;
    capacity: number;
    dogIds: Array<{ dogId: number; name: string; sizeLabel: string }>;
  }>;
  pricingSummary: { total: number; currency: string };
  lines: Array<{ offeringId: number; dogId: number; price: number; quantity: number; groupNumber: number }>;
};

type BoardingAvailableResponse = {
  available: boolean;
  message: string;
  hint: string;
  range: { start: string; end: string };
  nights: number;
  roomPerNight: { LARGE: number; SMALL: number; VIP: number };
  package: string;
  need: { LARGE: number; SMALL: number; VIP: number };
  fails: Array<{ date?: string; message?: string; need?: Record<string, number>; cap?: Record<string, number> }>;
};

function planToPackage(plan: Plan): string {
  return plan === 3 ? "vip" : "standard";
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

  const [availabilityResult, setAvailabilityResult] = useState<BoardingAvailableResponse | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [pricingResult, setPricingResult] = useState<BoardingPackagePricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const nights = useMemo(() => (start && end ? calcNights(start, end) : 0), [start, end]);

  const canCheckAvailability =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start);

  useEffect(() => {
    if (!canCheckAvailability) {
      setAvailabilityResult(null);
      setAvailabilityError(null);
      return;
    }
    const startDateTime = `${start}T${startTime}:00`;
    const endDateTime = `${end}T${endTime}:00`;
    const dogIds = pets.map((p) => p.id).join(",");
    const pkg = planToPackage(plan);

    setAvailabilityLoading(true);
    setAvailabilityError(null);
    const url = `/api/offering/boarding/available?${new URLSearchParams({
      dogIds,
      offeringType: "boarding",
      start: startDateTime,
      end: endDateTime,
      package: pkg,
    }).toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error ?? d.detail ?? res.statusText)));
        return res.json();
      })
      .then((data: BoardingAvailableResponse) => {
        setAvailabilityResult(data);
      })
      .catch((e: Error) => {
        setAvailabilityResult(null);
        setAvailabilityError(e.message ?? "ไม่สามารถเช็คห้องว่างได้");
      })
      .finally(() => {
        setAvailabilityLoading(false);
      });
  }, [canCheckAvailability, pets, start, end, startTime, endTime, plan]);

  const isAvailableAllNights = availabilityResult?.available ?? false;

  const canShowSummary =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start) &&
    !!plan &&
    isAvailableAllNights; // ✅ ต้องว่างครบทุกคืนเท่านั้น

  useEffect(() => {
    if (!canShowSummary) {
      setPricingResult(null);
      setPricingError(null);
      return;
    }
    const startDateTime = `${start}T${startTime}:00`;
    const endDateTime = `${end}T${endTime}:00`;
    const dogIds = pets.map((p) => p.id).join(",");
    const pkg = planToPackage(plan);

    setPricingLoading(true);
    setPricingError(null);
    const url = `/api/offering/boarding/package-pricing?${new URLSearchParams({
      dogIds,
      offeringType: "boarding",
      start: startDateTime,
      end: endDateTime,
      package: pkg,
    }).toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error ?? d.detail ?? res.statusText)));
        return res.json();
      })
      .then((data: BoardingPackagePricingResponse) => {
        setPricingResult(data);
      })
      .catch((e: Error) => {
        setPricingResult(null);
        setPricingError(e.message ?? "ไม่สามารถโหลดราคาได้");
      })
      .finally(() => {
        setPricingLoading(false);
      });
  }, [canShowSummary, pets, start, end, startTime, endTime, plan]);

  const total = pricingResult?.pricingSummary?.total ?? 0;
  const priceBreakdown = pricingResult?.dogs ?? [];
  const roomGroups = pricingResult?.groups ?? [];


  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);



  const canNext =
    pets.length > 0 &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start) &&
    isAvailableAllNights &&
    !!pricingResult &&
    !pricingLoading;


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
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-extrabold text-gray-900">แพ็กเกจ</p>
          <p className="text-xs text-black/45">แตะเพื่อเลือก</p>
        </div>

        <PlanSlider value={plan} onChange={setPlan} />

        {/* คำอธิบายใต้สไลด์ (สวย+อ่านง่าย) */}
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
          {plan === 1 ? (
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-gray-900">แบบ 1 : มาตรฐาน</p>
              <p className="text-xs text-black/55 leading-relaxed">
                รูปแบบ: แยกกันอยู่ 1 ตัว/ห้องพัก แบ่งห้องพักตามขนาดตัว
              </p>
            </div>
          ) : plan === 2 ? (
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-gray-900">แบบ 2 : นอนด้วยกัน</p>
              <p className="text-xs text-black/55 leading-relaxed">
                รูปแบบ: รวมกันอยู่ 2–3 ตัว/ห้องพัก (ตามเงื่อนไขขนาด)
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-gray-900">แบบ 3 : VIP บ้านเดี่ยว</p>
              <p className="text-xs text-black/55 leading-relaxed">
                ลูกค้ามาจากบ้านเดียวกัน พักด้วยกันในห้องส่วนตัว
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Availability card */}
      {canCheckAvailability ? (
        availabilityLoading ? (
          <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
            <p className="text-sm font-extrabold text-black/70">กำลังเช็คห้องว่าง...</p>
          </div>
        ) : availabilityError ? (
          <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
            <p className="text-sm font-extrabold text-rose-900">เกิดข้อผิดพลาด</p>
            <p className="text-xs text-rose-800/80 mt-1">{availabilityError}</p>
          </div>
        ) : availabilityResult ? (
          availabilityResult.available ? (
            <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
              <p className="text-sm font-extrabold text-emerald-900">{availabilityResult.message}</p>
              {availabilityResult.hint ? (
                <p className="text-xs text-emerald-800/80 mt-1">{availabilityResult.hint}</p>
              ) : null}
              <p className="text-xs font-semibold  text-emerald-800/80 mt-1 ">
                {start} ถึง {end} = {availabilityResult.nights} คืน
              </p>
              <p className="text-xs text-emerald-800/80 mt-1">
                ชนิดห้องต่อคืน:
                {" "}
                {plan === 3
                  ? `VIP ${availabilityResult.need.VIP} ห้อง`
                  : `ตึกหมาเล็ก ${availabilityResult.need.SMALL} ห้อง, ตึกหมาใหญ่ ${availabilityResult.need.LARGE} ห้อง`}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
              <p className="text-sm font-extrabold text-rose-900">{availabilityResult.message}</p>
              {availabilityResult.hint ? (
                <p className="text-xs text-rose-800/80 mt-1">{availabilityResult.hint}</p>
              ) : null}

              <div className="mt-2 rounded-2xl bg-white/70 ring-1 ring-black/5 p-3 space-y-2">
                <p className="text-xs font-extrabold text-black/70">คืนที่มีปัญหา</p>

                <div className="space-y-2 overflow-y-auto max-h-56 m-1 p-1">
                  {availabilityResult.fails.map((f, idx) => {
                    const smallNotEnough = (f.need?.SMALL ?? 0) > (f.cap?.SMALL ?? 0);
                    const largeNotEnough = (f.need?.LARGE ?? 0) > (f.cap?.LARGE ?? 0);
                    const vipNotEnough = (f.need?.VIP ?? 0) > (f.cap?.VIP ?? 0);
                    const need = f.need ?? { SMALL: 0, LARGE: 0, VIP: 0 };
                    const cap = f.cap ?? { SMALL: 0, LARGE: 0, VIP: 0 };

                    return (
                      <div
                        key={f.date ?? idx}
                        className="rounded-2xl bg-white ring-1 ring-rose-200 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-gray-900">
                            {f.date ?? "—"}
                          </span>

                          <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-extrabold text-rose-700">
                            ห้องไม่พอ
                          </span>
                        </div>

                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">ต้องการจอง:</span>{" "}
                          {plan === 3 ? (
                            <span className={vipNotEnough ? "text-rose-600 font-bold" : ""}>
                              VIP {need.VIP}
                            </span>
                          ) : (
                            <>
                              <span className={smallNotEnough ? "text-rose-600 font-bold" : ""}>
                                ตึกหมาเล็ก {need.SMALL}
                              </span>
                              {" • "}
                              <span className={largeNotEnough ? "text-rose-600 font-bold" : ""}>
                                ตึกหมาใหญ่ {need.LARGE}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">ห้องคงเหลือ:</span>{" "}
                          {plan === 3 ? (
                            <span className={vipNotEnough ? "text-rose-600 font-bold" : ""}>
                              VIP {cap.VIP}
                            </span>
                          ) : (
                            <>
                              <span className={smallNotEnough ? "text-rose-600 font-bold" : ""}>
                                ตึกหมาเล็ก {cap.SMALL}
                              </span>
                              {" • "}
                              <span className={largeNotEnough ? "text-rose-600 font-bold" : ""}>
                                ตึกหมาใหญ่ {cap.LARGE}
                              </span>
                            </>
                          )}
                        </div>
                        {f.message ? (
                          <p className="text-xs text-rose-700">{f.message}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
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
          {pricingLoading ? (
            <p className="text-sm text-black/50 mt-2">กำลังโหลดราคา...</p>
          ) : pricingError ? (
            <p className="text-sm text-rose-600 mt-2">{pricingError}</p>
          ) : pricingResult ? (
            <>
              <p className="text-sm font-extrabold text-gray-900">
                รายละเอียดราคา ({pricingResult.period.nights} คืน)
              </p>
              <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3 shadow-sm mt-2">
                <div className="space-y-2">
                  {roomGroups.length > 0 ? (
                    <div className="mt-3 rounded-2xl bg-white ring-1 ring-black/10 p-4 overflow-y-auto max-h-56">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-extrabold text-gray-900">รูปแบบเข้าพัก</p>
                      </div>

                      <div className="mt-3 space-y-2">
                        {roomGroups.map((g) => (
                          <div key={g.groupNumber} className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-3">
                            <div className="flex justify-between">
                              <p className="text-xs font-extrabold text-black/70">
                                {g.offerLabel}
                              </p>
                              <p className="text-xs font-extrabold text-black/70">
                                {g.dogIds.length} ตัว
                              </p>
                            </div>

                            <div className="mt-1 text-sm text-black/70">
                              {g.dogIds.map((d) => (
                                <div key={d.dogId} className="flex items-center justify-between text-black/45">
                                  <span className="font-semibold">{d.name}</span>
                                  <span className="text-xs">{d.sizeLabel}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-2 text-[11px] text-black/45">
                        * เป็นการจัดห้องจากระบบ
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="h-px bg-black/10" />
                {priceBreakdown.map((item) => (
                  <div
                    key={item.dogId}
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
                      {item.subtotal.toLocaleString()} บาท
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">รวมทั้งหมด</span>
                  <span className="text-lg font-extrabold text-[#F0A23A]">
                    {(pricingResult.pricingSummary?.total ?? 0).toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </>
          ) : null}
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
                ? "bg-[#fff7ea] text-[#B25A00] ring-[#F0A23A]/40"
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
              customerNote: note,
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


function PlanSlider(props: { value: 1 | 2 | 3; onChange: (v: 1 | 2 | 3) => void }) {
  const { value, onChange } = props;

  // ตำแหน่งของ pill (0%, 100%, 200%)
  const translate =
    value === 1 ? "translate-x-0" : value === 2 ? "translate-x-full" : "translate-x-[200%]";

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/10 p-1">
      <div className="relative grid grid-cols-3">
        {/* pill ที่เลื่อน */}
        <div
          className={[
            "absolute inset-y-0 left-0 w-1/3 rounded-2xl bg-[#fff7ea] ring-1 ring-[#F0A23A]/40",
            "transition-transform duration-300 ease-out",
            translate,
          ].join(" ")}
        />

        {/* buttons */}
        <PlanSlideBtn active={value === 1} onClick={() => onChange(1)}>
          แบบ 1
        </PlanSlideBtn>
        <PlanSlideBtn active={value === 2} onClick={() => onChange(2)}>
          แบบ 2
        </PlanSlideBtn>
        <PlanSlideBtn active={value === 3} onClick={() => onChange(3)}>
          VIP
        </PlanSlideBtn>
      </div>
    </div>
  );
}

function PlanSlideBtn(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const { active, onClick, children } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative z-10 h-11 rounded-2xl",
        "text-sm font-extrabold transition",
        active ? "text-gray-900" : "text-black/55 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
