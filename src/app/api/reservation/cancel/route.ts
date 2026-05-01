import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type ReservationCancelBody = {
  code: string;
  reason?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ReservationCancelBody>;

    if (!body.code) {
      return NextResponse.json({ error: "Missing reservation code" }, { status: 400 });
    }

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/reservation/cancel`, {
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
      { error: "Reservation cancel failed", detail: message },
      { status: 500 },
    );
  }
}

