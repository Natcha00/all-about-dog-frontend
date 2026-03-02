import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type SwimmingSlot = {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  statusLabel: string;
  isFull: boolean;
  isEmpty: boolean;
  sizeBooked: { large: number; small: number };
};

export type SwimmingPackagePricingResponse = {
  offerType: string;
  date: string;
  petsSummary: {
    total: number;
    small: number;
    large: number;
    label: string;
  };
  rules: {
    ownerPlayHint: string;
    slotHint: string;
  };
  slots: SwimmingSlot[];
  pricing: {
    currency: string;
    items: Array<{ dogId: number; name: string; breed: string; price: number }>;
    total: number;
  };
  lines: Array<{
    offeringId: number;
    dogId: number;
    price: number;
    groupNumber: number;
    quantity: number;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dogIds = searchParams.get("dogIds");
    const offeringType = searchParams.get("offeringType") ?? "swimming";
    const date = searchParams.get("date");
    const pkg = searchParams.get("package") ?? "standard";

    if (!dogIds || !date) {
      return NextResponse.json(
        { error: "Missing required params: dogIds, date" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = new URL(`${base}/offering/swimming/package-pricing`);
    url.searchParams.set("dogIds", dogIds);
    url.searchParams.set("offeringType", offeringType);
    url.searchParams.set("date", date);
    url.searchParams.set("package", pkg);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch swimming package pricing", detail: text },
        { status: res.status }
      );
    }

    const data: SwimmingPackagePricingResponse = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Swimming package pricing fetch failed", detail: message },
      { status: 500 }
    );
  }
}
