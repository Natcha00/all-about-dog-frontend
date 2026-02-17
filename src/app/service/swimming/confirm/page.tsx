"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  readSelectedPetsFromSession,
  filterSelectedPetsByIds,
} from "@/lib/boarding/selectedPetsSession";
import type { SwimPet } from "@/lib/swimming/types";
import {
  calcSwimPricing,
  DEFAULT_SWIM_PRICE,
} from "@/lib/swimming/swimming.logic";

import SwimConfirmSummary from "@/components/ui/swimming/SwimConfirmSummary";
import SwimCostBreakdownSheet from "@/components/ui/swimming/SwimCostBreakdownSheet";

function makeSwimRef(dateISO?: string) {
  const d = dateISO ? new Date(dateISO) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const rand4 = String(buf[0] % 10000).padStart(4, "0");

  return `SW${yyyy}${mm}${dd}-${rand4}`; // ex: SW20260121-0427
}

function SwimConfirmPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [openCost, setOpenCost] = useState(false);
  const [ownerPlay, setOwnerPlay] = useState(false);

  const petsParam = sp.get("pets") || "";
  const date = sp.get("date") || "";
  const time = sp.get("time") || "";
  const isVip = (sp.get("vip") || "0") === "1";

  // ✅ ref สร้างครั้งเดียวตาม "date" (เปลี่ยน date -> เปลี่ยน ref)
  const ref = useMemo(() => makeSwimRef(date), [date]);

  const petIds = useMemo(() => {
    return petsParam
      ? petsParam
        .split(",")
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0)
      : [];
  }, [petsParam]);

  const petIdsKey = useMemo(() => petIds.join(","), [petIds]);
  const [pets, setPets] = useState<SwimPet[]>([]);

  useEffect(() => {
    const storedAll = readSelectedPetsFromSession();
    const stored = filterSelectedPetsByIds(storedAll, petIds);

    const mapped: SwimPet[] = stored.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
    }));

    const fallback: SwimPet[] = petIds.map((id) => ({
      id,
      name: undefined,
      size: id % 2 === 0 ? "small" : "large",
    }));

    setPets(mapped.length > 0 ? mapped : fallback);
  }, [petIdsKey]);

  const pricing = useMemo(() => {
    return calcSwimPricing({ pets, isVip, price: DEFAULT_SWIM_PRICE });
  }, [pets, isVip]);

  const petLines = useMemo(() => {
    return pets.map((p, idx) => ({
      idx: idx + 1,
      label: p.name?.trim() ? p.name : `ID: ${p.id}`,
    }));
  }, [pets]);

  const canConfirm = petIds.length > 0 && !!date && !!time;

  const onConfirm = () => {
    // ✅ backup กัน query หลุด/refresh
    sessionStorage.setItem("swim_last_ref", ref);

    const qs = new URLSearchParams({
      ref, // ✅ สำคัญ: ส่ง ref ไป success
      pets: petIds.join(","),
      date,
      time,
      vip: isVip ? "1" : "0",
      ownerPlay: ownerPlay ? "1" : "0",
      total: String(pricing?.total ?? 0),
    });

    router.push(`/service/swimming/success?${qs.toString()}`);
  };

  const [showConfirm, setShowConfirm] = useState(false);


  return (
      <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <p className="text-sm text-gray-500">บริการสระว่ายน้ำ</p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            ยืนยันการจอง
          </h1>
        </div>

        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  เจ้าของลงเล่นกับสุนัข{" "}
                  <span className="text-emerald-600">(ฟรี)</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกได้หากต้องการลงสระพร้อมน้องในรอบนี้
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOwnerPlay((v) => !v)}
                className={[
                  "relative inline-flex h-9 w-16 items-center rounded-full transition",
                  ownerPlay ? "bg-emerald-500" : "bg-gray-200",
                ].join(" ")}
                aria-pressed={ownerPlay}
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

          <SwimConfirmSummary
            serviceLabel="จองสระว่ายน้ำ"
            date={date}
            time={time}
            isVip={isVip}
            petLines={petLines}
            total={pricing.total}
            ownerPlay={ownerPlay}
          />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setOpenCost(true)}
            className="w-full rounded-2xl border-2 border-[#F0A23A] bg-transparent py-3 font-semibold text-[#F0A23A]"
          >
            คำนวณค่าใช้จ่ายเบื้องต้น
          </button>

          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => setShowConfirm(true)}
            className={[
              "w-full rounded-2xl py-3 font-semibold text-white transition",
              canConfirm ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ยืนยัน
          </button>
        </div>
      </div>

      <SwimCostBreakdownSheet
        open={openCost}
        onClose={() => setOpenCost(false)}
        pricing={pricing}
        isVip={isVip}
      />

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-extrabold text-gray-900">
              ยืนยันการจองใช่ไหม?
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              ระบบจะบันทึกรายการและไปยังหน้าสำเร็จทันที
            </p>

            <div className="mt-4 rounded-2xl bg-[#F7F4E8]/60 ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-black/60">ราคารวม</p>
                <p className="text-sm font-extrabold text-black/90">
                  {pricing.total.toLocaleString()} บาท
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl bg-gray-200 py-3 font-semibold text-gray-700 active:scale-[0.99] transition"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  onConfirm();
                }}
                className="flex-1 rounded-2xl bg-[#F0A23A] py-3 font-semibold text-white active:scale-[0.99] transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}


    </main>
  );
}


export default function Page(){
  return <Suspense>
    <SwimConfirmPage/>
  </Suspense>
}