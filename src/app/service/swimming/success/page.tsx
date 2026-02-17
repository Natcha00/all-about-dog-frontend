"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PoikaiChip from "@/components/ui/PoikaiChip";
import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";
import type { BookingDraft } from "@/lib/walkin/walkin/types.mock";

function formatThaiDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(t: string) {
  if (!t) return "-";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function SwimmingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const refFromQS = sp.get("ref") || "";
  const date = sp.get("date") || "";
  const roundTime = sp.get("startTime") || sp.get("time") || "";
  const typeRaw = sp.get("type");
  const vipRaw = sp.get("vip");
  const ownerRaw = sp.get("owner") || sp.get("ownerPlay") || "0";
  const pets = sp.get("pets") || "";
  const total = Number(sp.get("total") || "0");

  const [refFallback, setRefFallback] = useState("");
  useEffect(() => {
    if (!refFromQS) setRefFallback(sessionStorage.getItem("swim_last_ref") || "");
  }, [refFromQS]);

  const ref = refFromQS || refFallback;

  const isVip = typeRaw === "premium" ? true : vipRaw === "1";
  const typeLabel = isVip ? "พรีเมียม" : "ปกติ";
  const ownerLabel = ownerRaw === "1" ? "ใช่ (ฟรี)" : "ไม่";

  const petNameMap: Record<string, string> = { "1": "อังเปา", "2": "อัลมอนด์", "3": "โลมา" };

  const petText = useMemo(() => {
    if (!pets) return "-";
    const ids = pets.split(",").map((x) => x.trim()).filter(Boolean);
    if (ids.length === 0) return "-";
    return (
      <ol className="space-y-1 list-decimal pl-5">
        {ids.map((id) => (
          <li key={id} className="text-gray-800">
            <span className="font-semibold">{petNameMap[id] ?? `ID ${id}`}</span>
          </li>
        ))}
      </ol>
    );
  }, [pets]);

  // ✅ สำคัญ: ส่ง booking ให้ SuccessSummaryCard เพื่อไปโหลด note
  const booking: BookingDraft = {
    serviceType: "swimming",
    date,
    time: roundTime,
    isVip,
    ownerPlay: ownerRaw === "1",
    total,
  };

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <SuccessHeader serviceLabel="บริการสระว่ายน้ำ" title="รายละเอียดการจอง" />

      <div className="mx-auto w-full max-w-md space-y-4">
        <SuccessSummaryCard
          title="รายละเอียดการจอง"
          subtitle="ตรวจสอบข้อมูลก่อนกลับหน้า service"
          rows={[
            { label: "รายการจอง", value: ref || "-" },
            { label: "วันที่ใช้บริการ", value: formatThaiDate(date) },
            { label: "รอบเวลา", value: formatTime(roundTime) },
            { label: "ประเภท", value: <PoikaiChip tone="neutral">{typeLabel}</PoikaiChip> },
            {
              label: "เจ้าของลงเล่น",
              value: (
                <PoikaiChip tone={ownerRaw === "1" ? "success" : "neutral"}>
                  {ownerLabel}
                </PoikaiChip>
              ),
            },
          ]}
          selectedTitle="สัตว์ที่เลือก"
          selectedContent={petText}
          totalValue={`${total.toLocaleString("th-TH")} บาท`}
          booking={booking}
          refCode={ref || "-"}
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

export default function Page() {
  return (
    <Suspense>
      <SwimmingSuccessPage />
    </Suspense>
  );
}
