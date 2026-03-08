import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export type VaccineTypeOption = { value: string; label: string };

export async function GET() {
  try {
    const base = getBaseUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}/dog/options/vaccine-types`, {
      cache: "no-store",
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch vaccine types", detail: text },
        { status: res.status }
      );
    }
    const data: VaccineTypeOption[] = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Vaccine types fetch failed", detail: message },
      { status: 500 }
    );
  }
}
