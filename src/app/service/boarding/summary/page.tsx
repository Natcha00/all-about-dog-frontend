"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import BoardingSummary from "@/components/ui/boarding/summary/BoardingSummary";
import type { Pet, PriceConfig } from "@/lib/boarding/boarding.logic";
import { DEFAULT_PRICE } from "@/lib/boarding/boarding.logic";
import {
  filterSelectedPetsByIds,
  readSelectedPetsFromSession,
} from "@/lib/boarding/selectedPetsSession";

// type StoredPet = {
//   id: number;
//   name: string;
//   image: string;
//   size: "small" | "large" | string; // เผื่อหลุดมาเป็น string
// };

// function safeParseSelectedPets(): StoredPet[] {
//   try {
//     const raw = sessionStorage.getItem("selectedPets");
//     if (!raw) return [];
//     const arr = JSON.parse(raw);
//     return Array.isArray(arr) ? (arr as StoredPet[]) : [];
//   } catch {
//     return [];
//   }
// }

function BoardingSummaryPage() {
  const sp = useSearchParams();

  const petsParam = sp.get("pets") || "";
  const petIds = useMemo(() => {
    return petsParam
      ? petsParam
          .split(",")
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];
  }, [petsParam]);

  const startDate = sp.get("start") || "";
  const endDate = sp.get("end") || "";
  const startTime = sp.get("startTime") || "";
  const endTime = sp.get("endTime") || "";
  const nightsRaw = Number(sp.get("nights") || 1);
  const nights = Number.isFinite(nightsRaw) && nightsRaw > 0 ? nightsRaw : 1;

  const planParam = Number(sp.get("plan") || 1);
  const initialPlan: 1 | 2 | 3 = planParam === 2 ? 2 : planParam === 3 ? 3 : 1;

  // ✅ ใช้ข้อมูลจริงจาก sessionStorage
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    // const stored = safeParseSelectedPets();

    // // เอาเฉพาะตัวที่อยู่ใน query petIds
    // const filtered = stored.filter((p) => petIds.includes(p.id));

    // // แปลง size ให้เป็น union ที่ logic ต้องการ
    // const mapped: Pet[] = filtered
    //   .map((p) => {
    //     const size = p.size === "small" ? "small" : p.size === "large" ? "large" : null;
    //     if (!size) return null;
    //     return { id: p.id, name: p.name, size };
    //   })
    //   .filter(Boolean) as Pet[];
    const storedAll = readSelectedPetsFromSession();
    const stored = filterSelectedPetsByIds(storedAll, petIds);

    const mapped: Pet[] = stored.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size, // "small" | "large" ตรง type อยู่แล้ว
    }));

    // fallback: ถ้า session ไม่มีข้อมูล (เช่น refresh หน้าตรง ๆ)
    const fallback: Pet[] = petIds.map((id) => ({
      id,
      name: undefined,
      size: id % 2 === 0 ? "small" : "large",
    }));

    setPets(mapped.length > 0 ? mapped : fallback);
  }, [petIds]);

  // ✅ ราคา: ใช้ default หรือส่ง config เองก็ได้
  const priceConfig: PriceConfig = DEFAULT_PRICE;

  return (
      <BoardingSummary
        pets={pets}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        nights={nights}
        initialPlan={initialPlan}
        priceConfig={priceConfig}
      />
  );
}


export default function Page(){
  return <Suspense>
    <BoardingSummaryPage/>
  </Suspense>
}