"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pet, allocateAssignments, calcPricing, countRooms } from "@/lib/boarding/boarding.logic";
import BookingConfirmSummary from "@/components/ui/boarding/confirm/BookingConfirmSummary";
import CostBreakdownSheet from "@/components/ui/boarding/confirm/CostBreakdownSheet";
import { filterSelectedPetsByIds, readSelectedPetsFromSession } from "@/lib/boarding/selectedPetsSession";

export default function BoardingConfirmPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [openCost, setOpenCost] = useState(false);
  const petsParam = sp.get("pets") || "";
  const startDate = sp.get("start") || "";
  const endDate = sp.get("end") || "";
  const startTime = sp.get("startTime") || "";
  const endTime = sp.get("endTime") || "";
  const nights = Math.max(1, Number(sp.get("nights") || 1));
  const planParam = Number(sp.get("plan") || 1);
  const plan: 1 | 2 | 3 = planParam === 2 ? 2 : planParam === 3 ? 3 : 1;

  const petIds = useMemo(() => {
    return petsParam
      ? petsParam
        .split(",")
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0)
      : [];
  }, [petsParam]);

  const petIdsKey = useMemo(() => petIds.join(","), [petIds]);

  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const storedAll = readSelectedPetsFromSession();
    const stored = filterSelectedPetsByIds(storedAll, petIds);

    const mapped: Pet[] = stored.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
    }));

    const fallback: Pet[] = petIds.map((id) => ({
      id,
      name: undefined,
      size: id % 2 === 0 ? "small" : "large",
    }));

    setPets(mapped.length > 0 ? mapped : fallback);
  }, [petIdsKey]);

  const assignments = useMemo(() => allocateAssignments(pets, plan), [pets, plan]);
  const roomsCount = useMemo(() => countRooms(assignments), [assignments]);

  const petLines = useMemo(() => {
    return pets.map((p, idx) => ({
      idx: idx + 1,
      label: p.name?.trim() ? p.name : `ID: ${p.id}`,
    }));
  }, [pets]);

  const pricing = useMemo(() => {
    return calcPricing({ plan, nights, assignments });
  }, [plan, nights, assignments]);

  const onConfirm = () => {
    const qs = new URLSearchParams({
      pets: petIds.join(","),
      start: startDate,
      end: endDate,
      startTime,
      endTime,
      nights: String(nights),
      plan: String(plan),
      total: String(pricing.total ?? 0),
    });

    router.push(`/service/boarding/success?${qs.toString()}`);


  };
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-8 pb-44">
      {/* Header */}
      <div className="mx-auto max-w-md">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">บริการฝากเลี้ยง</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">ยืนยันการจอง</h1>
          <p className="mt-1 text-xs text-black/45">ตรวจสอบข้อมูลก่อนกดยืนยัน</p>
        </div>
  
        {/* 1) Summary */}
        <BookingConfirmSummary
          serviceLabel="รับฝากเลี้ยง"
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          nights={nights}
          plan={plan}
          petLines={petLines}
          roomsCount={roomsCount}
        />
  
        {/* 2) Price bar (เด่น + ดู breakdown ได้) */}
        <div className="mt-4 rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-black/45">ราคารวมโดยประมาณ</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {pricing.total.toLocaleString()} บาท
              </p>
              <p className="mt-1 text-xs text-black/40">
                * ราคาอาจเปลี่ยนตามจำนวนห้องและเงื่อนไขร้าน
              </p>
            </div>
  
            <button
              type="button"
              onClick={() => setOpenCost(true)}
              className="shrink-0 rounded-2xl bg-white ring-1 ring-black/10 px-4 py-3 text-sm font-extrabold text-black/70 active:scale-[0.99] transition"
            >
              ดูรายละเอียด
            </button>
          </div>
        </div>
  
        {/* 3) CTA */}
        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="w-full rounded-2xl bg-[#F0A23A] py-4 text-lg font-extrabold text-white active:scale-[0.99] transition"
            onClick={() => setShowConfirm(true)}
          >
            ยืนยันการจอง
          </button>
  
          {/* Secondary */}
          <button
            type="button"
            onClick={() => setOpenCost(true)}
            className="w-full rounded-2xl bg-white/70 ring-1 ring-black/10 py-3 text-sm font-bold text-black/70 active:scale-[0.99] transition"
          >
            คำนวณค่าใช้จ่ายเบื้องต้น
          </button>
        </div>
      </div>
  
      {/* Confirm Modal (Poikai style) */}
      {showConfirm && (
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
              <p className="mt-1 text-sm text-black/55">
                ตรวจสอบข้อมูลแล้วกดยืนยันเพื่อไปหน้าสำเร็จ
              </p>
            </div>
  
            <div className="px-5 py-4">
              <div className="rounded-2xl bg-[#FFF7EA]/60 ring-1 ring-black/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/60">ราคารวม</p>
                  <p className="text-sm font-extrabold text-black/90">
                    {pricing.total.toLocaleString()} บาท
                  </p>
                </div>
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
                    onConfirm();
                  }}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
      <CostBreakdownSheet
        open={openCost}
        onClose={() => setOpenCost(false)}
        pricing={pricing}
        nights={nights}
      />
    </main>
  );
  
}
