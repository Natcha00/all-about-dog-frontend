import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type PackagePricingDog = {
  dogId: number;
  name: string;
  groupNumber: number;
  sizeLabel: string;
  breed: string;
  size: string;
  perNight: number;
  subtotal: number;
};

export type PackagePricingGroup = {
  groupNumber: number;
  offerCode: string;
  offerLabel: string;
  capacity: number;
  dogIds: Array<{ dogId: number; name: string; sizeLabel: string }>;
};

export type BoardingPackagePricingResponse = {
  offerType: string;
  period: { start: string; end: string; nights: number };
  package: string;
  dogs: PackagePricingDog[];
  groups: PackagePricingGroup[];
  pricingSummary: { total: number; currency: string };
  lines: Array<{ offeringId: number; dogId: number; price: number; quantity: number; groupNumber: number }>;
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

    const url = new URL(`${base}/offering/boarding/package-pricing`);
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
        { error: "Failed to fetch package pricing", detail: text },
        { status: res.status }
      );
    }

    const data: BoardingPackagePricingResponse = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Package pricing fetch failed", detail: message },
      { status: 500 }
    );
  }
}
