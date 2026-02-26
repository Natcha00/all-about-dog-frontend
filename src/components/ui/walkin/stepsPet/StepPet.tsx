"use client";

import type React from "react";
import { useMemo, useState } from "react";

import type { PetCreateForm } from "@/lib/dogs/dog.type";
import { MOCK_MY_PETS, type PetPicked } from "@/lib/walkin/walkin/types.mock";

import PetPickPanel from "./PetPickPanel";
import PetCreatePanel from "./PetCreatePanel";

type Props = {
  tab: "pick" | "create";
  onTabChange: (t: "pick" | "create") => void;

  selectedPets: PetPicked[];
  setSelectedPets: React.Dispatch<React.SetStateAction<PetPicked[]>>;

  petForm: PetCreateForm;
  setPetForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;
  petErrors: Record<string, string>;
  setPetErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  onBack: () => void; // ฝั่งลูกค้าอาจไม่ใช้ก็ได้
  onNext: () => void;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function StepPetCustomer({
  tab,
  onTabChange,
  selectedPets,
  setSelectedPets,
  petForm,
  setPetForm,
  petErrors,
  setPetErrors,
  onBack,
  onNext,
}: Props) {
  // ✅ ฝั่งลูกค้า: เก็บ list หมาของฉันไว้ใน state (เพิ่มตัวใหม่แล้วเห็นทันที)
  const [myPets, setMyPets] = useState<PetPicked[]>(MOCK_MY_PETS);

  const canNext = selectedPets.length > 0;

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">สุนัข</h2>
        <p className="text-sm text-black/50">เลือกสุนัขของคุณ หรือเพิ่มสุนัขใหม่</p>
      </div>

      {/* Tab Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTabChange("pick")}
          className={cn(
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            tab === "pick"
              ? "bg-[#fff7ea] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          )}
        >
          เลือกสุนัข
        </button>

        <button
          type="button"
          onClick={() => onTabChange("create")}
          className={cn(
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            tab === "create"
              ? "bg-[#fff7ea] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          )}
        >
          เพิ่มสุนัขใหม่
        </button>
      </div>

      {/* PICK MODE */}
      {tab === "pick" ? (
        <PetPickPanel
          myPets={myPets}
          selectedPets={selectedPets}
          setSelectedPets={setSelectedPets}
          onBack={onBack}
          onNext={onNext}
          canNext={canNext}
          onGoCreate={() => onTabChange("create")}
        />
      ) : null}

      {/* CREATE MODE */}
      {tab === "create" ? (
        <PetCreatePanel
          petForm={petForm}
          setPetForm={setPetForm}
          petErrors={petErrors}
          setPetErrors={setPetErrors}
          onCreated={(newPet) => {
            // ✅ เพิ่มเข้ารายการหมาของฉันทันที
            setMyPets((prev) => [newPet, ...prev]);

            // ✅ auto select
            setSelectedPets((prev) => {
              if (prev.some((x) => x.id === newPet.id)) return prev;
              return [...prev, newPet];
            });

            // ✅ กลับไป pick
            onTabChange("pick");
          }}
          onBackToPick={() => onTabChange("pick")}
        />
      ) : null}
    </section>
  );
}
