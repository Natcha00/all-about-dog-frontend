import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/**
 * GET /api/dog/[id]/reservation-histories
 * Proxy to NEXT_BACKEND_API_URL/dog/:id/reservation-histories with auth from cookie.
 * Returns only finished reservations (boarding + swimming) for that dog.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });

    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/dog/${id}/reservation-histories`, {
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
      { error: "Reservation histories fetch failed", detail: message },
      { status: 500 }
    );
  }
}

