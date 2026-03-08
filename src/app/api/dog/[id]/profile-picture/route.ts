import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = { params: Promise<{ id: string }> };

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * PUT /api/dog/[id]/profile-picture — proxy to NEXT_BACKEND_API_URL/dog/:id/profile-picture.
 * Request: form-data with field "file" (image file).
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing dog id" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid file in form-data (field: file)" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const forwardForm = new FormData();
    forwardForm.set("file", file);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/dog/${id}/profile-picture`, {
      method: "PUT",
      headers,
      body: forwardForm,
    });

    if (!res.ok) {
      const text = await res.text();
      let detail: string;
      try {
        const j = JSON.parse(text);
        detail = j.message ?? j.error ?? text;
      } catch {
        detail = text || res.statusText;
      }
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized", detail }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Failed to update profile picture", detail },
        { status: res.status }
      );
    }

    const text = await res.text();
    if (!text.trim()) return NextResponse.json({ ok: true });
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ ok: true, raw: text });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update profile picture", detail: message },
      { status: 500 }
    );
  }
}
