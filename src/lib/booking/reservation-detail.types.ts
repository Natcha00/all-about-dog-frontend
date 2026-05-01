export type ReservationDetailResult = {
  bookingCode: string;
  status: string;
  serviceType: string;
  totalPrice?: number | null;
  groups?: Array<{
    dogIds?: Array<{
      dogId?: number;
      petId?: number;
      id?: number;
      name?: string;
      sizeLabel?: string;
    }>;
    petIds?: Array<{
      dogId?: number;
      petId?: number;
      id?: number;
      name?: string;
      sizeLabel?: string;
    }>;
  }>;
  period?: {
    start?: string;
    end?: string;
    date?: string;
  };
  actions?: {
    canUploadSlip?: boolean;
    canSelectPaymentMethod?: boolean;
    canViewTimeline?: boolean;
    canCancel?: boolean;
    cancelHint?: string;
    [key: string]: unknown;
  } | null;
  slip?: {
    imageUrl?: string;
    required?: boolean;
    status?: string;
    [key: string]: unknown;
  } | null;
  timeline?: Array<{
    key: string;
    label: string;
    at: string | null;
    performedByName: string | null;
    detail?: string | null;
    [key: string]: unknown;
  }>;
  paymentMethod?: "slip" | "cash" | null;
  statusHint?: string | null;
  statusLabel?: string | null;
  note?: string | null;
  cancelledReason?: string;
  cancelledBy?: "customer" | "staff";
  cancelledByStaffName?: string;
  [key: string]: unknown;
};
