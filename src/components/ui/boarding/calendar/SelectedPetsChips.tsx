import React from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import { PawPrint } from "lucide-react";

export type SelectedPet = {
  id: number;
  name: string;
  image: string;
};

export default function SelectedPetsChips({ pets }: { pets: SelectedPet[] }) {
  return (
    <PoikaiCard
      title="สัตว์ที่เลือก"
      subtitle="รายการสัตว์ที่ทำรายการฝากเลี้ยง"
      icon={<PawPrint className="w-5 h-5 text-[#399199]" />}
    >
      <div className="flex flex-wrap gap-2">
        {pets.length ? (
          pets.map((p) => (
            <div
              key={p.id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 ring-1 ring-gray-100"
            >
              <img
                src={p.image}
                alt={p.name}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
              />
              <span className="text-sm font-semibold text-gray-900">{p.name}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">ยังไม่ได้เลือกสัตว์เลี้ยง</p>
        )}
      </div>
    </PoikaiCard>
  );
}
