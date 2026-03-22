import { PetCreateForm } from "@/lib/dogs/dog.type";
import type { CoatTypeValue } from "@/lib/dogs/dog.type";

/**
 * Backend path for create-dog. Next.js route POST /api/create-dog proxies to
 * NEXT_BACKEND_API_URL + CREATE_DOG_BACKEND_PATH with auth from cookie.
 */
export const CREATE_DOG_BACKEND_PATH = "/dog/create-dog";

/**
 * POST body for NEXT_BACKEND_API_URL + "/dog/create-dog"
 * Mirrors CreateDogDto: required healthInfo booleans, coatType enum strings, optional height / birthdate / dogPictureUrl, staff-only dogOwnerId.
 */
export type CreateDogHealthInfo = {
  sterilization: boolean;
  microchip: boolean;
  bloodGroup?: string;
  underlyingDisease?: string;
  allergy?: string;
  hasBreakfast: boolean;
  hasAfterBreakfast: boolean;
  hasLunch: boolean;
  hasAfterLunch: boolean;
  hasDinner: boolean;
  detail?: string;
};

export type CreateDogBody = {
  name: string;
  gender: string;
  breedId: number;
  color?: string;
  coatType: CoatTypeValue;
  weight: number;
  /** Omit when unknown; do not send 0 as a placeholder. */
  height?: number;
  birthdate?: string | null; // yyyy-mm-dd (optional)
  /** Only when you have a real http(s) URL (e.g. after upload). Invalid URL → backend 400. */
  dogPictureUrl?: string;
  healthInfo: CreateDogHealthInfo;
  /** Staff/admin only: integer ≥ 1. Omit for logged-in dog owner. */
  dogOwnerId?: number;
};

/** Optional overrides when building from a form (staff create-for-customer, uploaded image URL). */
export type BuildCreateDogOptions = {
  dogOwnerId?: number;
  dogPictureUrl?: string;
};

const VALID_COAT_TYPES: CoatTypeValue[] = ["ขนสั้น", "ขนยาว", "ขนสองชั้น"];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isCoatTypeValue(s: string): s is CoatTypeValue {
  return VALID_COAT_TYPES.includes(s as CoatTypeValue);
}

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
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


export function buildCreateDogBody(
  form: PetCreateForm,
  options?: BuildCreateDogOptions,
): CreateDogBody | null {
  const breedId = Number(form.breed.trim());
  if (!Number.isFinite(breedId) || breedId <= 0) return null;

  if (!form.neuterStatus || !form.microchipStatus) return null;
  if (!Object.values(form.meals).some(Boolean)) return null;

  const coatType = (form.coatType || "").trim();
  if (!isCoatTypeValue(coatType)) return null;

  const weight = Number(form.weightKg);
  if (!Number.isFinite(weight) || weight <= 0) return null;

  const heightStr = (form.heightCm ?? "").trim();
  let height: number | undefined;
  if (heightStr !== "") {
    const h = Number(heightStr);
    if (!Number.isFinite(h) || h < 0) return null;
    height = h;
  }

  const gender = form.gender === "female" ? "female" : "male";
  const rawBlood = (form.bloodType || "").trim();

  const birthdate = (form.birthDate || "").trim();
  const normalizedBirthdate = ISO_DATE_RE.test(birthdate) ? birthdate : "";

  const disease = (form.disease ?? "").trim();
  const allergy = (form.allergies ?? "").trim();
  const detail = (form.notes ?? "").trim();

  const body: CreateDogBody = {
    name: form.name.trim(),
    gender,
    breedId,
    ...(form.color != null && form.color.trim() !== "" ? { color: form.color.trim() } : {}),
    coatType,
    weight,
    ...(height !== undefined ? { height } : {}),
    ...(normalizedBirthdate ? { birthdate: normalizedBirthdate } : {}),
    healthInfo: {
      sterilization: form.neuterStatus === "ทำหมันแล้ว",
      microchip: form.microchipStatus === "มี",
      ...(rawBlood ? { bloodGroup: rawBlood } : {}),
      ...(disease ? { underlyingDisease: disease } : {}),
      ...(allergy ? { allergy } : {}),
      hasBreakfast: form.meals.breakfast,
      hasAfterBreakfast: form.meals.lateMorning,
      hasLunch: form.meals.lunch,
      hasAfterLunch: form.meals.afternoon,
      hasDinner: form.meals.dinner,
      ...(detail ? { detail } : {}),
    },
  };

  const staffOwner = options?.dogOwnerId;
  if (staffOwner != null && Number.isInteger(staffOwner) && staffOwner >= 1) {
    body.dogOwnerId = staffOwner;
  }

  const pic = options?.dogPictureUrl?.trim();
  if (pic && isHttpUrl(pic)) {
    body.dogPictureUrl = pic;
  }

  return body;
}
