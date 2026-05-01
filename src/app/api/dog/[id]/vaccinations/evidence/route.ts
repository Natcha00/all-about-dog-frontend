import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

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

    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing required field: file" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();

    const forwardForm = new FormData();
    forwardForm.append("file", file);

    return withAuthRefresh(cookieStore, async (token) =>
      fetch(`${base}/dog/${id}/vaccinations/evidence`, {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: forwardForm,
      })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Evidence upload failed", detail: message },
      { status: 500 }
    );
  }
}
