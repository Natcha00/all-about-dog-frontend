"use client";

import type React from "react";
import { useEffect, useState } from "react";

import StepBasic from "../StepBasic";
import StepHealth from "../StepHealth";
import type { PetCreateForm } from "@/lib/dogs/dog.type";
import type { PetPicked } from "@/lib/walkin/walkin/types.mock";
import { buildCreateDogBody } from "@/lib/walkin/walkin/createDogApi";
import { isDoubleCoatOnlyBreed, sortByThaiName } from "@/lib/dogs/dog.utills";
import { mapDogApiItemToPetPicked } from "@/lib/walkin/walkin/dogToPetPicked";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import type { BreedOption } from "../StepBasic";
import TabsHeader from "../TabsHeader";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

type Props = {
  petForm: PetCreateForm;
  setPetForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;

  petErrors: Record<string, string>;
  setPetErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  onCreated: (newPet: PetPicked) => void;
  onBackToPick: () => void;
  onLoadPets?: () => void; // refetch list after create (optional)
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
  onLoadPets,
}: Props) {
  const authorizedApi = useAuthorizedApi();
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [breeds, setBreeds] = useState<BreedOption[]>([]);

  useEffect(() => {
    authorizedApi("/api/dog/breeds")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: BreedOption[]) => setBreeds(Array.isArray(data) ? sortByThaiName(data) : []))
      .catch(() => setBreeds([]));
  }, [authorizedApi]);

  const validatePetBasic = () => {
    // พันธุ์ที่ต้องเป็นขนสองชั้นเสมอ — sync form ก่อน validate
    const breedOption = breeds.find((b) => String(b.id) === petForm.breed);
    if (breedOption?.nameTh && isDoubleCoatOnlyBreed(breedOption.nameTh)) {
      if (petForm.coatType !== "ขนสองชั้น") {
        setPetForm((p) => ({ ...p, coatType: "ขนสองชั้น" }));
      }
    }

    const e: Record<string, string> = {};
    if (!petForm.name.trim()) e.name = "กรุณากรอกชื่อสัตว์เลี้ยง";
    if (!petForm.gender) e.gender = "กรุณาเลือกเพศ";
    if (!petForm.breed.trim()) e.breed = "กรุณาเลือก/ระบุพันธุ์";
    const effectiveCoatType =
      breedOption?.nameTh && isDoubleCoatOnlyBreed(breedOption.nameTh)
        ? "ขนสองชั้น"
        : petForm.coatType;
    if (!effectiveCoatType || !["ขนสั้น", "ขนยาว", "ขนสองชั้น"].includes(effectiveCoatType)) {
      e.coatType = "กรุณาเลือกประเภทขน";
    }

    if (!petForm.weightKg.trim()) {
      e.weightKg = "กรุณากรอกน้ำหนัก";
    } else if (!Number.isFinite(Number(petForm.weightKg)) || Number(petForm.weightKg) <= 0) {
      e.weightKg = "กรุณากรอกน้ำหนักเป็นตัวเลขที่ถูกต้อง";
    }

    if (petForm.birthDate && isFutureBirthISO(petForm.birthDate)) {
      e.birthDate = "วันเกิดต้องไม่เกินวันนี้";
    }

    setPetErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildNewPet = (): PetPicked => {
    const id = Math.floor(Date.now() % 1000000);
    const breedName = breeds.find((b) => b.id === Number(petForm.breed))?.nameTh ?? undefined;
    return {
      id,
      name: petForm.name.trim(),
      size: toPickedSize(petForm.size),
      breed: breedName ?? (petForm.breed.trim() || undefined),
      weightKg: safeWeightKg(petForm.weightKg),
    };
  };

  const validatePetHealth = (): boolean => {
    const e: Record<string, string> = {};
    if (!petForm.neuterStatus) e.neuterStatus = "กรุณาเลือกประวัติการทำหมัน";
    if (!petForm.microchipStatus) e.microchipStatus = "กรุณาเลือกการฝังไมโครชิป";
    const hasMeal = Object.values(petForm.meals).some(Boolean);
    if (!hasMeal) e.meals = "กรุณาเลือกอย่างน้อย 1 มื้ออาหาร";
    setPetErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const handleSubmitCreate = async () => {
    setSubmitError(null);
    if (!validatePetHealth()) return;
    const breedOption = breeds.find((b) => String(b.id) === petForm.breed);
    const effectiveCoatType =
      breedOption?.nameTh && isDoubleCoatOnlyBreed(breedOption.nameTh)
        ? "ขนสองชั้น"
        : petForm.coatType;
    const formToSend = { ...petForm, coatType: effectiveCoatType };
    const body = buildCreateDogBody(formToSend);
    if (!body) {
      setPetErrors((e) => ({ ...e, breed: "กรุณาเลือกพันธุ์จากรายการ" }));
      return;
    }

    setSubmitting(true);
    try {
      const res = await authorizedApi("/api/create-dog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.detail ?? data.error ?? "สร้างสุนัขไม่สำเร็จ";
        const extra = [data.hint, data.url].filter(Boolean).join("\n");
        setSubmitError(extra ? `${msg}\n${extra}` : msg);
        return;
      }

      const newPet = mapDogApiItemToPetPicked(data as DogApiItem);
      setCreateStep(1);
      onLoadPets?.();
      onCreated(newPet);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "สร้างสุนัขไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
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
        <StepBasic form={petForm} setForm={setPetForm} errors={petErrors} breeds={breeds} />
      ) : (
        <StepHealth form={petForm} setForm={setPetForm} errors={petErrors} />
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
            disabled={submitting}
            onClick={handleSubmitCreate}
            className="w-full rounded-2xl py-3 font-extrabold text-white bg-[#F0A23A] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "กำลังสร้าง..." : "สร้างสุนัขใหม่"}
          </button>
        </div>
      )}

      {submitError ? (
        <p className="text-sm text-red-600 text-center whitespace-pre-line">{submitError}</p>
      ) : null}

     
    </div>
  );
}
