import { NextResponse, type NextRequest } from "next/server";
import { CITY_ID } from "@/lib/api";
import { getAccessToken, getSessionUser } from "@/lib/auth-session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

/**
 * Proxy for GET /api/v1/user/{userId}/saved-events
 * and POST /api/v1/user/{userId}/saved-events
 *
 * Browser never sees the Bearer token — it lives in the httpOnly cookie.
 */

export async function GET(request: NextRequest) {
  const [user, accessToken] = await Promise.all([
    getSessionUser(),
    getAccessToken(),
  ]);
  if (!user || !accessToken) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const cityId =
    request.nextUrl.searchParams.get("cityId") ||
    user.cityId ||
    CITY_ID;
  const page = request.nextUrl.searchParams.get("page") ?? "0";
  const size = request.nextUrl.searchParams.get("size") ?? "100";

  try {
    const url = `${API_BASE_URL}/api/v1/user/${encodeURIComponent(
      user.id,
    )}/saved-events?cityId=${encodeURIComponent(cityId)}&page=${encodeURIComponent(
      page,
    )}&size=${encodeURIComponent(size)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Bad response from saved-events" },
        { status: 502 },
      );
    }

    if (!res.ok) {
      const message =
        (data as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ message }, { status: res.status });
    }

    // Normalise to a flat list of event ids the client can check membership on.
    const content = Array.isArray((data as { content?: unknown })?.content)
      ? ((data as { content: unknown[] }).content)
      : Array.isArray(data)
        ? data
        : [];

    const eventIds = content
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item !== "object" || item === null) return null;
        const r = item as Record<string, unknown>;
        if (typeof r.eventId === "string") return r.eventId;
        if (typeof r.id === "string") return r.id;
        if (typeof r.event === "object" && r.event !== null) {
          const e = r.event as Record<string, unknown>;
          if (typeof e.id === "string") return e.id;
        }
        return null;
      })
      .filter((id): id is string => typeof id === "string");

    return NextResponse.json({ eventIds });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load saved events";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const [user, accessToken] = await Promise.all([
    getSessionUser(),
    getAccessToken(),
  ]);
  if (!user || !accessToken) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { eventId, cityId, save } =
    (body as {
      eventId?: unknown;
      cityId?: unknown;
      save?: unknown;
    } | null) ?? {};

  if (typeof eventId !== "string" || !eventId.trim()) {
    return NextResponse.json({ message: "eventId required" }, { status: 400 });
  }
  if (typeof save !== "boolean") {
    return NextResponse.json({ message: "save must be boolean" }, { status: 400 });
  }

  const resolvedCityId =
    (typeof cityId === "string" && cityId.trim()) ||
    user.cityId ||
    CITY_ID;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/user/${encodeURIComponent(user.id)}/saved-events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId.trim(),
          cityId: resolvedCityId,
          save,
        }),
        cache: "no-store",
      },
    );

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message =
        (data as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json({ ok: true, save, eventId: eventId.trim() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update saved event";
    return NextResponse.json({ message }, { status: 502 });
  }
}
