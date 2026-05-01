import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

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

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      const url = new URL(`${base}/offering/boarding/available`);
      url.searchParams.set("dogIds", dogIds);
      url.searchParams.set("offeringType", offeringType);
      url.searchParams.set("start", start);
      url.searchParams.set("end", end);
      url.searchParams.set("package", pkg);
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
      { error: "Boarding availability fetch failed", detail: message },
      { status: 500 }
    );
  }
}
