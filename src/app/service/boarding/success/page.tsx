"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PoikaiChip from "@/components/ui/PoikaiChip";

import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";

export default function BoardingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const ref = sp.get("ref") || "-"; // optional
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
    plan === "2" ? "แบบ 2 : นอนด้วยกัน" : plan === "3" ? "แบบ 3 : VIP" : "แบบ 1 : มาตรฐาน";

  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-10 pb-32">
      <SuccessHeader serviceLabel="บริการฝากเลี้ยง" />

      <div className="mx-auto w-full max-w-md space-y-4">
        <SuccessSummaryCard
          rows={[
            ...(ref ? [{ label: "รายการจอง", value: ref }] : []),
            { label: "วันเข้า", value: start || "-" },
            { label: "วันออก", value: end || "-" },
            { label: "เวลาเข้า", value: startTime || "-" },
            { label: "เวลารับกลับ", value: endTime || "-" },
            { label: "จำนวนคืน", value: <PoikaiChip tone="success">{nights} คืน</PoikaiChip> },
            { label: "แพ็กเกจ", value: planLabel },
          ]}
          selectedContent={petList.length > 0 ? petList.join(", ") : "-"}
          totalValue={`${total.toLocaleString()} บาท`}
        />

        <button
          type="button"
          className="w-full rounded-2xl bg-[#F0A23A] py-4 text-xl font-bold text-white"
          onClick={() => router.push("/service")}
        >
          กลับไปหน้าบริการ
        </button>
      </div>
    </main>
  );
}
