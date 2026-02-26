// src/app/(customer)/booking/WalkInWizard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import StepService from "./StepService";
import StepBoarding from "./StepBoarding";
import StepSwimming from "./StepSwimming";
import StepConfirm from "./StepConfirm";
import StepSuccess from "./StepSuccess";

import type { PetCreateForm } from "@/lib/dogs/dog.type";
import {
  calcAgeLabel,
  calcPetSizeByWeight,
  countMeals,
  safeNumberString,
} from "@/lib/dogs/dog.utills";

import type {
  BookingDraft,
  CustomerDraft,
  PetPicked,
  ServiceType,
} from "@/lib/walkin/walkin/types.mock";
import { EMPTY_CUSTOMER } from "@/lib/walkin/walkin/types.mock";
import ServiceRulesModal from "./ServiceRulesModal";
import StepPetCustomer from "./stepsPet/StepPet";

type Step = "pet" | "service" | "boarding" | "swimming" | "confirm" | "success";

const initialPetForm: PetCreateForm = {
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

export default function WalkInWizardCustomer() {
  const [step, setStep] = useState<Step>("pet");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ✅ ฝั่งลูกค้า: ไม่ต้องมี customer step (ใช้ profile ที่ login อยู่แล้ว)
  // แต่ StepPet ของคุณยังรับ customer/customerId อยู่ → ส่ง dummy ให้ใช้ได้ทันที
  const [customer] = useState<CustomerDraft>(EMPTY_CUSTOMER);
  const [customerId] = useState<string>("self");

  // pet (multi)
  const [selectedPets, setSelectedPets] = useState<PetPicked[]>([]);
  const [petTab, setPetTab] = useState<"pick" | "create">("pick");

  // create pet form state (เก็บบน wizard → ย้อนกลับไม่หาย)
  const [petForm, setPetForm] = useState<PetCreateForm>(initialPetForm);
  const [petErrors, setPetErrors] = useState<Record<string, string>>({});

  // service
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);

  // booking draft
  const [booking, setBooking] = useState<BookingDraft | null>(null);

  // success
  const [successRef, setSuccessRef] = useState("");

  const canGoService = selectedPets.length > 0;
  const canGoConfirm = !!serviceType && !!booking;
  const [showRules, setShowRules] = useState(true);

  // ✅ progress สำหรับ 3 tabs (สุนัข/บริการ/ยืนยัน)
  const progress = useMemo(() => {
    const map: Record<Step, number> = {
      pet: 33,
      service: 66,
      boarding: 66,
      swimming: 66,
      confirm: 100,
      success: 100,
    };
    return map[step];
  }, [step]);

  // ✅ auto compute pet derived fields (size/age/mealCount)
  useMemo(() => {
    const w = safeNumberString(petForm.weightKg);
    const nextSize = Number.isFinite(w) ? calcPetSizeByWeight(w) : "เล็ก";
    const nextAge = petForm.birthDate ? calcAgeLabel(petForm.birthDate) : "-";
    const nextMealCount = countMeals(petForm.meals);

    if (
      petForm.size !== nextSize ||
      petForm.ageLabel !== nextAge ||
      petForm.mealCount !== nextMealCount
    ) {
      setPetForm((prev) => ({
        ...prev,
        size: nextSize,
        ageLabel: nextAge,
        mealCount: nextMealCount,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petForm.weightKg, petForm.birthDate, JSON.stringify(petForm.meals)]);

  const resetAll = () => {
    setStep("pet");
    setSelectedPets([]);
    setPetTab("pick");
    setPetForm(initialPetForm);
    setPetErrors({});
    setServiceType(null);
    setBooking(null);
    setSuccessRef("");
  };



  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      {/* Header + Step bar */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Booking</h1>
        <p className="mt-1 text-sm text-black/50">เลือกสุนัข / เลือกบริการ / ยืนยัน</p>
      </div>

      <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-4">
        <div className="flex items-center justify-between text-xs font-extrabold text-black/45">
          <span className={step === "pet" ? "text-black" : ""}>1 สุนัข</span>
          <span className={step === "service" ? "text-black" : ""}>2 บริการ</span>
          <span className={step === "confirm" ? "text-black" : ""}>3 ยืนยัน</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-black/5 overflow-hidden">
          <div className="h-full bg-[#F0A23A] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ServiceRulesModal open={showRules} onClose={() => setShowRules(false)} />

      {/* Step 1: Pet */}
      {step === "pet" && (
        <StepPetCustomer
          tab={petTab}
          onTabChange={setPetTab}
          selectedPets={selectedPets}
          setSelectedPets={setSelectedPets}
          petForm={petForm}
          setPetForm={setPetForm}
          petErrors={petErrors}
          setPetErrors={setPetErrors}
          onBack={() => {
            // ✅ ฝั่งลูกค้า: ไม่มี step ก่อนหน้า
            // จะทำเป็นปุ่ม "ยกเลิก" ก็ได้ แต่ตอนนี้ไม่ทำอะไร
          }}
          onNext={() => {
            if (!canGoService) return;
            setStep("service");
          }}
        />
      )}

      {/* Step 2: Service */}
      {step === "service" && (
        <StepService
          pets={selectedPets}
          onBack={() => setStep("pet")}
          onPick={(t) => {
            setServiceType(t);
            setStep(t); // "boarding" | "swimming"
          }}
        />
      )}

      {/* Step 3A: Boarding */}
      {step === "boarding" && serviceType === "boarding" && (
        <StepBoarding
          pets={selectedPets}
          onBack={() => setStep("service")}
          onNext={(draft) => {
            setBooking(draft);
            setStep("confirm");
          }}
        />
      )}

      {/* Step 3B: Swimming */}
      {step === "swimming" && serviceType === "swimming" && (
        <StepSwimming
          pets={selectedPets}
          onBack={() => setStep("service")}
          onNext={(draft) => {
            setBooking(draft);
            setStep("confirm");
          }}
        />
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && canGoConfirm && (
        <StepConfirm
          customer={customer}
          customerId={customerId}
          pets={selectedPets}
          booking={booking!}
          onBack={() => setStep(serviceType === "boarding" ? "boarding" : "swimming")}
          onConfirm={(ref) => {
            setSuccessRef(ref);
            setStep("success");
          }}
        />
      )}

      {/* Step 5: Success */}
      {step === "success" && <StepSuccess refCode={successRef || "-"} onReset={resetAll} />}

      {/* Guards */}
      {["service", "boarding", "swimming", "confirm"].includes(step) && selectedPets.length === 0 ? (
        <p className="text-xs text-rose-600 text-center">ยังไม่ได้เลือกสุนัข (ต้องเลือกอย่างน้อย 1 ตัว)</p>
      ) : null}
    </div>
  );
}
