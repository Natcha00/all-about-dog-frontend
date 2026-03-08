import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type ReservationListCounts = {
  pending: number;
  waiting_slip: number;
  slip_uploaded: number;
  slip_verified: number;
  check_in: number;
  finished: number;
  cancelled: number;
};

export type ReservationListItem = {
  id: string;
  status: string;
  serviceType: string;
  statusLabel: string;
  dogs: Array<{ name: string }>;
  dogsLabel: string;
  totalPrice: number;
  date?: string;
  timeSlot?: { start: string; end: string };
  checkInDate?: string;
  checkOutDate?: string;
  /** เหตุผลที่ยกเลิก (backend อาจส่งเป็น cancelled_reason) */
  cancelledReason?: string;
  cancelled_reason?: string;
  /** ใครยกเลิก: "customer" | "staff" (backend อาจส่งเป็น cancelled_by) */
  cancelledBy?: "customer" | "staff";
  cancelled_by?: string;
  /** ชื่อพนักงานที่ยกเลิก (backend อาจส่งเป็น cancelled_by_staff_name) */
  cancelledByStaffName?: string;
  cancelled_by_staff_name?: string;
};

export type ReservationListResponse = {
  counts: ReservationListCounts;
  items: ReservationListItem[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? undefined;

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      const url = new URL(`${base}/reservation`);
      if (tab) url.searchParams.set("tab", tab);
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
      { error: "Reservation list fetch failed", detail: message },
      { status: 500 }
    );
  }
}

