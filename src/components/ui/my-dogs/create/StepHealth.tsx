"use client";

import type { MealKey, PetCreateForm } from "@/lib/pets/pet.types";

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
}) {
  const { form, setForm } = props;

  const toggleMeal = (k: MealKey) => {
    setForm((p) => ({ ...p, meals: { ...p.meals, [k]: !p.meals[k] } }));
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>ประวัติการทำหมัน</Label>
        <Select
          value={form.neuterStatus}
          onChange={(e) => setForm((p) => ({ ...p, neuterStatus: e.target.value as any }))}
        >
          <option value="ยังไม่เคยทำหมัน">ยังไม่เคยทำหมัน</option>
          <option value="ทำหมันแล้ว">ทำหมันแล้ว</option>
        </Select>
      </div>

      <div>
        <Label>การฝังไมโครชิป</Label>
        <Select
          value={form.microchipStatus}
          onChange={(e) => setForm((p) => ({ ...p, microchipStatus: e.target.value as any }))}
        >
          <option value="ไม่มี">ไม่มี</option>
          <option value="มี">มี</option>
        </Select>
      </div>

      <div>
        <Label>หมู่เลือด</Label>
        <Select value={form.bloodType} onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))}>
          <option value="DEA 1">DEA 1</option>
          <option value="DEA 3">DEA 3</option>
          <option value="DEA 4">DEA 4</option>
          <option value="ไม่ทราบ">ไม่ทราบ</option>
        </Select>
      </div>

      <div>
        <Label>โรคประจำตัว</Label>
        <Input placeholder="-" value={form.disease} onChange={(e) => setForm((p) => ({ ...p, disease: e.target.value }))} />
      </div>

      <div>
        <Label>สิ่งที่แพ้ (เช่นอาหาร/สิ่งแวดล้อม)</Label>
        <Input placeholder="-" value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} />
      </div>

      <div>
        <Label>กรุณาเลือกมื้ออาหาร</Label>
        <div className="flex flex-wrap gap-2">
          <Pill active={form.meals.breakfast} label="เช้า" onClick={() => toggleMeal("breakfast")} />
          <Pill active={form.meals.lateMorning} label="สาย" onClick={() => toggleMeal("lateMorning")} />
          <Pill active={form.meals.lunch} label="เที่ยง" onClick={() => toggleMeal("lunch")} />
          <Pill active={form.meals.afternoon} label="บ่าย" onClick={() => toggleMeal("afternoon")} />
          <Pill active={form.meals.dinner} label="เย็น" onClick={() => toggleMeal("dinner")} />
        </div>
      </div>

      <div>
        <Label>จำนวนมื้ออาหารต่อวัน</Label>
        <Input value={String(form.mealCount)} disabled className="bg-black/5 text-gray-700" />
      </div>

      <div>
        <Label>รายละเอียดเพิ่มเติม</Label>
        <Textarea
          placeholder="เช่น ชอบเห่าหมาพันธุ์ใหญ่ ร่าเริงเวลาไปวิ่งเล่น กลัวฟ้าร้อง"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>
    </div>
  );
}
