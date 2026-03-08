import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuthRefresh, getBaseUrl } from "@/lib/auth/serverWithRefresh";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/dog/[id] — proxy to NEXT_BACKEND_API_URL/dog/:id with auth from cookie.
 * Dog owner: DELETE /dog/:id
 * On 401, tries refresh-token then retries; if refresh fails returns 401.
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing dog id" }, { status: 400 });
    }
    const cookieStore = await cookies();
    return withAuthRefresh(cookieStore, async (token) => {
      const base = getBaseUrl();
      return fetch(`${base}/dog/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("401") || message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete dog", detail: message },
      { status: 500 }
    );
  }
}
