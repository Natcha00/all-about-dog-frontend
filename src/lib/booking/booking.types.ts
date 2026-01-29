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

export type TabKey = "pending" | "payment" | "active" | "finished" | "cancelled" | "other";

export type Booking = {
  id: string;                 // Reservation ID
  status: BookingStatus;

  serviceType: ServiceType;
  petId: number;
  petName: string;
  petImage?: string;
  petSize?: "small" | "large";

  startAt: string;            // ISO string or readable
  endAt?: string;             // for boarding range
  slotLabel?: string;         // for swim time slot e.g. "14:00 - 15:00"

  price: number;

  // payment slip
  slipUrl?: string;

  // staff actions log (optional)
  cancelledReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;

  checkInAt?: string;
  checkOutAt?: string;
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
