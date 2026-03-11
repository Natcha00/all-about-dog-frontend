import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/** Request body for POST /reservation/create — backend builds lines from dogIds + period + package */
export type CreateReservationBody = {
  dogIds: number[];
  offeringType: "boarding" | "swimming";
  start: string; // ISO 8601
  end: string;   // ISO 8601
  package: "standard" | "shared" | "vip";
  remark?: string;
  dogOwnerId?: number; // staff/admin: book on behalf of customer
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateReservationBody;

    if (!Array.isArray(body?.dogIds) || body.dogIds.length < 1) {
      return NextResponse.json(
        { error: "Missing or invalid required field: dogIds (at least one)" },
        { status: 400 }
      );
    }
    if (!body?.offeringType || !body?.start || !body?.end || !body?.package) {
      return NextResponse.json(
        { error: "Missing required fields: offeringType, start, end, package" },
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
      { error: "Reservation create failed", detail: message },
      { status: 500 }
    );
  }
}
