import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

export type BreedOption = {
  id: number;
  nameTh: string;
  nameEng: string;
  size: string;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/dog/breeds`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Breeds fetch failed", detail: message },
      { status: 500 }
    );
  }
}
