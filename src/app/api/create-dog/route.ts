import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREATE_DOG_BACKEND_PATH, type CreateDogBody } from "@/lib/walkin/walkin/createDogApi";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

/**
 * POST /api/create-dog — proxy to NEXT_BACKEND_API_URL + CREATE_DOG_BACKEND_PATH with auth from cookie.
 * Body: CreateDogBody (JSON). Returns created dog (same shape as GET /dog item) or error.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateDogBody;
    const base = getBaseUrl();
    const url = `${base}${CREATE_DOG_BACKEND_PATH}`;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
      return NextResponse.json(
        { error: "Failed to create dog", detail },
        { status: res.status }
      );
    }

    const text = await res.text();
    let data: unknown = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Failed to parse response", detail: text };
      }
    }
    return NextResponse.json(data);
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
