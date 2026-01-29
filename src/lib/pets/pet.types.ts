export type Gender = "male" | "female";

export type PetSize = "เล็ก" | "กลาง" | "ใหญ่";

export type NeuterStatus = "ยังไม่เคยทำหมัน" | "ทำหมันแล้ว";
export type MicrochipStatus = "ไม่มี" | "มี";

export type MealKey = "breakfast" | "lateMorning" | "lunch" | "afternoon" | "dinner";

export type PetCreateForm = {
  // basic
  imageFile?: File | null;
  imagePreview?: string;

  name: string;
  gender: Gender | "";
  breed: string;

  color: string;
  weightKg: string;   // เก็บเป็น string เพื่อ input ง่าย
  heightCm: string;

  size: PetSize;      // คำนวณอัตโนมัติจาก weight
  birthDate: string;  // yyyy-mm-dd
  ageLabel: string;   // คำนวณจาก birthDate

  // health
  neuterStatus: NeuterStatus;
  microchipStatus: MicrochipStatus;
  bloodType: string;

  disease: string;
  allergies: string;

  meals: Record<MealKey, boolean>;
  mealCount: number;

  notes: string;
};
