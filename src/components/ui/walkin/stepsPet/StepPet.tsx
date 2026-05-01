"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";

import type { PetCreateForm } from "@/lib/dogs/dog.type";
import type { PetPicked } from "@/lib/walkin/walkin/types.mock";
import { mapDogApiListToPetPicked } from "@/lib/walkin/walkin/dogToPetPicked";

import PetPickPanel from "./PetPickPanel";
import PetCreatePanel from "./PetCreatePanel";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

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
  /** เรียกหลังสร้างสุนัขสำเร็จ เพื่อล้างฟอร์มเมื่อกลับมาเพิ่มตัวใหม่ */
  onResetCreateForm?: () => void;
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
  onResetCreateForm,
}: Props) {
  const authorizedApi = useAuthorizedApi();
  // ฝั่งลูกค้า: โหลดรายการหมาจาก API GET /dog แล้วแมปเป็น PetPicked สำหรับ PICK MODE
  const [myPets, setMyPets] = useState<PetPicked[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState<string | null>(null);

  const loadPets = useCallback(() => {
    setPetsError(null);
    setPetsLoading(true);
    authorizedApi("/api/dog")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) return Promise.reject(new Error("กรุณาเข้าสู่ระบบ"));
          return res.json().then((b) => Promise.reject(new Error(b.message ?? b.error ?? b.detail ?? res.statusText)));
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setMyPets(mapDogApiListToPetPicked(list));
      })
      .catch((e) => {
        setMyPets([]);
        setPetsError(e instanceof Error ? e.message : "โหลดรายการสุนัขไม่สำเร็จ");
      })
      .finally(() => setPetsLoading(false));
  }, [authorizedApi]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

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
          loading={petsLoading}
          error={petsError}
          onRetry={loadPets}
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
            setMyPets((prev) => [newPet, ...prev]);
            onResetCreateForm?.();
            onTabChange("pick");
          }}
          onBackToPick={() => onTabChange("pick")}
          onLoadPets={loadPets}
        />
      ) : null}
    </section>
  );
}
