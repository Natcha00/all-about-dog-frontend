import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type ReservationDetailGroupPet = {
  petId: number;
  name: string;
  sizeLabel: string;
};

export type ReservationDetailGroup = {
  groupNumber: number;
  offerCode: string;
  offerLabel: string;
  capacity: number;
  petIds: ReservationDetailGroupPet[];
};

export type ReservationDetailResult = {
  bookingCode: string;
  status: string;
  statusLabel: string;
  statusHint?: string;
  statusTone?: string;
  serviceType: string;
  serviceLabel: string;
  package: {
    code: string;
    label: string;
  };
  period: {
    start: string;
    end: string;
  };
  totalPrice: number;
  groups: ReservationDetailGroup[];
  note?: string | null;
  actions?: {
    canViewTimeline?: boolean;
    canUploadSlip?: boolean;
    canCancel?: boolean;
    cancelHint?: string;
  };
  slip?: {
    required?: boolean;
    status?: string;
    imageUrl?: string;
  };
  timeline?: Array<{
    key: string;
    label: string;
    at: string | null;
    by: string | null;
  }>;
};

export type ReservationDetailResponse = {
  statusCode: number;
  result: ReservationDetailResult;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing reservation code" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = new URL(`${base}/reservation/detail`);
    url.searchParams.set("code", code);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers,
    });

    const data = (await res
      .json()
      .catch(() => ({}))) as Partial<ReservationDetailResponse>;

    if (!res.ok) {
      return NextResponse.json(
        {
          error: data && "statusCode" in data ? "Failed to fetch reservation detail" : "Failed to fetch reservation detail",
          detail: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation detail fetch failed", detail: message },
      { status: 500 }
    );
  }
}

