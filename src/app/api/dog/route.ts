import { NextResponse } from "next/server";
import { getDogs } from "@/app/api/dog/backend";

/**
 * GET /api/dog — proxy to NEXT_BACKEND_API_URL/dog with auth from cookie.
 * Used by walkin StepPet (client) to list user's dogs for PICK MODE.
 */
export async function GET() {
  try {
    const dogs = await getDogs();
    return NextResponse.json(dogs);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("401") || message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dogs", detail: message },
      { status: 500 }
    );
  }
}
