import { NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Calls backend POST /dog-owner/login, sets accessToken (and refreshToken) in cookies, returns success or error.
 */
export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_BACKEND_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_BACKEND_API_URL is not set" },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "กรุณาระบุอีเมลและรหัสผ่าน" },
      { status: 400 }
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/dog-owner/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
  const refreshToken = data.refreshToken as string | undefined;

  if (!accessToken) {
    const message =
      (data.message as string) ||
      (data.error as string) ||
      (res.status === 401 ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "เข้าสู่ระบบไม่สำเร็จ");
    return NextResponse.json(
      { error: message, detail: data },
      { status: res.ok ? 500 : res.status }
    );
  }

  const response = NextResponse.json({
    success: true,
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
