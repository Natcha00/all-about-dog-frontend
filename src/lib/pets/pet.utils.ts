import type { PetCreateForm, PetSize } from "./pet.types";

export function calcPetSizeByWeight(weightKg: number): PetSize {
  // ปรับ threshold ได้ตามที่ร้านกำหนด
  if (!Number.isFinite(weightKg) || weightKg <= 0) return "เล็ก";
  if (weightKg < 10) return "เล็ก";
  if (weightKg < 20) return "กลาง";
  return "ใหญ่";
}

export function calcAgeLabel(birthISO: string) {
  if (!birthISO) return "-";
  const birth = new Date(birthISO);
  if (Number.isNaN(birth.getTime())) return "-";

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();

  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  years = Math.max(0, years);
  months = Math.max(0, months);

  if (years === 0 && months === 0) return "น้อยกว่า 1 เดือน";
  if (years === 0) return `${months} เดือน`;
  if (months === 0) return `${years} ปี`;
  return `${years} ปี ${months} เดือน`;
}

export function safeNumberString(s: string) {
  const n = Number(String(s ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

export function countMeals(meals: Record<string, boolean>) {
  return Object.values(meals).filter(Boolean).length;
}

export function buildPetPayload(form: PetCreateForm) {
  // โครง payload เผื่อ backend (ไม่ยัด imageFile ลง JSON)
  return {
    name: form.name.trim(),
    gender: form.gender,
    breed: form.breed.trim(),

    color: form.color.trim() || null,
    weightKg: Number(form.weightKg) || null,
    heightCm: Number(form.heightCm) || null,
    size: form.size,

    birthDate: form.birthDate || null,

    neuterStatus: form.neuterStatus,
    microchipStatus: form.microchipStatus,
    bloodType: form.bloodType.trim() || null,

    disease: form.disease.trim() || null,
    allergies: form.allergies.trim() || null,

    meals: form.meals,
    mealCount: form.mealCount,

    notes: form.notes.trim() || null,
  };
}
