"use client";

import { useEffect, useState } from "react";
import { MealKey, PetCreateForm } from "@/lib/dogs/dog.type";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

type BloodGroupOption = { value: string; label: string };



function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-gray-900 mb-1.5">{children}</p>;
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none",
        "border-black/15 focus:border-teal-600 focus:ring-2 focus:ring-teal-100",
        className || "",
      ].join(" ")}
    />
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

export default function StepHealth(props: {
  form: PetCreateForm;
  setForm: React.Dispatch<React.SetStateAction<PetCreateForm>>;
  errors?: Record<string, string>;
}) {
  const { form, setForm, errors = {} } = props;
  const authorizedApi = useAuthorizedApi();

  const [bloodGroups, setBloodGroups] = useState<BloodGroupOption[]>([]);

  useEffect(() => {
    authorizedApi("/api/dog/options/blood-groups")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: BloodGroupOption[]) => setBloodGroups(Array.isArray(data) ? data : []))
      .catch(() => setBloodGroups([]));
  }, [authorizedApi]);

  const toggleMeal = (k: MealKey) => {
    setForm((p) => ({ ...p, meals: { ...p.meals, [k]: !p.meals[k] } }));
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>ประวัติการทำหมัน<span className="text-red-500">*</span></Label>
        <Select
          value={form.neuterStatus}
          onChange={(e) => setForm((p) => ({ ...p, neuterStatus: e.target.value as PetCreateForm["neuterStatus"] }))}
        >
          <option value="">โปรดเลือก</option>
          <option value="ยังไม่เคยทำหมัน">ยังไม่เคยทำหมัน</option>
          <option value="ทำหมันแล้ว">ทำหมันแล้ว</option>
        </Select>
        {errors.neuterStatus ? <p className="mt-1 text-xs text-rose-600">{errors.neuterStatus}</p> : null}
      </div>

      <div>
        <Label>การฝังไมโครชิป<span className="text-red-500">*</span></Label>
        <Select
          value={form.microchipStatus}
          onChange={(e) => setForm((p) => ({ ...p, microchipStatus: e.target.value as PetCreateForm["microchipStatus"] }))}
        >
          <option value="">โปรดเลือก</option>
          <option value="ไม่มี">ไม่มี</option>
          <option value="มี">มี</option>
        </Select>
        {errors.microchipStatus ? <p className="mt-1 text-xs text-rose-600">{errors.microchipStatus}</p> : null}
      </div>

      <div>
        <Label>หมู่เลือด</Label>
        <Select value={form.bloodType} onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))}>
          <option value="">โปรดเลือก</option>
          {bloodGroups.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        {errors.bloodType ? <p className="mt-1 text-xs text-rose-600">{errors.bloodType}</p> : null}
      </div>

      <div>
        <Label>โรคประจำตัว</Label>
        <Input placeholder="ถ้ามีให้ระบุ" value={form.disease} onChange={(e) => setForm((p) => ({ ...p, disease: e.target.value }))} />
      </div>

      <div>
        <Label>สิ่งที่แพ้</Label>
        <Input placeholder="ถ้ามีให้ระบุ" value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} />
      </div>

      <div>
        <Label>มื้ออาหาร<span className="text-red-500">*</span></Label>
        <div className="flex flex-wrap gap-2">
          <Pill active={form.meals.breakfast} label="เช้า" onClick={() => toggleMeal("breakfast")} />
          <Pill active={form.meals.lateMorning} label="สาย" onClick={() => toggleMeal("lateMorning")} />
          <Pill active={form.meals.lunch} label="เที่ยง" onClick={() => toggleMeal("lunch")} />
          <Pill active={form.meals.afternoon} label="บ่าย" onClick={() => toggleMeal("afternoon")} />
          <Pill active={form.meals.dinner} label="เย็น" onClick={() => toggleMeal("dinner")} />
        </div>
        {errors.meals ? <p className="mt-1 text-xs text-rose-600">{errors.meals}</p> : null}
      </div>

      <div>
        <Label>จำนวนมื้ออาหารต่อวัน</Label>
        <Input value={String(form.mealCount)} disabled className="bg-black/5 text-gray-700" />
      </div>

      <div>
        <Label>รายละเอียดเพิ่มเติม</Label>
        <Textarea
          placeholder="เช่น ชอบเห่าหมาพันธุ์ใหญ่ กลัวฟ้าร้อง"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>
    </div>
  );
}
