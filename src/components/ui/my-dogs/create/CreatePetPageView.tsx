"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TabsHeader from "./TabsHeader";
import StepBasic from "./StepBasic";
import StepHealth from "./StepHealth";

import type { PetCreateForm } from "@/lib/pets/pet.types";
import { buildPetPayload, calcAgeLabel, calcPetSizeByWeight, countMeals, safeNumberString } from "@/lib/pets/pet.utils";

const ORANGE = "#F2A245";

const initialForm: PetCreateForm = {
  imageFile: null,
  imagePreview: "",
  name: "",
  gender: "",
  breed: "",
  color: "",
  weightKg: "",
  heightCm: "",
  size: "เล็ก",
  birthDate: "",
  ageLabel: "-",
  neuterStatus: "ยังไม่เคยทำหมัน",
  microchipStatus: "ไม่มี",
  bloodType: "DEA 1",
  disease: "",
  allergies: "",
  meals: {
    breakfast: false,
    lateMorning: false,
    lunch: false,
    afternoon: false,
    dinner: false,
  },
  mealCount: 0,
  notes: "",
};

export default function CreatePetPageView() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<PetCreateForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const w = safeNumberString(form.weightKg);
    const nextSize = Number.isFinite(w) ? calcPetSizeByWeight(w) : "เล็ก";
    const nextAge = form.birthDate ? calcAgeLabel(form.birthDate) : "-";
    const nextMealCount = countMeals(form.meals);

    setForm((prev) => ({
      ...prev,
      size: nextSize,
      ageLabel: nextAge,
      mealCount: nextMealCount,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.weightKg, form.birthDate, JSON.stringify(form.meals)]);

  const progress = step === 1 ? 50 : 100;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อสัตว์เลี้ยง";
    if (!form.gender) e.gender = "กรุณาเลือกเพศ";
    if (!form.breed.trim()) e.breed = "กรุณาเลือก/ระบุพันธุ์";
    if (!form.weightKg.trim()) e.weightKg = "กรุณากรอกน้ำหนัก";
    if (!form.birthDate) e.birthDate = "กรุณาเลือกวันเกิด";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onNext = () => {
    if (!validateStep1()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canSave = useMemo(() => {
    return !!form.name.trim() && !!form.gender && !!form.breed.trim() && !!form.birthDate;
  }, [form.name, form.gender, form.breed, form.birthDate]);

  const onSave = async () => {
    const payload = buildPetPayload(form);
    console.log("CREATE PET PAYLOAD", payload);
    router.push("/my-dogs");
  };

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <div className="mx-auto w-full max-w-md pt-8">

        {/* Title */}
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">ลงทะเบียนสัตว์เลี้ยง</h1>
          <p className="mt-1 text-sm text-gray-600">กรอกข้อมูลให้ครบเพื่อใช้งานบริการได้สะดวก</p>
        </div>

        {/* Card */}
        <div className="mt-5 rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-5">
          <TabsHeader
            active={step}
            progress={progress}
            leftLabel="ข้อมูลพื้นฐาน"
            rightLabel="สุขภาพและทั่วไป"
          />

          {step === 1 ? (
            <StepBasic form={form} setForm={setForm} errors={errors} />
          ) : (
            <StepHealth form={form} setForm={setForm} />
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-100 bg-[#F7F4E8]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-5">
          {step === 1 ? (
            <button
              type="button"
              onClick={onNext}
              className="w-full rounded-2xl py-3.5 text-base font-extrabold text-white shadow-sm active:scale-[0.99] transition"
              style={{ background: ORANGE }}
            >
              ต่อไป
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-2xl py-3.5 text-base font-extrabold border bg-white active:scale-[0.99] transition"
                style={{ borderColor: ORANGE, color: ORANGE }}
              >
                กลับ
              </button>

              <button
                type="button"
                disabled={!canSave}
                onClick={() => setShowConfirm(true)}
                className={[
                  "w-full rounded-2xl py-3.5 text-base font-extrabold text-white shadow-sm active:scale-[0.99] transition",
                  canSave ? "" : "opacity-50 cursor-not-allowed",
                ].join(" ")}
                style={{ background: ORANGE }}
              >
                บันทึก
              </button>

            </div>
          )}
        </div>
      </div>
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/5 bg-white/70">
              <p className="text-base font-extrabold text-gray-900">
                ยืนยันการบันทึกข้อมูล
              </p>
              <p className="mt-1 text-sm text-black/55">
                ตรวจสอบข้อมูลให้ครบก่อนกดยืนยัน
              </p>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <div className="rounded-2xl bg-[#F7F4E8]/60 ring-1 ring-black/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/60">ชื่อสัตว์เลี้ยง</p>
                  <p className="text-sm font-extrabold text-black/90">
                    {form.name || "-"}
                  </p>
                </div>
                <div className="mt-2 text-xs text-black/45">
                  เพศ: {form.gender || "-"} • พันธุ์: {form.breed || "-"}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
                  onClick={() => setShowConfirm(false)}
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-[#F2A245] py-3 font-extrabold text-white active:scale-[0.99] transition"
                  onClick={() => {
                    setShowConfirm(false);
                    onSave();
                  }}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
