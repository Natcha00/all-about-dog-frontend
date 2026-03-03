import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  const url = process.env.NEXT_BACKEND_API_URL;
  if (!url) throw new Error("NEXT_BACKEND_API_URL is not set");
  return url.replace(/\/$/, "");
};

/** Backend path for slip upload. Override in .env if backend uses a different path (e.g. /reservation/upload-slip). */
const getSlipPath = () => {
  const path = process.env.RESERVATION_SLIP_PATH;
  return path ? path.replace(/^\//, "") : "reservation/slip/upload";
};

export async function POST(request: NextRequest) {
  try {
    const base = getBaseUrl();
    const form = await request.formData();

    const code = form.get("code");
    const file = form.get("file");

    if (typeof code !== "string" || !file) {
      return NextResponse.json(
        { error: "Missing required fields: code, file" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const forwardForm = new FormData();
    forwardForm.append("code", code);
    forwardForm.append("file", file);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const slipPath = getSlipPath();
    const url = `${base}/${slipPath}`;
    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers,
      body: forwardForm,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const is404 = res.status === 404;
      const message = is404
        ? "Backend ยังไม่มี endpoint อัปโหลดสลิป หรือ path ผิด (ลองตั้ง RESERVATION_SLIP_PATH ใน .env)"
        : (data?.message ?? "Failed to upload slip");
      return NextResponse.json(
        { error: message, detail: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation slip upload failed", detail: message },
      { status: 500 }
    );
  }
}

