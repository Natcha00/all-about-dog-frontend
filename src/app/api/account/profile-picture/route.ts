import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * POST /api/account/profile-picture — proxy to POST /dog-owner/profile-picture.
 * Request: multipart/form-data with field "file" (image: JPEG, PNG, WebP, max 5 MB).
 * Response 200: { profilePictureUrl: string }
 * On 401, tries refresh-token then retries.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "กรุณาแนบไฟล์รูปภาพ" },
        { status: 400 }
      );
    }

    const type = (file.type ?? "").toLowerCase();
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ (jpeg, png, webp)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ไม่เกิน 5 MB" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();

    const forwardForm = new FormData();
    forwardForm.set("file", file);

    return withAuthRefresh(cookieStore, async (token) =>
      fetch(`${base}/dog-owner/profile-picture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: forwardForm,
      })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "อัปโหลดรูปไม่สำเร็จ", detail: message },
      { status: 500 }
    );
  }
}
