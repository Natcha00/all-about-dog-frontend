"use client";

import type React from "react";
import { useEffect, useState } from "react";
import PetAvatarPicker from "./PetAvatarPicker";
import type { Gender, PetCreateForm } from "@/lib/dogs/dog.type";
import { breedSizeToPetSize, isDoubleCoatOnlyBreed } from "@/lib/dogs/dog.utills";

export type BreedOption = { id: number; nameTh: string; nameEng: string; size: string };

export type CoatTypeOption = { value: string; label: string };

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function clampToToday(value: string): string {
if (!value) return "" ;
const today = todayISO();
  return value > today ? today : value;

}

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

function calcAgeFromISO(birthISO: string): { label: string; isFuture: boolean } {
  if (!birthISO) return { label: "", isFuture: false };

  const birth = new Date(`${birthISO}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return { label: "", isFuture: false };

  const now = new Date();
  if (birth > now) return { label: "ยังไม่เกิด", isFuture: true };

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const label =
    years <= 0 ? `${months} เดือน` : months === 0 ? `${years} ปี` : `${years} ปี ${months} เดือน`;

  return { label, isFuture: false };
}

export default function StepBasic(props: {
  form: PetCreateForm;
  setForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;
  errors: Record<string, string>;
  /** When provided (e.g. from PetCreatePanel), use this list; otherwise fetch from API */
  breeds?: BreedOption[];
}) {
  const { form, setForm, errors, breeds: breedsProp } = props;

  const [breedsFetched, setBreedsFetched] = useState<BreedOption[]>([]);
  const [coatTypes, setCoatTypes] = useState<CoatTypeOption[]>([]);
  const breeds = breedsProp ?? breedsFetched;

  useEffect(() => {
    if (breedsProp != null) return;
    fetch("/api/dog/breeds")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: BreedOption[]) => setBreedsFetched(Array.isArray(data) ? data : []))
      .catch(() => setBreedsFetched([]));
  }, [breedsProp]);

  useEffect(() => {
    fetch("/api/dog/options/coat-types")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: CoatTypeOption[]) => setCoatTypes(Array.isArray(data) && data.length > 0 ? data : [
        { value: "ขนสั้น", label: "ขนสั้น" },
        { value: "ขนยาว", label: "ขนยาว" },
        { value: "ขนสองชั้น", label: "ขนสองชั้น" },
      ]))
      .catch(() => setCoatTypes([
        { value: "ขนสั้น", label: "ขนสั้น" },
        { value: "ขนยาว", label: "ขนยาว" },
        { value: "ขนสองชั้น", label: "ขนสองชั้น" },
      ]));
  }, []);

  // ✅ ไม่เก็บ ageLabel ใน state แล้ว คำนวณสดจาก birthDate
  const derivedAge = calcAgeFromISO(form.birthDate);

  return (
    <div className="space-y-5">
      <PetAvatarPicker
        preview={form.imagePreview}
        onPick={(file, previewUrl) =>
          setForm((p) => ({ ...p, imageFile: file, imagePreview: previewUrl }))
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>ชื่อสัตว์เลี้ยง*</Label>
          <Input
            placeholder="โปรดระบุ"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={errors.name}
          />
        </div>

        <div>
          <Label>เพศ*</Label>
          <div className="grid grid-cols-2 gap-3">
            <SegButton active={form.gender === "male"} onClick={() => setForm((p) => ({ ...p, gender: "male" as Gender }))}>
              ผู้
            </SegButton>
            <SegButton
              active={form.gender === "female"}
              onClick={() => setForm((p) => ({ ...p, gender: "female" as Gender }))}
            >
              เมีย
            </SegButton>
          </div>
          {errors.gender ? <p className="mt-1 text-xs text-rose-600">{errors.gender}</p> : null}
        </div>

        <div>
          <Label>พันธุ์*</Label>
          <Select
            value={form.breed}
            onChange={(e) => {
              const value = e.target.value;
              const selected = breeds.find((b) => String(b.id) === value);
              const nextSize = breedSizeToPetSize(selected?.size ?? "");
              const forceDoubleCoat = selected?.nameTh && isDoubleCoatOnlyBreed(selected.nameTh);
              setForm((p) => ({
                ...p,
                breed: value,
                size: nextSize,
                ...(forceDoubleCoat ? { coatType: "ขนสองชั้น" as PetCreateForm["coatType"] } : {}),
              }));
            }}
          >
            <option value="">โปรดเลือก</option>
            {breeds.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.nameTh}
              </option>
            ))}
          </Select>
          {errors.breed ? <p className="mt-1 text-xs text-rose-600">{errors.breed}</p> : null}
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
          <Label>ประเภทขน*</Label>
          {(() => {
            const selectedBreed = breeds.find((b) => String(b.id) === form.breed);
            const mustDoubleCoat = Boolean(
              selectedBreed?.nameTh && isDoubleCoatOnlyBreed(selectedBreed.nameTh)
            );
            const effectiveCoatType = mustDoubleCoat ? "ขนสองชั้น" : form.coatType;
            return (
              <>
                <Select
                  value={effectiveCoatType}
                  onChange={(e) => {
                    if (mustDoubleCoat) return;
                    setForm((p) => ({ ...p, coatType: e.target.value as PetCreateForm["coatType"] }));
                  }}
                  disabled={mustDoubleCoat}
                >
                  <option value="">โปรดเลือก</option>
                  {coatTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                {mustDoubleCoat ? (
                  <p className="mt-1 text-xs text-gray-500">พันธุ์นี้เป็นขนสองชั้นเท่านั้น</p>
                ) : null}
              </>
            );
          })()}
          {errors.coatType ? <p className="mt-1 text-xs text-rose-600">{errors.coatType}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>น้ำหนัก (กก.)*</Label>
            <Input
              placeholder="เช่น 10"
              inputMode="numeric"
              value={form.weightKg}
              onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))}
              error={errors.weightKg}
            />
          </div>
          <div>
            <Label>ส่วนสูง (ซม.)</Label>
            <Input
              placeholder="เช่น 30"
              inputMode="numeric"
              value={form.heightCm ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, heightCm: e.target.value }))}
              error={errors.heightCm}
            />
          </div>
        </div>

        <div>
          <Label>ขนาดตัว/ไซซ์</Label>
          <Input value={form.size} disabled className="bg-black/5 text-gray-700" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>วันเกิด*</Label>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(p) => {
                const birthDate = clampToToday(p.target.value);
                setForm((prev) => ({ ...prev, birthDate: birthDate }));
              }}
              error={errors.birthDate}
              className="appearance-none text-[14px]"
            />
          </div>

          <div>
            <Label>อายุ</Label>
            <Input value={derivedAge.label || "-"} disabled className="bg-black/5 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
