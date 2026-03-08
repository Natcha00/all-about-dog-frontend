import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

type RouteContext = { params: Promise<{ id: string }> };

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

    const forwardForm = new FormData();
    forwardForm.set("file", file);

    return withAuthRefresh(cookieStore, async (token) =>
      fetch(`${base}/dog/${id}/profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: forwardForm,
      })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update profile picture", detail: message },
      { status: 500 }
    );
  }
}
