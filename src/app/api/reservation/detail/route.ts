import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type ReservationDetailGroupPet = {
  petId: number;
  name: string;
  sizeLabel: string;
};

export type ReservationDetailGroup = {
  groupNumber: number;
  offerCode: string;
  offerLabel: string;
  capacity: number;
  petIds: ReservationDetailGroupPet[];
};

export type ReservationDetailResult = {
  bookingCode: string;
  status: string;
  statusLabel: string;
  statusHint?: string;
  statusTone?: string;
  serviceType: string;
  serviceLabel: string;
  package: {
    code: string;
    label: string;
  };
  period: {
    start: string;
    end: string;
  };
  totalPrice: number;
  groups: ReservationDetailGroup[];
  note?: string | null;
  paymentMethod?: "cash" | "slip" | null;
  actions?: {
    canViewTimeline?: boolean;
    canUploadSlip?: boolean;
    canSelectPaymentMethod?: boolean;
    canCancel?: boolean;
    cancelHint?: string;
  };
  slip?: {
    required?: boolean;
    status?: string;
    imageUrl?: string;
  };
  timeline?: Array<{
    key: string;
    label: string;
    at: string | null;
    performedByName: string | null;
    detail?: string | null;
  }>;
  cancelledReason?: string | null;
  cancelled_reason?: string | null;
  cancelledBy?: "customer" | "staff";
  cancelled_by?: string;
  cancelledByStaffName?: string | null;
  cancelled_by_staff_name?: string | null;
};

export type ReservationDetailResponse = {
  statusCode: number;
  result: ReservationDetailResult;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing reservation code" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      const url = new URL(`${base}/reservation/detail`);
      url.searchParams.set("code", code);
      return fetch(url.toString(), {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation detail fetch failed", detail: message },
      { status: 500 }
    );
  }
}

