import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type ReservationPaymentSelectBody = {
  code: string;
  method: "slip" | "cash";
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ReservationPaymentSelectBody>;

    if (!body.code || (body.method !== "slip" && body.method !== "cash")) {
      return NextResponse.json(
        { error: "Missing or invalid fields: code, method (slip | cash)" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/reservation/payment/select`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: body.code, method: body.method }),
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation payment select failed", detail: message },
      { status: 500 },
    );
  }
}
