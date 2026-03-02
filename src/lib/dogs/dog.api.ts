import { cookies } from "next/headers";
import type { DogApiItem, DogProfileApiResponse } from "./dog.type";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

/**
 * Fetch all dogs from backend GET /dog.
 * Sends auth token from cookie "token" in Authorization header.
 * Use from Server Component only (uses process.env.NEXT_BACKEND_API_URL).
 */
export async function getDogs(): Promise<DogApiItem[]> {
  const base = getBaseUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}/dog`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dogs: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch single dog profile from backend GET /:id/profile.
 * Sends auth token from cookie in Authorization header.
 */
export async function getDogProfile(
  id: string
): Promise<DogProfileApiResponse | null> {
  const base = getBaseUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}/dog/${id}/profile`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch dog profile: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data?.header && data?.profile ? data : null;
}
