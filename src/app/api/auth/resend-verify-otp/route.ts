import { NextResponse } from "next/server";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * POST /api/auth/resend-verify-otp
 * Body: { email: string }
 * Proxies to POST /dog-owner/resend-verify-otp.
 */
export async function POST(request: Request) {
  const base = getBaseUrl();
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "กรุณาระบุอีเมล" },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${base}/dog-owner/resend-verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", detail: message },
      { status: 502 }
    );
  }

  if (res.ok) {
    return NextResponse.json({ success: true });
  }

  const data = await res.json().catch(() => ({}));
  const message = (data.message as string) || (data.error as string) || "ส่ง OTP อีกครั้งไม่สำเร็จ";
  return NextResponse.json({ error: message, detail: data }, { status: res.status });
}
