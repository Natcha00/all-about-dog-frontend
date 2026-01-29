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

  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-10 pb-44">
      <div className="mb-6 flex flex-col items-center">
        <p className="text-sm text-gray-500">บริการฝากเลี้ยง</p>
        <h1 className="text-3xl font-extrabold text-gray-900">จองห้องพัก</h1>
      </div>

      <div className="mx-auto w-full max-w-md">
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

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setOpenCost(true)}
            className="w-full rounded-2xl border-2 border-[#F0A23A] bg-transparent py-3 font-semibold text-[#F0A23A]"
          >
            คำนวณค่าใช้จ่ายเบื้องต้น
          </button>

          <button
            type="button"
            className="w-full rounded-xl bg-[#F0A23A] py-3 font-semibold text-white"
            onClick={onConfirm}
          >
            ยืนยัน
          </button>
        </div>
      </div>

      <CostBreakdownSheet
        open={openCost}
        onClose={() => setOpenCost(false)}
        pricing={pricing}
        nights={nights}
      />
    </main>
  );
}
