import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type VaccinationApiItem = {
  id: string | number;
  vaccinationDate: string;
  vaccineName: string;
  dose: number;
  clinicName?: string | null;
  evidenceImageUrl?: string | null;
};

export type CreateVaccinationBody = {
  vaccinationDate: string;
  vaccineName: string;
  dose: number;
  clinicName?: string;
  evidenceImageUrl?: string;
};

function authHeaders(token: string | undefined, omitContentType = false): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!omitContentType) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${base}/dog/${id}/vaccinations`, {
      cache: "no-store",
      headers: authHeaders(token),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch vaccinations", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return NextResponse.json(list);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Vaccinations fetch failed", detail: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing dog id" }, { status: 400 });

    const contentType = request.headers.get("content-type") ?? "";
    const isFormData = contentType.includes("multipart/form-data");

    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const form = new FormData();

    if (isFormData) {
      const body = await request.formData();
      const vaccinationDate = body.get("vaccinationDate");
      const vaccineName = body.get("vaccineName");
      const dose = body.get("dose");
      const file = body.get("file");
      const clinicName = body.get("clinicName") ?? "";

      if (!vaccinationDate || !vaccineName || !dose) {
        return NextResponse.json(
          { error: "Missing or invalid: vaccinationDate, vaccineName, dose" },
          { status: 400 }
        );
      }
      const doseNum = Number(dose);
      if (Number.isNaN(doseNum) || doseNum < 1) {
        return NextResponse.json(
          { error: "dose must be a number >= 1" },
          { status: 400 }
        );
      }

      form.append("vaccinationDate", String(vaccinationDate));
      form.append("vaccineName", String(vaccineName));
      form.append("dose", String(doseNum));
      form.append("clinicName", String(clinicName));
      if (file && file instanceof File) {
        form.append("file", file);
      }
    } else {
      const body = (await request.json()) as CreateVaccinationBody;
      const { vaccinationDate, vaccineName, dose, clinicName, evidenceImageUrl } = body;

      if (!vaccinationDate || !vaccineName || typeof dose !== "number" || dose < 1) {
        return NextResponse.json(
          { error: "Missing or invalid: vaccinationDate, vaccineName, dose (number >= 1)" },
          { status: 400 }
        );
      }

      form.append("vaccinationDate", vaccinationDate);
      form.append("vaccineName", vaccineName);
      form.append("dose", String(dose));
      form.append("clinicName", clinicName ?? "");
      if (evidenceImageUrl && evidenceImageUrl.trim().length > 0) {
        form.append("evidenceImageUrl", evidenceImageUrl.trim());
      }
    }

    const res = await fetch(`${base}/dog/${id}/vaccinations`, {
      method: "POST",
      cache: "no-store",
      headers: authHeaders(token, true),
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to create vaccination", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Create vaccination failed", detail: message },
      { status: 500 }
    );
  }
}
