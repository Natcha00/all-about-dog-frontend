import { NextResponse } from "next/server";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * POST /api/auth/verify-email
 * Body: { email: string, otp: string } (OTP 6 digits)
 * Proxies to POST /dog-owner/verify-email.
 */
export async function POST(request: Request) {
  const base = getBaseUrl();
  let body: { email?: string; otp?: string };
  try {
    body = (await request.json()) as { email?: string; otp?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";

  if (!email || !otp) {
    return NextResponse.json(
      { error: "กรุณาระบุอีเมลและ OTP" },
      { status: 400 }
    );
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { error: "OTP ต้องเป็นตัวเลข 6 หลัก" },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${base}/dog-owner/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
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
  const message = (data.message as string) || (data.error as string) || "ยืนยันอีเมลไม่สำเร็จ";
  return NextResponse.json({ error: message, detail: data }, { status: res.status });
}
