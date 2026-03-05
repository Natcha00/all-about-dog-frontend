import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

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

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/reservation/cancel`, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: (data as any)?.message ?? "Failed to cancel reservation", detail: data },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation cancel failed", detail: message },
      { status: 500 },
    );
  }
}

