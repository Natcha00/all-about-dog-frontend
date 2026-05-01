import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type CoatTypeOption = { value: string; label: string };

export async function GET() {
  const cookieStore = await cookies();
  return withAuthRefresh(cookieStore, async (token) => {
    const base = getBaseUrl();
    return fetch(`${base}/dog/options/coat-types`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  });
}
