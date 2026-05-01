import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/**
 * POST /api/account/change-password — proxy to POST /dog-owner/change-password.
 * Body: { currentPassword: string, newPassword: string } (newPassword min 6 chars).
 * Success: 200 + { success: true }.
 * Wrong current password: 400 + message "รหัสผ่านปัจจุบันไม่ถูกต้อง".
 * On 401, tries refresh-token then retries.
 */
export async function POST(request: Request) {
  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = (await request.json()) as { currentPassword?: string; newPassword?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword.trim()) {
    return NextResponse.json(
      { error: "กรุณากรอกรหัสผ่านปัจจุบัน" },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();

  return withAuthRefresh(cookieStore, async (token) => {
    const base = getBaseUrl();
    return fetch(`${base}/dog-owner/change-password`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: currentPassword.trim(),
        newPassword,
      }),
    });
  });
}
