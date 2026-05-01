import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/**
 * GET /api/auth/me — proxy to backend GET /dog-owner/me with auth from cookie.
 * On 401, tries refresh-token then retries; if refresh fails returns 401.
 */
export async function GET() {
  const cookieStore = await cookies();
  return withAuthRefresh(cookieStore, async (token) => {
    const base = getBaseUrl();
    return fetch(`${base}/dog-owner/me`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  });
}
