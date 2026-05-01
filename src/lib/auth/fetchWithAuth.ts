import { toBackendUrlFromApi } from "@/lib/api/backend";
import { buildAuthHeaders } from "@/lib/auth/clientToken";
/**
 * Authenticated fetch: on 401, calls POST /api/auth/refresh-token then retries the request once.
 * Use for calls to API routes that require accessToken (cookies sent with credentials: "include").
 * If the response is still 401 after refresh, the caller should logout (POST /api/auth/logout) and redirect to /login.
 */
export async function fetchWithAuth(
  url: string,
  init?: RequestInit,
  retried = false
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: buildAuthHeaders(init?.headers),
  });
  if (res.status !== 401 || retried) return res;

  const refreshRes = await fetch(toBackendUrlFromApi("/api/auth/refresh-token"), {
    method: "POST",
    credentials: "include",
  });
  if (!refreshRes.ok) return res;

  return fetchWithAuth(url, init, true);
}
