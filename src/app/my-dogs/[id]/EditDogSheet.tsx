"use client";

import React, { useEffect, useState } from "react";
import type { DogProfileApiResponse } from "@/lib/dogs/dog.type";
import type { UpdateDogBody } from "@/lib/dogs/dog.type";
import type { CoatTypeValue } from "@/lib/dogs/dog.type";
import { toDateInputValue } from "@/lib/date/date.utils";
import type { BreedOption } from "@/app/api/dog/breeds/route";
import type { MealKey } from "@/lib/dogs/dog.type";

type CoatTypeOption = { value: string; label: string };
type BloodGroupOption = { value: string; label: string };

/** Form state for edit — ใช้เทียบกับ initial เพื่อส่งเฉพาะที่เปลี่ยน */
export type EditDogFormState = {
  name: string;
  gender: "male" | "female";
  breedId: string;
  color: string;
  coatType: CoatTypeValue | "";
  weight: string;
  height: string;
  birthdate: string;
  // health
  sterilization: boolean;
  microchip: boolean;
  bloodType: string;
  underlyingDisease: string;
  allergy: string;
  detail: string;
  hasBreakfast: boolean;
  hasAfterBreakfast: boolean;
  hasLunch: boolean;
  hasAfterLunch: boolean;
  hasDinner: boolean;
};

function getInitialFormFromProfile(profile: DogProfileApiResponse): EditDogFormState {
  const g = profile.profile.general;
  const c = profile.profile.careInfo;
  const feeding = c.feedingTime;
  return {
    name: g.name || "",
    gender: g.gender?.includes("ผู้") ? "male" : "female",
    breedId: "", // จะ set จาก breeds list โดย match ชื่อพันธุ์
    color: g.color || "",
    coatType: (g.coatType?.trim() as CoatTypeValue) || "",
    weight: String(g.weightKg ?? ""),
    height: String(g.heightCm ?? ""),
    birthdate: toDateInputValue(g.birthday) || "",
    sterilization: c.sterilized,
    microchip: c.microchip,
    bloodType: c.bloodType || "",
    underlyingDisease: c.disease || "",
    allergy: c.allergy?.trim() || "",
    detail: profile.profile.extraNote?.trim() || "",
    hasBreakfast: feeding.hasBreakfast,
    hasAfterBreakfast: feeding.hasAfterBreakfast,
    hasLunch: feeding.hasLunch,
    hasAfterLunch: feeding.hasAfterLunch,
    hasDinner: feeding.hasDinner,
  };
}

function buildPartialUpdateBody(
  initial: EditDogFormState,
  current: EditDogFormState
): UpdateDogBody {
  const body: UpdateDogBody = {};

  if (current.name !== initial.name) body.name = current.name.trim();
  if (current.gender !== initial.gender) body.gender = current.gender === "male" ? "male" : "female";
  const breedIdNum = current.breedId.trim() ? Number(current.breedId) : undefined;
  if (breedIdNum != null && Number.isFinite(breedIdNum) && breedIdNum !== Number(initial.breedId)) {
    body.breedId = breedIdNum;
  }
  if (current.color !== initial.color) body.color = current.color.trim();
  if (current.coatType !== initial.coatType && current.coatType) {
    body.coatType = current.coatType as CoatTypeValue;
  }
  const weightNum = Number(current.weight.trim());
  if (current.weight !== initial.weight && Number.isFinite(weightNum) && weightNum >= 0) {
    body.weight = weightNum;
  }
  const heightNum = Number(current.height.trim());
  if (current.height !== initial.height && Number.isFinite(heightNum) && heightNum >= 0) {
    body.height = heightNum;
  }
  if (current.birthdate !== initial.birthdate && current.birthdate) {
    body.birthdate = current.birthdate;
  }

  const healthChanged =
    current.sterilization !== initial.sterilization ||
    current.microchip !== initial.microchip ||
    current.bloodType !== initial.bloodType ||
    current.underlyingDisease !== initial.underlyingDisease ||
    current.allergy !== initial.allergy ||
    current.detail !== initial.detail ||
    current.hasBreakfast !== initial.hasBreakfast ||
    current.hasAfterBreakfast !== initial.hasAfterBreakfast ||
    current.hasLunch !== initial.hasLunch ||
    current.hasAfterLunch !== initial.hasAfterLunch ||
    current.hasDinner !== initial.hasDinner;

  if (healthChanged) {
    const rawBlood = (current.bloodType || "").trim();
    body.healthInfo = {
      sterilization: current.sterilization,
      microchip: current.microchip,
      bloodGroup: rawBlood === "UNKNOWN" || !rawBlood ? "UNKNOWN" : rawBlood,
      underlyingDisease: current.underlyingDisease.trim(),
      allergy: current.allergy.trim(),
      detail: current.detail.trim(),
      hasBreakfast: current.hasBreakfast,
      hasAfterBreakfast: current.hasAfterBreakfast,
      hasLunch: current.hasLunch,
      hasAfterLunch: current.hasAfterLunch,
      hasDinner: current.hasDinner,
    };
  }

  return body;
}

// ─── UI components ใช้แบบเดียวกับ StepBasic / StepHealth ───
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-gray-900 mb-1.5">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <div className="space-y-1">
      <input
        {...rest}
        className={[
          "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none",
          "border-black/15 focus:border-teal-600 focus:ring-2 focus:ring-teal-100",
          error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : "",
          className || "",
        ].join(" ")}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={[
        "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none",
        "border-black/15 focus:border-teal-600 focus:ring-2 focus:ring-teal-100",
        className || "",
      ].join(" ")}
    />
  );
}

function SegButton(props: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  const { active, children, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-11 w-full rounded-xl border text-sm font-semibold transition",
        "active:scale-[0.99]",
        active
          ? "bg-[#FCE7C6] border-[#F2A245] text-gray-900"
          : "bg-white border-black/15 text-gray-700 hover:bg-black/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={[
        "w-full min-h-[110px] rounded-xl border bg-white px-3 py-3 text-sm outline-none",
        "border-black/15 focus:border-teal-600 focus:ring-2 focus:ring-teal-100",
        className || "",
      ].join(" ")}
    />
  );
}

function Pill(props: { active: boolean; label: string; onClick: () => void }) {
  const { active, label, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl text-sm font-semibold border transition",
        "active:scale-[0.99]",
        active
          ? "bg-teal-600 border-teal-600 text-white"
          : "bg-white border-black/15 text-gray-700 hover:bg-black/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function EditDogSheet({
  dogId,
  profile,
  onClose,
  onSaved,
}: {
  dogId: string;
  profile: DogProfileApiResponse;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialForm = getInitialFormFromProfile(profile);
  const [form, setForm] = useState<EditDogFormState>(initialForm);
  const [breeds, setBreeds] = useState<BreedOption[]>([]);
  const [coatTypes, setCoatTypes] = useState<CoatTypeOption[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroupOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHealth, setShowHealth] = useState(false);

  // Sync breedId when breeds load — match by profile breed name
  useEffect(() => {
    if (breeds.length === 0) return;
    const breedName = profile.profile.general.breed?.trim() || "";
    const found = breeds.find((b) => b.nameTh === breedName || b.nameEng === breedName);
    if (found) {
      setForm((prev) => (prev.breedId === "" ? { ...prev, breedId: String(found.id) } : prev));
    }
  }, [breeds, profile.profile.general.breed]);

  useEffect(() => {
    fetch("/api/dog/breeds")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: BreedOption[]) => setBreeds(Array.isArray(data) ? data : []))
      .catch(() => setBreeds([]));
  }, []);

  useEffect(() => {
    fetch("/api/dog/options/coat-types")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: CoatTypeOption[]) =>
        setCoatTypes(Array.isArray(data) && data.length > 0 ? data : [
          { value: "ขนสั้น", label: "ขนสั้น" },
          { value: "ขนยาว", label: "ขนยาว" },
          { value: "ขนสองชั้น", label: "ขนสองชั้น" },
        ])
      )
      .catch(() =>
        setCoatTypes([
          { value: "ขนสั้น", label: "ขนสั้น" },
          { value: "ขนยาว", label: "ขนยาว" },
          { value: "ขนสองชั้น", label: "ขนสองชั้น" },
        ])
      );
  }, []);

  useEffect(() => {
    fetch("/api/dog/options/blood-groups")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: BloodGroupOption[]) => setBloodGroups(Array.isArray(data) ? data : []))
      .catch(() => setBloodGroups([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = buildPartialUpdateBody(initialForm, form);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/dog/${encodeURIComponent(dogId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as { detail?: string }).detail ?? (data as { error?: string }).error ?? `${res.status}`;
        setError(msg);
        return;
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const toggleMeal = (k: MealKey) => {
    setForm((prev) => ({ ...prev, [k]: !(prev as Record<string, boolean>)[k] }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl bg-[#F7F4E8] shadow-xl sm:rounded-3xl sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {/* Card แบบเดียวกับ CreatePetPageView / StepBasic container */}
          <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">แก้ไขข้อมูลสัตว์เลี้ยง</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-black/5 text-gray-600 transition"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>ชื่อสัตว์เลี้ยง</Label>
                <Input
                  placeholder="โปรดระบุ"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>เพศ</Label>
                <div className="grid grid-cols-2 gap-3">
                  <SegButton
                    active={form.gender === "male"}
                    onClick={() => setForm((p) => ({ ...p, gender: "male" }))}
                  >
                    ผู้
                  </SegButton>
                  <SegButton
                    active={form.gender === "female"}
                    onClick={() => setForm((p) => ({ ...p, gender: "female" }))}
                  >
                    เมีย
                  </SegButton>
                </div>
              </div>

              <div>
                <Label>สายพันธุ์</Label>
                <Select
                  value={form.breedId}
                  onChange={(e) => setForm((p) => ({ ...p, breedId: e.target.value }))}
                >
                  <option value="">โปรดเลือก</option>
                  {breeds.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.nameTh}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>สีขน</Label>
                <Input
                  placeholder="โปรดระบุ"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                />
              </div>

              <div>
                <Label>ประเภทขน</Label>
                <Select
                  value={form.coatType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, coatType: e.target.value as CoatTypeValue | "" }))
                  }
                >
                  <option value="">โปรดเลือก</option>
                  {coatTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>น้ำหนัก (กก.)</Label>
                  <Input
                    placeholder="เช่น 10"
                    inputMode="numeric"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>ส่วนสูง (ซม.)</Label>
                  <Input
                    placeholder="เช่น 30"
                    inputMode="numeric"
                    value={form.height}
                    onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>วันเกิด</Label>
                <Input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm((p) => ({ ...p, birthdate: e.target.value }))}
                  className="appearance-none text-[14px]"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowHealth((v) => !v)}
                className="text-sm font-semibold text-teal-600 hover:underline"
              >
                {showHealth ? "ซ่อนข้อมูลสุขภาพ" : "แสดงข้อมูลสุขภาพ"}
              </button>
              {showHealth && (
                <div className="mt-4 space-y-5 pt-4 border-t border-black/10">
                  <div>
                    <Label>ประวัติการทำหมัน</Label>
                    <Select
                      value={form.sterilization ? "ทำหมันแล้ว" : "ยังไม่เคยทำหมัน"}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, sterilization: e.target.value === "ทำหมันแล้ว" }))
                      }
                    >
                      <option value="ยังไม่เคยทำหมัน">ยังไม่เคยทำหมัน</option>
                      <option value="ทำหมันแล้ว">ทำหมันแล้ว</option>
                    </Select>
                  </div>
                  <div>
                    <Label>การฝังไมโครชิป</Label>
                    <Select
                      value={form.microchip ? "มี" : "ไม่มี"}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, microchip: e.target.value === "มี" }))
                      }
                    >
                      <option value="ไม่มี">ไม่มี</option>
                      <option value="มี">มี</option>
                    </Select>
                  </div>
                  <div>
                    <Label>หมู่เลือด</Label>
                    <Select
                      value={form.bloodType}
                      onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))}
                    >
                      <option value="">โปรดเลือก</option>
                      {bloodGroups.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>โรคประจำตัว</Label>
                    <Input
                      placeholder="ถ้ามีให้ระบุ"
                      value={form.underlyingDisease}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, underlyingDisease: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>สิ่งที่แพ้</Label>
                    <Input
                      placeholder="ถ้ามีให้ระบุ"
                      value={form.allergy}
                      onChange={(e) => setForm((p) => ({ ...p, allergy: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>มื้ออาหาร</Label>
                    <div className="flex flex-wrap gap-2">
                      <Pill
                        active={form.hasBreakfast}
                        label="เช้า"
                        onClick={() => toggleMeal("breakfast")}
                      />
                      <Pill
                        active={form.hasAfterBreakfast}
                        label="สาย"
                        onClick={() => toggleMeal("lateMorning")}
                      />
                      <Pill active={form.hasLunch} label="เที่ยง" onClick={() => toggleMeal("lunch")} />
                      <Pill
                        active={form.hasAfterLunch}
                        label="บ่าย"
                        onClick={() => toggleMeal("afternoon")}
                      />
                      <Pill active={form.hasDinner} label="เย็น" onClick={() => toggleMeal("dinner")} />
                    </div>
                  </div>
                  <div>
                    <Label>จำนวนมื้ออาหารต่อวัน</Label>
                    <Input
                      value={String(
                        [form.hasBreakfast, form.hasAfterBreakfast, form.hasLunch, form.hasAfterLunch, form.hasDinner].filter(Boolean).length
                      )}
                      disabled
                      className="bg-black/5 text-gray-700"
                    />
                  </div>
                  <div>
                    <Label>รายละเอียดเพิ่มเติม</Label>
                    <Textarea
                      placeholder="เช่น ชอบเห่าหมาพันธุ์ใหญ่ กลัวฟ้าร้อง"
                      value={form.detail}
                      onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-2 border-[#F2A245] font-extrabold text-[#F2A245] bg-white hover:bg-[#FCE7C6]/30 transition active:scale-[0.99]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 rounded-2xl font-extrabold text-white bg-[#F2A245] hover:opacity-90 disabled:opacity-50 transition active:scale-[0.99] shadow-sm"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
