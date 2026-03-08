import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseUrl() {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * GET /api/auth/me — proxy to backend GET /dog-owner/me with auth from cookie.
 * Returns backend response on success, 401 if no token or backend returns unauthorized.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = getBaseUrl();
  const res = await fetch(`${base}/dog-owner/me`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const text = await res.text();
    let detail: unknown;
    try {
      detail = text ? JSON.parse(text) : res.statusText;
    } catch {
      detail = text || res.statusText;
    }
    return NextResponse.json(
      { error: "Failed to fetch current user", detail },
      { status: res.status }
    );
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data);
}
