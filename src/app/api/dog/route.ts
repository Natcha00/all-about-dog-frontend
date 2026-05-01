import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/**
 * GET /api/dog — proxy to NEXT_BACKEND_API_URL/dog with auth from cookie.
 * On 401, tries refresh-token then retries; if refresh fails returns 401.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/dog`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("401") || message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dogs", detail: message },
      { status: 500 }
    );
  }
}
