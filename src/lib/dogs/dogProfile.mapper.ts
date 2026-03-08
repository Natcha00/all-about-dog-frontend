import type { DogProfileApiResponse, VaccineRecordFromProfile } from "./dog.type";
import type { DogNameWithGender } from "@/components/ui/profileDogTab";
import type { PetInfoMock } from "@/components/ui/infoDog";
import type { QrCodeProps } from "@/components/ui/qrCode";
import type { ServiceHistoryItem } from "@/components/ui/historyTab";
import { toDateInputValue } from "@/lib/date/date.utils";

/** Parse "อายุ 1 ปี 6 เดือน" or "1 ปี" -> years number */
function parseAgeYears(ageStr: string): number {
  const match = String(ageStr || "").match(/(\d+)\s*ปี/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Extract allergy from "สิ่งที่แพ้: peanut" or "peanut" */
function parseAllergy(alertLabel: string | null): string | undefined {
  if (!alertLabel?.trim()) return undefined;
  const s = alertLabel.trim();
  const prefix = "สิ่งที่แพ้:";
  if (s.startsWith(prefix)) return s.slice(prefix.length).trim() || undefined;
  return s;
}

/** Build meal time labels from feedingTime booleans */
function feedingTimeToMealTime(f: DogProfileApiResponse["profile"]["careInfo"]["feedingTime"]): string[] {
  const out: string[] = [];
  if (f.hasBreakfast) out.push("เช้า");
  if (f.hasAfterBreakfast) out.push("หลังเช้า");
  if (f.hasLunch) out.push("กลางวัน");
  if (f.hasAfterLunch) out.push("บ่าย");
  if (f.hasDinner) out.push("เย็น");
  return out;
}

export function mapProfileToCardProps(api: DogProfileApiResponse): DogNameWithGender {
  const { header } = api;
  const genderLabel = api.profile.general.gender || "";
  const gender: "male" | "female" =
    genderLabel.includes("ผู้") || genderLabel === "เพศผู้" ? "male" : "female";
  const age = parseAgeYears(api.profile.general.age);
  const allergic = parseAllergy(api.header.badges.alertLabel ?? null);

  return {
    name: header.displayName,
    gender,
    img: header.imageUrl || undefined,
    age: age || undefined,
    allergic: allergic ?? undefined,
  };
}

export function mapProfileToQrProps(api: DogProfileApiResponse): QrCodeProps {
  const { qr } = api.header;
  const code = qr?.code ?? "";
  const qrSrc = code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(code)}`
    : undefined;
  return {
    label: "แตะเพื่อแสดง QR Code",
    qrSrc,
  };
}

export function mapProfileToVaccineRecords(api: DogProfileApiResponse): VaccineRecordFromProfile[] {
  const list = api.vaccine?.vaccineList ?? [];
  return (Array.isArray(list) ? list : []).map((v, i) => {
    const rawDate = v.vaccinationDate ?? v.date ?? "";
    const date = toDateInputValue(rawDate) || rawDate.trim().slice(0, 10) || "";
    return {
      id: v.id != null ? String(v.id) : `profile-${i}-${v.vaccineName ?? ""}`,
      date,
      type: v.vaccineName ?? "",
      dose: Number(v.dose) || 0,
      clinic: v.clinicName?.trim() || undefined,
      proofImage: v.evidenceImageUrl?.trim() || undefined,
    };
  });
}

export function mapProfileToPetInfoMock(api: DogProfileApiResponse): PetInfoMock {
  const g = api.profile.general;
  const c = api.profile.careInfo;
  const weightKg = parseInt(String(g.weightKg ?? "0"), 10) || 0;
  const heightCm = parseInt(String(g.heightCm ?? "0"), 10) || 0;
  const mealTime = feedingTimeToMealTime(c.feedingTime);
  const age = parseAgeYears(g.age);

  return {
    name: g.name || "-",
    gender: g.gender?.includes("ผู้") ? "male" : "female",
    breed: g.breed || "-",
    color: g.color || "-",
    weightKg,
    heightCm,
    size: g.size === "ใหญ่" ? "ใหญ่" : "เล็ก",
    birthDate: g.birthday || "-",
    age,
    sterilizeHistory: c.sterilized ? "ทำหมันแล้ว" : "ยังไม่เคยทำหมัน",
    microchip: c.microchip ? "มี" : "ไม่มี",
    bloodType: c.bloodType || "-",
    disease: c.disease || "-",
    allergic: c.allergy?.trim() || "ไม่มี",
    mealsPerDay: c.mealsPerDay ?? 0,
    mealTime,
    note: api.profile.extraNote?.trim() ?? "-",
  };
}

/** API history item shape (adjust if backend differs) */
type ApiSwimHistory = {
  id?: string | number;
  checkIn?: string;
  checkOut?: string;
  refCode?: string;
  note?: string;
};
type ApiBoardingHistory = ApiSwimHistory & {
  nights?: number;
  roomType?: string;
};

export function mapProfileToHistoryItems(api: DogProfileApiResponse): ServiceHistoryItem[] {
  const items: ServiceHistoryItem[] = [];
  const swim = (api.serviceHistory?.swimmingHistoryList ?? []) as ApiSwimHistory[];
  const board = (api.serviceHistory?.boardingHistoryList ?? []) as ApiBoardingHistory[];

  swim.forEach((s, i) => {
    items.push({
      id: s.id ?? `swim-${i}`,
      serviceType: "ว่ายน้ำ",
      checkIn: s.checkIn ?? "-",
      checkOut: s.checkOut ?? "-",
      refCode: s.refCode,
      note: s.note,
    });
  });
  board.forEach((b, i) => {
    items.push({
      id: b.id ?? `board-${i}`,
      serviceType: "ฝากเลี้ยง",
      checkIn: b.checkIn ?? "-",
      checkOut: b.checkOut ?? "-",
      nights: b.nights ?? 0,
      roomType: b.roomType,
      refCode: b.refCode,
      note: b.note,
    });
  });

  return items;
}
