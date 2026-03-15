// src/app/staff/walkin/_mocks/types.mock.ts

export type CustomerDraft = {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

export type PetPicked = {
  id: number;
  name: string;
  size: "small" | "large";
  breed?: string | null;   // ✅ เพิ่ม null
  weightKg?: number | null; // ✅ ถ้า weight ก็อาจเป็น null
};

export type ServiceType = "boarding" | "swimming";

export type ReservationConfirmLine = {
  offeringId: number;
  dogId: number;
  price: number;
  quantity: number;
  groupNumber: number;
};

export type BoardingDraft = {
  serviceType: "boarding";
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  plan: 1 | 2 | 3;
  total: number;
  package?: string;
  lines?: ReservationConfirmLine[];
  customerNote?: string;
};

/** Per-dog price from swimming package-pricing API (pricing.items) */
export type SwimmingPricingItem = {
  dogId: number;
  name: string;
  breed: string;
  price: number;
};

export type SwimmingDraft = {
  serviceType: "swimming";
  date: string;
  time: string;
  isVip: boolean;
  ownerPlay: boolean;
  total: number;
  package?: string;
  lines?: ReservationConfirmLine[];
  /** From API pricing.items — used for confirm breakdown */
  pricingItems?: SwimmingPricingItem[];
  customerNote?: string;
};

export type BookingDraft = BoardingDraft | SwimmingDraft;

/* ================= MOCKS ================= */

export const EMPTY_CUSTOMER: CustomerDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
};


