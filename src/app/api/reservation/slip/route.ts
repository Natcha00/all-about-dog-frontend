import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

/** Backend path for slip upload. Override in .env if backend uses a different path (e.g. /reservation/upload-slip). */
const getSlipPath = () => {
  const path = process.env.RESERVATION_SLIP_PATH;
  return path ? path.replace(/^\//, "") : "reservation/slip/upload";
};

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const code = form.get("code");
    const file = form.get("file");

    if (typeof code !== "string" || !file) {
      return NextResponse.json(
        { error: "Missing required fields: code, file" },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const cookieStore = await cookies();

    const forwardForm = new FormData();
    forwardForm.append("code", code);
    forwardForm.append("file", file);

    const slipPath = getSlipPath();
    const url = `${base}/${slipPath}`;

    return withAuthRefresh(cookieStore, async (token) =>
      fetch(url, {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: forwardForm,
      })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Reservation slip upload failed", detail: message },
      { status: 500 }
    );
  }
}

