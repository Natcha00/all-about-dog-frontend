import { NextResponse } from "next/server";
import { getDogProfile } from "@/app/api/dog/backend";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/dog/[id]/profile — proxy to NEXT_BACKEND_API_URL/dog/:id/profile with auth from cookie.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing dog id" }, { status: 400 });
    }
    const data = await getDogProfile(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("401") || message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dog profile", detail: message },
      { status: 500 }
    );
  }
}
