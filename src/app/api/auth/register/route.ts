import { NextResponse } from "next/server";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * POST /api/auth/register
 * Body: firstName, lastName, email, password, phoneNumber, address?, profilePictureUrl?
 * Proxies to POST /dog-owner/register. 201 = success (no body).
 */
export async function POST(request: Request) {
  const base = getBaseUrl();
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : undefined;
  const profilePictureUrl = typeof body.profilePictureUrl === "string" ? body.profilePictureUrl.trim() : undefined;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    return NextResponse.json(
      { error: "กรุณากรอก ชื่อ นามสกุล อีเมล รหัสผ่าน และเบอร์โทร" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
      { status: 400 }
    );
  }
  if (phoneNumber.length < 9 || phoneNumber.length > 20) {
    return NextResponse.json(
      { error: "เบอร์โทรต้อง 9–20 ตัวอักษร" },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
  };
  if (address !== undefined) payload.address = address;
  if (profilePictureUrl !== undefined) payload.profilePictureUrl = profilePictureUrl;

  let res: Response;
  try {
    res = await fetch(`${base}/dog-owner/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", detail: message },
      { status: 502 }
    );
  }

  if (res.status === 201) {
    return NextResponse.json({ success: true });
  }

  const data = await res.json().catch(() => ({}));
  const message = (data.message as string) || (data.error as string) || "ลงทะเบียนไม่สำเร็จ";
  return NextResponse.json({ error: message, detail: data }, { status: res.status });
}
