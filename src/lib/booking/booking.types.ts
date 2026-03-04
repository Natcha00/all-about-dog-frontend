// booking.types.ts

export type BookingStatus =
  | "pending"
  | "WaitingSlip"
  | "slip_uploaded"
  | "slip_verified"
  | "check-in"
  | "finished"
  | "cancelled"
  | "rejected";

export type ServiceType = "boarding" | "swim";

export type TabKey =
  | "pending"
  | "waiting_slip"
  | "slip_uploaded"
  | "slip_verified"
  | "check_in"
  | "finished"
  | "cancelled";

export type PetSize = "small" | "large";

export type BookingPet = {
  petId: number;
  petName: string;
  petImage?: string;
  petSize?: PetSize;
  breed?: string; // optional เผื่อโชว์
};

export type PetsSummary = {
  total: number;
  small?: number;
  large?: number;
  label?: string; // เช่น "อังเปา, อัลมอนด์, ดำ" หรือ "สุนัขของฉัน 3 ตัว"
};

export type Booking = {
  petsSummary?: any;
  id: string;
  status: BookingStatus;
  serviceType: "boarding" | "swimming";

  pets: {
    petId: number;
    petName: string;
    petImage?: string;
    petSize: "small" | "large";
  }[];

  startAt: string;
  endAt?: string;
  slotLabel?: string;

  price: number;

  slipUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;

  checkInAt?: string;
  checkOutAt?: string;

  /** เหตุผลที่ยกเลิก (จากลูกค้าหรือพนักงาน) */
  cancelledReason?: string;
  /** ใครยกเลิก: "customer" | "staff" */
  cancelledBy?: "customer" | "staff";
  /** ชื่อพนักงานที่ยกเลิก (เมื่อ cancelledBy === "staff") */
  cancelledByStaffName?: string;
};

export type Tone = "neutral" | "warning" | "info" | "success" | "danger";

export type BillStatusEvent = {
  key:
    | "pending"
    | "waiting_payment"
    | "slip_uploaded"
    | "slip_verified"
    | "checked_in"
    | "finished"
    | "cancelled"
    | "rejected";
  label: string;
  tone: Tone;
  at?: string;
  by?: string;
  note?: string;
};