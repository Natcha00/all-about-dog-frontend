import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

/**
 * POST /api/dog/[id]/vaccinations/evidence
 * อัปโหลดรูปหลักฐานวัคซีน แบบเดียวกับ slip upload.
 * รับ FormData มี field "file" ส่งต่อไป backend POST dog/:id/vaccinations/evidence
 * Backend คืนค่าเป็น JSON เช่น { url } หรือ { evidenceImageUrl } ใช้ใส่ใน evidenceImageUrl ตอนสร้าง vaccination
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });

    const base = getBaseUrl();
    const form = await request.formData();

    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing required field: file" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const forwardForm = new FormData();
    forwardForm.append("file", file);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${base}/dog/${id}/vaccinations/evidence`;
    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers,
      body: forwardForm,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const is404 = res.status === 404;
      const message = is404
        ? "Backend ยังไม่มี endpoint อัปโหลดรูปหลักฐาน หรือ path ผิด"
        : (data?.message ?? "Failed to upload evidence image");
      return NextResponse.json(
        { error: message, detail: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Evidence upload failed", detail: message },
      { status: 500 }
    );
  }
}
