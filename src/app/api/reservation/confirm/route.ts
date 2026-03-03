import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

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

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/reservation/confirm`, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Failed to confirm reservation", detail: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation confirm failed", detail: message },
      { status: 500 }
    );
  }
}
