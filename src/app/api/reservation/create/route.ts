import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type ReservationConfirmBody = {
  offerType: "boarding" | "swimming";
  period: { start: string; end: string };
  remark: string;
  package: string;
  lines: Array<{
    offeringId: number;
    dogId: number;
    price: number;
    quantity: number;
    groupNumber: number;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReservationConfirmBody;

    if (!body?.offerType || !body?.period || !Array.isArray(body?.lines)) {
      return NextResponse.json(
        { error: "Missing required fields: offerType, period, lines" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/reservation/create`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation confirm failed", detail: message },
      { status: 500 }
    );
  }
}
