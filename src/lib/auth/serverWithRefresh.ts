import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
};

function getBaseUrl(): string {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
}

async function responseToNextResponse(res: Response): Promise<NextResponse> {
  const contentType = res.headers.get("content-type") ?? "application/json";
  try {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  }
}

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Call a backend request with accessToken. On 401, tries refresh-token then retries once.
 * Returns NextResponse. If refresh fails, returns 401 so client can redirect to login.
 */
export async function withAuthRefresh(
  cookieStore: CookieStore,
  makeRequest: (accessToken: string) => Promise<Response>
): Promise<NextResponse> {
  let accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let res = await makeRequest(accessToken);

  if (res.status !== 401) {
    return responseToNextResponse(res);
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = getBaseUrl();
  let refreshRes: Response;
  try {
    refreshRes = await fetch(`${base}/dog-owner/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", detail: message },
      { status: 502 }
    );
  }

  const refreshData = await refreshRes.json().catch(() => ({}));
  const newAccessToken = refreshData.accessToken as string | undefined;
  const newRefreshToken = (refreshData.refreshToken as string | undefined) ?? refreshToken;

  if (!refreshRes.ok || !newAccessToken) {
    return NextResponse.json(
      { error: (refreshData.message as string) || (refreshData.error as string) || "Unauthorized" },
      { status: 401 }
    );
  }

  res = await makeRequest(newAccessToken);

  const nextRes = await responseToNextResponse(res);
  nextRes.cookies.set("accessToken", newAccessToken, COOKIE_OPTIONS);
  nextRes.cookies.set("refreshToken", newRefreshToken, COOKIE_OPTIONS);
  return nextRes;
}

export { getBaseUrl };
