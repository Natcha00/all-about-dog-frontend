import { NextResponse } from "next/server";

const TEST_EMAIL = "maya.chen@gmail.com";
const TEST_PASSWORD = "x";

/**
 * POST /api/auth/test-login
 * For development: calls backend login with fixed test credentials,
 * then sets accessToken (and refreshToken) in cookies.
 */
export async function POST() {
  const baseUrl = process.env.NEXT_BACKEND_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_BACKEND_API_URL is not set" },
      { status: 500 }
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/dog-owner/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Backend login request failed", detail: message },
      { status: 502 }
    );
  }

  const data = await res.json().catch(() => ({}));
  const accessToken = data.accessToken as string | undefined;
  const refreshToken = data.refreshToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Login failed", detail: data },
      { status: res.ok ? 500 : res.status }
    );
  }

  const response = NextResponse.json({
    success: true,
    accessToken: "[set in cookie]",
    refreshToken: refreshToken ? "[set in cookie]" : undefined,
  });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  if (refreshToken) {
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
