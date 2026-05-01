import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type DogOwnerProfile = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
};

/**
 * GET /api/account/profile — proxy to backend GET /dog-owner/profile with auth.
 * On 401, tries refresh-token then retries; if refresh fails returns 401.
 */
export async function GET() {
  const cookieStore = await cookies();
  return withAuthRefresh(cookieStore, async (token) => {
    const base = getBaseUrl();
    return fetch(`${base}/dog-owner/profile`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  });
}

export type PatchProfileBody = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string | null;
};

/**
 * PATCH /api/account/profile — proxy to PATCH /dog-owner/profile with auth.
 * Body (JSON): optional firstName, lastName, phoneNumber, address. Send only fields to update.
 * On 401, tries refresh-token then retries.
 */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  let body: PatchProfileBody;
  try {
    body = (await request.json()) as PatchProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload: Record<string, string | null> = {};
  if (body.firstName !== undefined) payload.firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  if (body.lastName !== undefined) payload.lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  if (body.phoneNumber !== undefined) payload.phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  if (body.address !== undefined) payload.address = body.address === null || body.address === "" ? null : (typeof body.address === "string" ? body.address.trim() : "");

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "ส่งฟิลด์ที่ต้องการแก้อย่างน้อย 1 ฟิลด์" }, { status: 400 });
  }

  return withAuthRefresh(cookieStore, async (token) => {
    const base = getBaseUrl();
    return fetch(`${base}/dog-owner/profile`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  });
}
