import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREATE_DOG_BACKEND_PATH, type CreateDogBody } from "@/lib/walkin/walkin/createDogApi";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/**
 * POST /api/create-dog — proxy to NEXT_BACKEND_API_URL + CREATE_DOG_BACKEND_PATH with auth from cookie.
 * Body: CreateDogBody (JSON). Returns created dog (same shape as GET /dog item) or error.
 * On 401, tries refresh-token then retries; if refresh fails returns 401.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateDogBody;
    const normalizedBody = { ...body } as CreateDogBody & { birthdate?: string | null };
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const rawBirthdate = String(normalizedBody.birthdate ?? "").trim();
    if (!rawBirthdate || !ISO_DATE_RE.test(rawBirthdate)) {
      delete normalizedBody.birthdate;
    } else {
      normalizedBody.birthdate = rawBirthdate;
    }
    const base = getBaseUrl();
    const url = `${base}${CREATE_DOG_BACKEND_PATH}`;
    const cookieStore = await cookies();

    return withAuthRefresh(cookieStore, async (token) =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedBody),
      })
    );
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const cause = err.cause instanceof Error ? err.cause.message : err.cause != null ? String(err.cause) : null;
    const message = (cause ?? err.message).trim();
    const backendUrl = process.env.NEXT_BACKEND_API_URL
      ? `${process.env.NEXT_BACKEND_API_URL.replace(/\/$/, "")}${CREATE_DOG_BACKEND_PATH}`
      : "(NEXT_BACKEND_API_URL not set)";
    const detail = message || `Cannot reach backend at ${backendUrl}. Is it running?`;
    return NextResponse.json(
      {
        error: "Create dog failed",
        detail,
        hint: "Check backend is running and .env NEXT_BACKEND_API_URL is correct.",
        url: backendUrl,
      },
      { status: 500 }
    );
  }
}
