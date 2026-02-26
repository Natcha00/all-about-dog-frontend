"use client";

import type React from "react";
import type { PetPicked } from "@/lib/walkin/walkin/types.mock";

type Props = {
  myPets: PetPicked[];

  selectedPets: PetPicked[];
  setSelectedPets: React.Dispatch<React.SetStateAction<PetPicked[]>>;

  onBack: () => void;
  onNext: () => void;
  canNext: boolean;

  onGoCreate: () => void;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function PetPickPanel({
  myPets,
  selectedPets,
  setSelectedPets,
  onBack,
  onNext,
  canNext,
  onGoCreate,
}: Props) {
  const togglePet = (p: PetPicked) => {
    setSelectedPets((prev) =>
      prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p],
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl ring-1 ring-black/10 bg-white overflow-hidden">
        <div className="px-4 py-3 text-xs font-extrabold text-black/50 bg-black/[0.03]">
          สุนัขของฉัน ({myPets.length})
        </div>

        {myPets.length === 0 ? (
          <div className="px-4 py-4 text-sm text-black/60">
            ยังไม่มีสุนัขในระบบ → กด “เพิ่มสุนัขใหม่”
            <div className="mt-3">
              <button
                type="button"
                onClick={onGoCreate}
                className="rounded-xl bg-[#F0A23A] px-4 py-2 text-sm font-extrabold text-white active:scale-[0.99] transition"
              >
                เพิ่มสุนัขใหม่
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/5 overflow-y-auto max-h-56">
            {myPets.map((p) => {
              const active = selectedPets.some((x) => x.id === p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePet(p)}
                  className={cn(
                    "w-full px-4 py-4 text-left transition",
                    active ? "bg-[#fff7ea]" : "bg-white hover:bg-black/[0.03]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-black/45">
                        size: {p.size} • {p.breed ?? "-"} • {p.weightKg ?? "-"} kg • id: {p.id}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 h-6 w-6 rounded-md ring-2 grid place-items-center text-xs font-extrabold",
                        active ? "bg-[#F0A23A] ring-[#F0A23A] text-white" : "bg-white ring-black/15 text-black/40",
                      )}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4 text-sm text-black/60">
        เลือกแล้ว: <b className="text-black">{selectedPets.length}</b> ตัว
        {selectedPets.length ? (
          <div className="mt-2 text-xs text-black/50">{selectedPets.map((p) => p.name).join(", ")}</div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
        >
          กลับ
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={cn(
            "w-full rounded-2xl py-3 font-extrabold text-white active:scale-[0.99] transition",
            canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
          )}
        >
          ต่อไป
        </button>
      </div>

      {!canNext ? <p className="text-xs text-rose-600 text-center">กรุณาเลือกสุนัขอย่างน้อย 1 ตัว</p> : null}
    </div>
  );
}
