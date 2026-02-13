"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import PoikaiCard from "@/components/ui/PoikaiCard";
import SelectedPetsChips, {
  SelectedPet,
} from "@/components/ui/boarding/calendar/SelectedPetsChips";
import RangeCalendar from "@/components/ui/boarding/calendar/RangeCalendar";

type StoredPet = {
  id: number;
  name: string;
  image: string;
  size: "small" | "large";
};

function SwimmingCalendarPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ pets=1,2,3
  const petsParam = sp.get("pets") || "";
  const petIds = useMemo(() => {
    return petsParam
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
  }, [petsParam]);

  // ✅ อ่านชื่อ/รูปจาก sessionStorage (มาจากหน้า select pet)
  const [storedPets, setStoredPets] = useState<StoredPet[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedPets");
      if (!raw) return;
      const arr = JSON.parse(raw) as StoredPet[];
      if (Array.isArray(arr)) setStoredPets(arr);
    } catch {
      // ignore
    }
  }, []);

  // ✅ สร้าง chips เพื่อโชว์สัตว์ที่เลือก
  const selectedPets: SelectedPet[] = useMemo(() => {
    if (petIds.length === 0) return [];

    if (storedPets.length > 0) {
      const map = new Map(storedPets.map((p) => [p.id, p]));
      return petIds
        .map((id) => map.get(id))
        .filter(Boolean)
        .map((p) => ({ id: p!.id, name: p!.name, image: p!.image }));
    }

    // fallback: ถ้า refresh แล้ว session หาย
    return petIds.map((id) => ({
      id,
      name: `ID: ${id}`,
      image: "/images/dogSwimmingLanding.jpg",
    }));
  }, [petIds, storedPets]);

  // ✅ ว่ายน้ำเลือก "วันเดียว"
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD

  // ✅ กันเลือกวันย้อนหลัง
  const todayYMD = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const canNext = petIds.length > 0 && !!date;

  const goNext = () => {
    // ✅ ไปหน้าถัดไปเลือก "รอบว่าง"
    router.push(
      `/service/swimming/slots?pets=${encodeURIComponent(petIds.join(","))}` +
        `&date=${encodeURIComponent(date)}`,
    );
  };

  return (
      <main className="min-h-screen bg-[#FFF7EA] pb-28">
        <div className="mx-auto w-full max-w-md px-4 pt-8 space-y-4">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              เลือกวันว่ายน้ำ
            </h1>
            <p className="text-sm text-gray-500">บริการสระว่ายน้ำ</p>
          </div>

          {/* ✅ โชว์สัตว์ที่เลือก */}
          <SelectedPetsChips pets={selectedPets} />

          {/* ✅ เลือกวันเดียว */}
          <PoikaiCard
            title="เลือกวัน"
            subtitle="เลือกได้ 1 วันเท่านั้น (ห้ามย้อนหลัง)"
            icon={<CalendarDays className="w-5 h-5 text-[#399199]" />}
          >
            <RangeCalendar
              monthsToShow={1}
              value={{ start: date || undefined, end: date || undefined }}
              onChange={(r) => {
                // เราจะถือว่าเลือกวันเดียว = ใช้ r.start (หรือ r.end ก็ได้)
                const picked = (r.end || r.start || "").trim();
                if (!picked) return;

                // กันย้อนหลัง
                if (picked < todayYMD) return;

                setDate(picked);
              }}
            />
          </PoikaiCard>

          {/* ✅ สรุปวัน */}
          {date ? (
            <div className="rounded-2xl bg-white p-4 shadow-sm text-sm text-gray-700">
              วันที่เลือก:{" "}
              <span className="font-semibold text-gray-900">{date}</span>
            </div>
          ) : null}
        </div>

        {/* Bottom CTA */}
        <div className="fixed inset-x-0 bottom-16 z-20 bg-[#FFF7EA]/95 backdrop-blur border-t border-black/5">
          <div className="mx-auto max-w-md px-6 py-4">
            <button
              type="button"
              disabled={!canNext}
              onClick={goNext}
              className={`
              w-full py-4 rounded-2xl text-xl font-bold text-white transition
              ${canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed"}
            `}
            >
              เลือกรอบที่ว่าง
            </button>

            {!canNext ? (
              <p className="mt-2 text-center text-xs text-gray-600">
                กรุณาเลือกวัน (และต้องมีสัตว์ที่เลือกไว้)
              </p>
            ) : null}
          </div>
        </div>
      </main>
  );
}


export default function Page(){
  return <Suspense>
    <SwimmingCalendarPage/>
  </Suspense>
}