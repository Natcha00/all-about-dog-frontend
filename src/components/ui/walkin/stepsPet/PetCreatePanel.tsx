"use client";

import type React from "react";
import { useState } from "react";

import StepBasic from "../StepBasic";
import StepHealth from "../StepHealth";
import type { PetCreateForm } from "@/lib/dogs/dog.type";
import type { PetPicked } from "@/lib/walkin/walkin/types.mock";
import TabsHeader from "../TabsHeader";

type Props = {
  petForm: PetCreateForm;
  setPetForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;

  petErrors: Record<string, string>;
  setPetErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  onCreated: (newPet: PetPicked) => void;
  onBackToPick: () => void;
};

function toPickedSize(sizeTh: PetCreateForm["size"]): "small" | "large" {
  return sizeTh === "ใหญ่" ? "large" : "small";
}

function safeWeightKg(weightKgStr: string): number | undefined {
  const n = Number(weightKgStr);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

/** ✅ ใช้ตรวจวันเกิดอนาคต (birthDate จาก input date เป็น ISO) */
function isFutureBirthISO(birthISO: string): boolean {
  if (!birthISO) return false;
  const birth = new Date(`${birthISO}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  return birth > new Date();
}

export default function PetCreatePanel({
  petForm,
  setPetForm,
  petErrors,
  setPetErrors,
  onCreated,
  onBackToPick,
}: Props) {
  const [createStep, setCreateStep] = useState<1 | 2>(1);

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

    if (!petForm.birthDate) {
      e.birthDate = "กรุณาเลือกวันเกิด";
    } else if (isFutureBirthISO(petForm.birthDate)) {
      e.birthDate = "วันเกิดต้องไม่เกินวันนี้";
    }

    setPetErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildNewPet = (): PetPicked => {
    const id = Math.floor(Date.now() % 1000000);

    return {
      id,
      name: petForm.name.trim(),
      size: toPickedSize(petForm.size),
      breed: petForm.breed.trim() || undefined,
      weightKg: safeWeightKg(petForm.weightKg),
    };
  };

  return (
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
            onClick={onBackToPick}
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
            onClick={() => {
              const newPet = buildNewPet();
              onCreated(newPet);
              setCreateStep(1);
            }}
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
  );
}
