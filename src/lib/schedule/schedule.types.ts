export type ServiceKind = "swimming" | "boarding"
export type BookingStatus = "pending" | "WaitingSlip" | "slipUploaded" | "slipVerified"| "finished" | "cancelled"  | "approved"

export type Booking = {
  id: string;
  status: BookingStatus;

  serviceKind: ServiceKind;
  serviceLabel: string;

  startAt: string;
  endAt?: string;

  slotLabel?: string;
  petNames: string[];
};
