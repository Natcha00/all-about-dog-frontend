import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * POST /api/auth/refresh-token
 * Reads refreshToken from cookie, calls POST /dog-owner/refresh-token,
 * sets new accessToken and refreshToken in cookies. Use when API returns 401.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = getBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/dog-owner/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", detail: message },
      { status: 502 }
    );
  }

  const data = await res.json().catch(() => ({}));
  const accessToken = data.accessToken as string | undefined;
  const newRefreshToken = data.refreshToken as string | undefined;

  if (!res.ok || !accessToken) {
    return NextResponse.json(
      { error: (data.message as string) || (data.error as string) || "Unauthorized" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", accessToken, COOKIE_OPTIONS);
  response.cookies.set("refreshToken", newRefreshToken ?? refreshToken, COOKIE_OPTIONS);
  return response;
}
