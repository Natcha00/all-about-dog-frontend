import { PetCreateForm } from "@/lib/dogs/dog.type";
import type { CoatTypeValue } from "@/lib/dogs/dog.type";

/**
 * Backend path for create-dog. Next.js route POST /api/create-dog proxies to
 * NEXT_BACKEND_API_URL + CREATE_DOG_BACKEND_PATH with auth from cookie.
 */
export const CREATE_DOG_BACKEND_PATH = "/dog/create-dog";

/**
 * POST body for NEXT_BACKEND_API_URL + "/dog/create-dog"
 * Example: { name, gender, breedId, color, weight, height, birthdate, healthInfo }
 */
export type CreateDogHealthInfo = {
  sterilization: boolean;
  microchip: boolean;
  bloodGroup: string;
  underlyingDisease: string;
  allergy: string;
  hasBreakfast: boolean;
  hasAfterBreakfast: boolean;
  hasLunch: boolean;
  hasAfterLunch: boolean;
  hasDinner: boolean;
  detail: string;
};

export type CreateDogBody = {
  name: string;
  gender: "male" | "female";
  breedId: number;
  color: string;
  coatType: CoatTypeValue;
  weight: number;
  height: number;
  birthdate: string; // yyyy-mm-dd
  healthInfo: CreateDogHealthInfo;
};

const VALID_COAT_TYPES: CoatTypeValue[] = ["ขนสั้น", "ขนยาว", "ขนสองชั้น"];

function isCoatTypeValue(s: string): s is CoatTypeValue {
  return VALID_COAT_TYPES.includes(s as CoatTypeValue);
}

/**
 * Map breed display name (Thai) to backend breedId.
 * @deprecated Use form.breed as breedId (string) from GET /dog/breeds; buildCreateDogBody uses Number(form.breed).
 */
export const BREED_NAME_TO_ID: Record<string, number> = {
  คอร์กี้: 1,
  ชิวาวา: 2,
  โกลเด้นรีทรีฟเวอร์: 3,
  ไซบีเรียนฮัสกี้: 4,
  อื่นๆ: 5,
  ชิสุห์: 5,
  บีเกิ้ล: 9,
};


export function buildCreateDogBody(form: PetCreateForm): CreateDogBody | null {
  const breedId = Number(form.breed.trim());
  if (!Number.isFinite(breedId) || breedId <= 0) return null;

  if (!form.neuterStatus || !form.microchipStatus) return null;
  if (!(form.bloodType || "").trim()) return null;
  if (!Object.values(form.meals).some(Boolean)) return null;

  const coatType = (form.coatType || "").trim();
  if (!isCoatTypeValue(coatType)) return null;

  const weight = Number(form.weightKg);
  const height = Number((form.heightCm ?? ""));
  if (!Number.isFinite(weight) || weight <= 0) return null;

  const gender = form.gender === "female" ? "female" : "male";
  const rawBlood = (form.bloodType || "").trim();
  // "" or "ไม่ทราบ" → send "" (backend stores ไม่ทราบ). Enum e.g. "DEA 1.1" → send as-is.
  const bloodGroup = rawBlood === "UNKNOWN" || !rawBlood ? "UNKNOWN" : rawBlood;

  return {
    name: form.name.trim(),
    gender,
    breedId,
    color: (form.color ?? "").trim(),
    coatType,
    weight,
    height,
    birthdate: form.birthDate || "",
    healthInfo: {
      sterilization: form.neuterStatus === "ทำหมันแล้ว",
      microchip: form.microchipStatus === "มี",
      bloodGroup,
      underlyingDisease: (form.disease ?? "").trim(),
      allergy: (form.allergies ?? "").trim(),
      hasBreakfast: form.meals.breakfast,
      hasAfterBreakfast: form.meals.lateMorning,
      hasLunch: form.meals.lunch,
      hasAfterLunch: form.meals.afternoon,
      hasDinner: form.meals.dinner,
      detail: (form.notes ?? "").trim() || "",
    },
  };
}
