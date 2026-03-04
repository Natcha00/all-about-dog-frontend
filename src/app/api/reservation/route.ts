import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

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

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = new URL(`${base}/reservation`);
    if (tab) url.searchParams.set("tab", tab);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch reservations", detail: text },
        { status: res.status }
      );
    }

    const data: ReservationListResponse = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation list fetch failed", detail: message },
      { status: 500 }
    );
  }
}

