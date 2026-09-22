import { NextResponse, type NextRequest } from "next/server";
import { getAccessToken } from "@/lib/auth-session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

/**
 * Fire-and-forget analytics: POST /api/v1/event/{eventId}/booking/{optionId}/click
 *
 * Auth is optional — the app still records clicks for guests when possible.
 * Failures are returned as 204-equivalent success to the client so booking
 * navigation is never blocked.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ eventId: string; optionId: string }> },
) {
  const { eventId, optionId } = await context.params;
  if (!eventId || !optionId) {
    return NextResponse.json({ ok: true });
  }

  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    await fetch(
      `${API_BASE_URL}/api/v1/event/${encodeURIComponent(
        eventId,
      )}/booking/${encodeURIComponent(optionId)}/click`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      },
    );
  } catch {
    // Deliberately ignored — a dropped click count must never block booking.
  }

  return NextResponse.json({ ok: true });
}
