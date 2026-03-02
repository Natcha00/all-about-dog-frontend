import type { PetCreateForm } from "./pet.types";

// Single source of truth: shared utils live in @/lib/dogs/dog.utills
export {
  calcPetSizeByWeight,
  calcAgeLabel,
  safeNumberString,
  countMeals,
} from "@/lib/dogs/dog.utills";

/** Payload for my-dogs create flow (uses pet.types PetCreateForm). */
export function buildPetPayload(form: PetCreateForm) {
  return {
    name: form.name.trim(),
    gender: form.gender,
    breed: form.breed.trim(),
    color: (form.color ?? "").trim() || null,
    weightKg: Number(form.weightKg) || null,
    heightCm: Number((form.heightCm ?? "").trim()) || null,
    size: form.size,
    birthDate: form.birthDate || null,
    neuterStatus: form.neuterStatus,
    microchipStatus: form.microchipStatus,
    bloodType: form.bloodType.trim() || null,
    disease: (form.disease ?? "").trim() || null,
    allergies: (form.allergies ?? "").trim() || null,
    meals: form.meals,
    mealCount: form.mealCount,
    notes: (form.notes ?? "").trim() || null,
  };
}
