import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

/**
 * PUT /api/dog/[id]/vaccinations/[vaccinationId]
 * Proxy to backend PUT /dog/:id/vaccinations/:vaccinationId
 * Body: form-data with vaccinationDate?, vaccineName?, dose?, clinicName?, file?
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccinationId: string }> }
) {
  try {
    const { id, vaccinationId } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });
    if (!vaccinationId) return NextResponse.json({ error: "Missing vaccination id" }, { status: 400 });

    const contentType = request.headers.get("content-type") ?? "";
    const isFormData = contentType.includes("multipart/form-data");
    if (!isFormData) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const body = await request.formData();
    const form = new FormData();

    const vaccinationDate = body.get("vaccinationDate");
    const vaccineName = body.get("vaccineName");
    const dose = body.get("dose");
    const clinicName = body.get("clinicName");
    const file = body.get("file");

    if (vaccinationDate != null && String(vaccinationDate).trim() !== "")
      form.append("vaccinationDate", String(vaccinationDate));
    if (vaccineName != null && String(vaccineName).trim() !== "")
      form.append("vaccineName", String(vaccineName));
    if (dose != null && String(dose).trim() !== "") form.append("dose", String(dose));
    if (clinicName != null) form.append("clinicName", String(clinicName));
    if (file && file instanceof File) form.append("file", file);

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/dog/${id}/vaccinations/${vaccinationId}`, {
      method: "PUT",
      cache: "no-store",
      headers,
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to update vaccination", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Update vaccination failed", detail: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dog/[id]/vaccinations/[vaccinationId]
 * Proxy to backend DELETE /dog/:id/vaccinations/:vaccinationId
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccinationId: string }> }
) {
  try {
    const { id, vaccinationId } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });
    if (!vaccinationId) return NextResponse.json({ error: "Missing vaccination id" }, { status: 400 });

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/dog/${id}/vaccinations/${vaccinationId}`, {
      method: "DELETE",
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to delete vaccination", detail: text },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Delete vaccination failed", detail: message },
      { status: 500 }
    );
  }
}
