"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PoikaiChip from "@/components/ui/PoikaiChip";

import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";

import type { BookingDraft } from "@/lib/walkin/walkin/types.mock";

function BoardingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const ref = sp.get("ref") || "-";
  const pets = sp.get("pets") || "";
  const start = sp.get("start") || "";
  const end = sp.get("end") || "";
  const startTime = sp.get("startTime") || "";
  const endTime = sp.get("endTime") || "";
  const nights = sp.get("nights") || "1";
  const plan = sp.get("plan") || "1";
  const total = Number(sp.get("total") || "0");

  const petList = useMemo(() => {
    if (!pets) return [];
    return pets.split(",").filter(Boolean);
  }, [pets]);

  const planLabel =
    plan === "2"
      ? "แบบ 2 : นอนด้วยกัน"
      : plan === "3"
      ? "แบบ 3 : VIP"
      : "แบบ 1 : มาตรฐาน";

  // ✅ สร้าง booking draft เพื่อส่งให้ SuccessSummaryCard ไปโหลด note
  const booking: BookingDraft = {
    serviceType: "boarding",
    start,
    end,
    startTime,
    endTime,
    plan: Number(plan) as 1 | 2 | 3,
    total,
  };

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <SuccessHeader serviceLabel="บริการฝากเลี้ยง" />

      <div className="mx-auto w-full max-w-md space-y-4">
        <SuccessSummaryCard
          rows={[
            ...(ref ? [{ label: "รายการจอง", value: ref }] : []),
            { label: "วันเข้า", value: start || "-" },
            { label: "วันออก", value: end || "-" },
            { label: "เวลาเข้า", value: startTime || "-" },
            { label: "เวลารับกลับ", value: endTime || "-" },
            {
              label: "จำนวนคืน",
              value: <PoikaiChip tone="success">{nights} คืน</PoikaiChip>,
            },
            { label: "แพ็กเกจ", value: planLabel },
          ]}
          // selectedContent={petList.length > 0 ? petList.join(", ") : "-"}
          totalValue={`${total.toLocaleString()} บาท`}
          booking={booking}  
        />

        <button
          type="button"
          className="w-full rounded-2xl bg-[#F0A23A] py-4 text-xl font-bold text-white active:scale-[0.98] transition"
          onClick={() => router.push("/service")}
        >
          กลับไปหน้าบริการ
        </button>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <BoardingSuccessPage />
    </Suspense>
  );
}
