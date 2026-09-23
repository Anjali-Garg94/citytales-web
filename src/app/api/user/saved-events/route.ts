import { NextResponse, type NextRequest } from "next/server";
import { CITY_ID } from "@/lib/api";
import { authedBackendFetch, getSessionUser } from "@/lib/auth-session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

function shortVenue(address?: string | null, city?: string | null): string {
  const first = address?.split(",")[0]?.trim();
  return first || city?.trim() || "";
}

function mapContentItem(item: unknown) {
  if (typeof item !== "object" || item === null) return null;
  const r = item as Record<string, unknown>;
  const raw =
    typeof r.event === "object" && r.event !== null
      ? (r.event as Record<string, unknown>)
      : r;
  const id =
    typeof raw.id === "string"
      ? raw.id
      : typeof r.eventId === "string"
        ? r.eventId
        : null;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!id || !title) return null;

  const imageUrls = raw.imageUrls as
    | { coverUrlS3Path?: string; coverUrlS3Full?: string }
    | null
    | undefined;
  const venue = raw.venue as
    | { address?: string; city?: string }
    | null
    | undefined;

  return {
    id,
    title,
    image:
      imageUrls?.coverUrlS3Path ||
      imageUrls?.coverUrlS3Full ||
      "/images/events/hero-wide.jpg",
    venue: shortVenue(venue?.address, venue?.city),
    city: venue?.city?.trim() || "",
  };
}

/**
 * Proxy for GET/POST /api/v1/user/{userId}/saved-events
 * Auth: authedBackendFetch refreshes the access token on 401 and retries once.
 */

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const cityId =
    request.nextUrl.searchParams.get("cityId") ||
    user.cityId ||
    CITY_ID;
  const page = request.nextUrl.searchParams.get("page") ?? "0";
  const size = request.nextUrl.searchParams.get("size") ?? "50";
  const status = request.nextUrl.searchParams.get("status");

  try {
    const params = new URLSearchParams({
      cityId,
      page,
      size,
    });
    if (status) params.set("status", status);

    const url = `${API_BASE_URL}/api/v1/user/${encodeURIComponent(
      user.id,
    )}/saved-events?${params.toString()}`;

    const res = await authedBackendFetch(url);

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

    const content = Array.isArray((data as { content?: unknown })?.content)
      ? ((data as { content: unknown[] }).content)
      : Array.isArray(data)
        ? data
        : [];

    const events = content
      .map(mapContentItem)
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const eventIds = [
      ...new Set([
        ...events.map((e) => e.id),
        ...content
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
          .filter((id): id is string => typeof id === "string"),
      ]),
    ];

    const pageData = data as {
      totalElements?: number;
      last?: boolean;
      number?: number;
    } | null;

    return NextResponse.json({
      eventIds,
      events,
      totalElements:
        typeof pageData?.totalElements === "number"
          ? pageData.totalElements
          : events.length,
      last: pageData?.last !== false,
      page: typeof pageData?.number === "number" ? pageData.number : Number(page),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load saved events";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
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
    const res = await authedBackendFetch(
      `${API_BASE_URL}/api/v1/user/${encodeURIComponent(user.id)}/saved-events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.trim(),
          cityId: resolvedCityId,
          save,
        }),
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
