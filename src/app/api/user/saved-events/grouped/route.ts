import { NextResponse, type NextRequest } from "next/server";
import { CITY_ID } from "@/lib/api";
import { authedBackendFetch, getSessionUser } from "@/lib/auth-session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

function shortVenue(address?: string | null, city?: string | null): string {
  const first = address?.split(",")[0]?.trim();
  return first || city?.trim() || "";
}

function mapEventPayload(raw: Record<string, unknown>) {
  const id = typeof raw.id === "string" ? raw.id : null;
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
 * GET /api/v1/user/{userId}/saved-events/grouped?cityId=
 * Active saved events, grouped by day (IST) — unpaginated.
 * Uses authedBackendFetch: 401 → refresh token → retry once.
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

  try {
    const url = `${API_BASE_URL}/api/v1/user/${encodeURIComponent(
      user.id,
    )}/saved-events/grouped?cityId=${encodeURIComponent(cityId)}`;

    const res = await authedBackendFetch(url);

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Bad response from saved-events/grouped" },
        { status: 502 },
      );
    }

    if (!res.ok) {
      const message =
        (data as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ message }, { status: res.status });
    }

    const rawGroups = Array.isArray(
      (data as { groups?: unknown })?.groups,
    )
      ? ((data as { groups: unknown[] }).groups)
      : [];

    const groups = rawGroups
      .map((g) => {
        if (typeof g !== "object" || g === null) return null;
        const group = g as Record<string, unknown>;
        const dateKey =
          typeof group.dateKey === "string" ? group.dateKey : "";
        const label =
          typeof group.label === "string" ? group.label : dateKey || "Upcoming";
        const today = group.today === true;
        const rawEvents = Array.isArray(group.events) ? group.events : [];

        const events = rawEvents
          .map((item) => {
            if (typeof item !== "object" || item === null) return null;
            const row = item as Record<string, unknown>;
            const eventRaw =
              typeof row.event === "object" && row.event !== null
                ? (row.event as Record<string, unknown>)
                : row;
            const mapped = mapEventPayload(eventRaw);
            if (!mapped) return null;
            return {
              ...mapped,
              startTimeLabel:
                typeof row.startTimeLabel === "string"
                  ? row.startTimeLabel
                  : typeof row.startTime === "string"
                    ? row.startTime
                    : "",
              urgencyChip:
                typeof row.urgencyChip === "string" ? row.urgencyChip : "",
            };
          })
          .filter((e): e is NonNullable<typeof e> => e !== null);

        if (events.length === 0) return null;
        return { dateKey, label, today, events };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);

    const totalEvents =
      typeof (data as { totalEvents?: unknown })?.totalEvents === "number"
        ? (data as { totalEvents: number }).totalEvents
        : groups.reduce((n, g) => n + g.events.length, 0);

    return NextResponse.json({ groups, totalEvents });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load saved events";
    return NextResponse.json({ message }, { status: 502 });
  }
}
