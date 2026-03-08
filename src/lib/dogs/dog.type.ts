export type Gender = "male" | "female";

export type PetSize = "เล็ก" | "ใหญ่";

export type NeuterStatus = "ยังไม่เคยทำหมัน" | "ทำหมันแล้ว" | "";
export type MicrochipStatus = "ไม่มี" | "มี" | "";

export type MealKey = "breakfast" | "lateMorning" | "lunch" | "afternoon" | "dinner";

/** Backend API: /dog response item */
export type DogApiItem = {
  id: number;
  code: string;
  name: string;
  gender: "male" | "female";
  color: string;
  weight: number;
  height: number;
  birthdate: string;
  dogPictureUrl: string;
  breed: {
    id: number;
    nameTh: string;
    nameEng: string;
    size: string;
  };
  health: {
    id: number;
    detail: string | null;
    sterilization: boolean;
    microchip: boolean;
    underlyingDisease: string | null;
    allergy: string | null;
    bloodGroup: string | null;
    hasBreakfast: boolean;
    hasAfterBreakfast: boolean;
    hasLunch: boolean;
    hasAfterLunch: boolean;
    hasDinner: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Backend API: GET /:id/profile vaccine.vaccineList item */
export type DogProfileVaccineItem = {
  date?: string;
  vaccineName?: string;
  dose?: number;
  clinicName?: string;
  evidenceImageUrl?: string;
};

/** Mapped for UI from profile.vaccine.vaccineList (same shape as VaccineRecord in vaccineTab) */
export type VaccineRecordFromProfile = {
  id: string;
  date: string;
  type: string;
  dose: number;
  clinic?: string;
  proofImage?: string;
};

/** Backend API: GET /:id/profile response (no result wrapper) */
export type DogProfileApiResponse = {
  header: {
    petId: number;
    displayName: string;
    imageUrl: string;
    badges: {
      alertLabel: string | null;
    };
    qr: {
      code: string;
      imageCode: string;
    };
  };
  profile: {
    general: {
      name: string;
      gender: string;
      age: string;
      weightKg: number | string;
      heightCm: string | number;
      breed: string;
      color: string;
      size: string;
      birthday: string;
    };
    careInfo: {
      sterilized: boolean;
      microchip: boolean;
      bloodType: string;
      disease: string;
      allergy: string | null;
      mealsPerDay: number;
      feedingTime: {
        hasBreakfast: boolean;
        hasAfterBreakfast: boolean;
        hasLunch: boolean;
        hasAfterLunch: boolean;
        hasDinner: boolean;
      };
    };
    extraNote: string | null;
  };
  vaccine: {
    vaccineList: DogProfileVaccineItem[];
  };
  serviceHistory: {
    swimmingHistoryList: unknown[];
    boardingHistoryList: unknown[];
  };
};

export type PetCreateForm = {
  // basic
  imageFile?: File | null;
  imagePreview?: string;
  name: string;
  gender: Gender | "";
  breed: string;
  color?: string;
  weightKg: string;   // เก็บเป็น string เพื่อ input ง่าย
  heightCm?: string;
  size: PetSize;      // คำนวณอัตโนมัติจาก weight
  birthDate: string;  // yyyy-mm-dd
  ageLabel: string;   // คำนวณจาก birthDate

  // health
  neuterStatus: NeuterStatus;
  microchipStatus: MicrochipStatus;
  bloodType: string;
  disease?: string;
  allergies?: string;
  meals: Record<MealKey, boolean>;
  mealCount: number;
  notes?: string;
};
