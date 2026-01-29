"use client";

import PetAvatarPicker from "./PetAvatarPicker";
import type { Gender, PetCreateForm } from "@/lib/pets/pet.types";

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

export default function StepBasic(props: {
  form: PetCreateForm;
  setForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;
  errors: Record<string, string>;
}) {
  const { form, setForm, errors } = props;

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
            <SegButton
              active={form.gender === "male"}
              onClick={() => setForm((p) => ({ ...p, gender: "male" as Gender }))}
            >
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
            onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
          >
            <option value="">โปรดระบุ</option>
            <option value="คอร์กี้">คอร์กี้</option>
            <option value="ชิวาวา">ชิวาวา</option>
            <option value="โกลเด้นรีทรีฟเวอร์">โกลเด้นรีทรีฟเวอร์</option>
            <option value="ไซบีเรียนฮัสกี้">ไซบีเรียนฮัสกี้</option>
            <option value="อื่นๆ">อื่นๆ</option>
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
            <Label>ส่วนสูง (ซม.)*</Label>
            <Input
              placeholder="เช่น 30"
              inputMode="numeric"
              value={form.heightCm}
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
              onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
              error={errors.birthDate}
            />
          </div>
          <div>
            <Label>อายุ</Label>
            <Input value={form.ageLabel} disabled className="bg-black/5 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
