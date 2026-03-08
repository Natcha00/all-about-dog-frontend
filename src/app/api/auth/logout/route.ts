import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears accessToken and refreshToken cookies (client must call with credentials).
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
