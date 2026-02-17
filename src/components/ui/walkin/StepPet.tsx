// src/app/(customer)/booking/_steps/StepPet.tsx
"use client";

import type React from "react";
import { useMemo, useState } from "react";

import StepBasic from "./StepBasic";
import TabsHeader from "./TabsHeader";
import StepHealth from "./StepHealth";

import { MOCK_MY_PETS, type PetPicked } from "@/lib/walkin/walkin/types.mock";
import type { PetCreateForm } from "@/lib/dogs/dog.type";

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

function toPickedSize(sizeTh: PetCreateForm["size"]): "small" | "large" {
  return sizeTh === "ใหญ่" ? "large" : "small";
}

function safeWeightKg(weightKgStr: string): number | undefined {
  const n = Number(weightKgStr);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
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
  const [createStep, setCreateStep] = useState<1 | 2>(1);

  // ✅ ฝั่งลูกค้า: เก็บ list หมาของฉันไว้ใน state (เพิ่มตัวใหม่แล้วเห็นทันที)
  const [myPets, setMyPets] = useState<PetPicked[]>(MOCK_MY_PETS);

  const customerPets = useMemo<PetPicked[]>(() => myPets, [myPets]);

  const togglePet = (p: PetPicked) => {
    setSelectedPets((prev) =>
      prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p],
    );
  };

  const validatePetBasic = () => {
    const e: Record<string, string> = {};
    if (!petForm.name.trim()) e.name = "กรุณากรอกชื่อสัตว์เลี้ยง";
    if (!petForm.gender) e.gender = "กรุณาเลือกเพศ";
    if (!petForm.breed.trim()) e.breed = "กรุณาเลือก/ระบุพันธุ์";

    if (!petForm.weightKg.trim()) {
      e.weightKg = "กรุณากรอกน้ำหนัก";
    } else if (!Number.isFinite(Number(petForm.weightKg)) || Number(petForm.weightKg) <= 0) {
      e.weightKg = "กรุณากรอกน้ำหนักเป็นตัวเลขที่ถูกต้อง";
    }

    if (!petForm.birthDate) e.birthDate = "กรุณาเลือกวันเกิด";

    setPetErrors(e);
    return Object.keys(e).length === 0;
  };

  const createNewPet = () => {
    const id = Math.floor(Date.now() % 1000000);

    const newPet: PetPicked = {
      id,
      name: petForm.name.trim(),
      size: toPickedSize(petForm.size),
      breed: petForm.breed.trim() || undefined,
      weightKg: safeWeightKg(petForm.weightKg),
    };

    // ✅ เพิ่มเข้ารายการหมาของฉันทันที
    setMyPets((prev) => [newPet, ...prev]);

    // ✅ auto select
    setSelectedPets((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
      return [...prev, newPet];
    });

    setCreateStep(1);
    onTabChange("pick");
  };

  const canNext = selectedPets.length > 0;

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">สุนัข</h2>
        <p className="text-sm text-black/50">เลือกสุนัขของคุณ หรือเพิ่มสุนัขใหม่</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTabChange("pick")}
          className={[
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            tab === "pick"
              ? "bg-[#F7F4E8] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          ].join(" ")}
        >
          เลือกสุนัข
        </button>

        <button
          type="button"
          onClick={() => onTabChange("create")}
          className={[
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            tab === "create"
              ? "bg-[#F7F4E8] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          ].join(" ")}
        >
          เพิ่มสุนัขใหม่
        </button>
      </div>

      {/* PICK MODE */}
      {tab === "pick" ? (
        <div className="space-y-4">
          <div className="rounded-2xl ring-1 ring-black/10 bg-white overflow-hidden">
            <div className="px-4 py-3 text-xs font-extrabold text-black/50 bg-black/[0.03]">
              สุนัขของฉัน ({customerPets.length})
            </div>

            {customerPets.length === 0 ? (
              <div className="px-4 py-4 text-sm text-black/60">
                ยังไม่มีสุนัขในระบบ → กด “เพิ่มสุนัขใหม่”
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {customerPets.map((p) => {
                  const active = selectedPets.some((x) => x.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePet(p)}
                      className={[
                        "w-full px-4 py-4 text-left transition",
                        active ? "bg-[#F7F4E8]" : "bg-white hover:bg-black/[0.03]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-black/45">
                            size: {p.size} • {p.breed ?? "-"} • {p.weightKg ?? "-"} kg • id: {p.id}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 h-6 w-6 rounded-md ring-2 grid place-items-center text-xs font-extrabold",
                            active
                              ? "bg-[#F0A23A] ring-[#F0A23A] text-white"
                              : "bg-white ring-black/15 text-black/40",
                          ].join(" ")}
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
              className={[
                "w-full rounded-2xl py-3 font-extrabold text-white active:scale-[0.99] transition",
                canNext ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
              ].join(" ")}
            >
              ต่อไป
            </button>
          </div>

          {!canNext ? <p className="text-xs text-rose-600 text-center">กรุณาเลือกสุนัขอย่างน้อย 1 ตัว</p> : null}
        </div>
      ) : null}

      {/* CREATE MODE */}
      {tab === "create" ? (
        <div className="space-y-4">
          <TabsHeader
            active={createStep}
            progress={createStep === 1 ? 50 : 100}
            leftLabel="ข้อมูลพื้นฐาน"
            rightLabel="สุขภาพและทั่วไป"
          />

          {createStep === 1 ? (
            <StepBasic form={petForm} setForm={setPetForm} errors={petErrors} />
          ) : (
            <StepHealth form={petForm} setForm={setPetForm} />
          )}

          {createStep === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onTabChange("pick")}
                className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
              >
                กลับไปเลือกสุนัข
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!validatePetBasic()) return;
                  setCreateStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full rounded-2xl py-3 font-extrabold text-white bg-[#F0A23A] active:scale-[0.99] transition"
              >
                ต่อไป
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreateStep(1)}
                className="w-full rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
              >
                กลับ
              </button>

              <button
                type="button"
                onClick={createNewPet}
                className="w-full rounded-2xl py-3 font-extrabold text-white bg-[#F0A23A] active:scale-[0.99] transition"
              >
                สร้างสุนัขใหม่ + เลือก
              </button>
            </div>
          )}

          <p className="text-xs text-black/45 text-center">
            * เมื่อสร้างสำเร็จ ระบบจะ “เพิ่มเข้ารายการที่เลือก” ให้อัตโนมัติ
          </p>
        </div>
      ) : null}
    </section>
  );
}
