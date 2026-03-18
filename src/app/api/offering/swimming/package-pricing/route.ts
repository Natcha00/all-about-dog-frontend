import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type SwimmingSlot = {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  statusLabel: string;
  isFull: boolean;
  isEmpty: boolean;
  /** If true, this hour slot already has a reservation on the selected day. */
  isEverReserved: boolean;
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

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      const url = new URL(`${base}/offering/swimming/package-pricing`);
      url.searchParams.set("dogIds", dogIds);
      url.searchParams.set("offeringType", offeringType);
      url.searchParams.set("date", date);
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
      { error: "Swimming package pricing fetch failed", detail: message },
      { status: 500 }
    );
  }
}
