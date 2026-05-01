import { NextResponse } from "next/server";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * POST /api/auth/verify-otp-reset-password
 * Body: { email: string, otp: string } (otp = 6 digits)
 * Proxies to POST /dog-owner/verify-otp-reset-password. No auth (public).
 * Use after forgot-password to verify OTP before allowing user to set new password.
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

  if (!email) {
    return NextResponse.json({ error: "กรุณาระบุอีเมล" }, { status: 400 });
  }
  if (!otp) {
    return NextResponse.json({ error: "กรุณาระบุ OTP" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "OTP ต้องมี 6 หลัก" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${base}/dog-owner/verify-otp-reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data?.success !== false ? { success: true } : data);
  }

  const data = await res.json().catch(() => ({}));
  const message =
    (data.message as string) || (data.error as string) || "ยืนยัน OTP ไม่สำเร็จ";
  return NextResponse.json({ error: message, detail: data }, { status: res.status });
}
