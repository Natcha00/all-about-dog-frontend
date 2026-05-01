import { NextResponse } from "next/server";

type BannerItem = {
  id: number;
  imageUrl: string;
};

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

export async function GET() {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/news/banner`, {
      headers: { Accept: "application/json" },
      // Banner content can change, but doesn't need super fresh data per request.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch banner", detail: text },
        { status: res.status },
      );
    }

    const data: BannerItem[] = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Banner fetch failed", detail: message },
      { status: 500 },
    );
  }
}

