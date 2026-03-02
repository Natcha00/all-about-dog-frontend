import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type BoardingAvailableResponse = {
  available: boolean;
  message: string;
  hint: string;
  range: { start: string; end: string };
  nights: number;
  roomPerNight: { LARGE: number; SMALL: number; VIP: number };
  package: string;
  need: { LARGE: number; SMALL: number; VIP: number };
  fails: unknown[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dogIds = searchParams.get("dogIds");
    const offeringType = searchParams.get("offeringType") ?? "boarding";
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const pkg = searchParams.get("package") ?? "standard";

    if (!dogIds || !start || !end) {
      return NextResponse.json(
        { error: "Missing required params: dogIds, start, end" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = new URL(`${base}/offering/boarding/available`);
    url.searchParams.set("dogIds", dogIds);
    url.searchParams.set("offeringType", offeringType);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);
    url.searchParams.set("package", pkg);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch boarding availability", detail: text },
        { status: res.status }
      );
    }

    const data: BoardingAvailableResponse = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Boarding availability fetch failed", detail: message },
      { status: 500 }
    );
  }
}
