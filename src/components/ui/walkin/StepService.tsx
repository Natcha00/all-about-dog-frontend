"use client";

import { PetPicked, ServiceType } from "@/lib/walkin/walkin/types.mock";
import { useState } from "react";



export default function StepService(props: {
  pets: PetPicked[];
  onBack: () => void;
  onPick: (t: ServiceType) => void;
}) {
  const { pets, onBack, onPick } = props;
  const [open, setOpen] = useState<ServiceType | null>(null);

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">เลือกบริการ</h2>
        <p className="text-sm text-black/50">สุนัขที่เลือก: {pets.length} ตัว</p>
        <p className="mt-1 text-xs text-black/45">{pets.map((p) => p.name).join(", ")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onPick("boarding")}
          className="rounded-3xl px-3 py-4 ring-2 ring-black/10 bg-[#fff7ea] hover:bg-black/[0.03] transition"
        >
          <div className="text-3xl">🏠</div>
          <div className="mt-1 font-extrabold">ฝากเลี้ยง</div>
          <div className="text-xs text-black/45 mt-1">เลือกวันเข้า-ออก + แพ็กเกจ</div>
        </button>

        <button
          type="button"
          onClick={() => onPick("swimming")}
          className="rounded-3xl px-3 py-4 ring-2 ring-black/10 bg-[#fff7ea] hover:bg-black/[0.03] transition"
        >
          <div className="text-3xl">🏊</div>
          <div className="mt-1 font-extrabold">สระว่ายน้ำ</div>
          <div className="text-xs text-black/45 mt-1">เลือกวัน + รอบ + VIP</div>
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
      >
        กลับ
      </button>
    </section>
  );
}
