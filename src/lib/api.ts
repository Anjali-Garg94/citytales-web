import {
  organiserColumns as fallbackOrganiserColumns,
  type Organiser,
  type TodayEvent,
  type WeekEvent,
} from "./data";
import type { MonthEvent, WeekendEvent } from "./placeholder-month-data";

/**
 * Base URL for the CityTales backend API.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local to override.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

/** Shape returned by GET /api/v1/public/website/carousel */
export type CarouselOrganiser = {
  id: string;
  name: string;
  coverUrl: string;
  column: number;
  position: number;
};

function isCarouselOrganiser(value: unknown): value is CarouselOrganiser {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.coverUrl === "string" &&
    typeof v.column === "number" &&
    typeof v.position === "number"
  );
}

/**
 * Fetches the organiser carousel from the backend and groups it into the
 * three marquee columns, ordered by `position` within each column.
 *
 * Runs server-side only — the backend is plain HTTP, so fetching it from the
 * browser on an HTTPS site would be blocked as mixed content.
 *
 * Falls back to the bundled static organisers if the API is unreachable or
 * returns something unexpected, so the page never breaks on a backend outage.
 */
export async function getOrganiserColumns(): Promise<Organiser[][]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/public/website/carousel`,
      // Cache for an hour; organiser lineup changes rarely.
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      console.error(
        `[carousel] API responded ${res.status} ${res.statusText} — using fallback organisers`,
      );
      return fallbackOrganiserColumns;
    }

    const json: unknown = await res.json();

    if (!Array.isArray(json)) {
      console.error("[carousel] Expected an array — using fallback organisers");
      return fallbackOrganiserColumns;
    }

    const items = json.filter(isCarouselOrganiser);

    if (items.length === 0) {
      console.error("[carousel] No valid records — using fallback organisers");
      return fallbackOrganiserColumns;
    }

    // Group into columns (1-indexed in the API), ordered by position.
    const columnNumbers = [...new Set(items.map((i) => i.column))].sort(
      (a, b) => a - b,
    );

    const columns = columnNumbers.map((col) =>
      items
        .filter((i) => i.column === col)
        .sort((a, b) => a.position - b.position)
        .map<Organiser>((i) => ({ name: i.name, image: i.coverUrl })),
    );

    return columns.filter((col) => col.length > 0);
  } catch (error) {
    console.error(
      "[carousel] Fetch failed — using fallback organisers:",
      error instanceof Error ? error.message : error,
    );
    return fallbackOrganiserColumns;
  }
}

/* ------------------------------------------------------------------ *
 * Today's events
 * ------------------------------------------------------------------ */

/** One record inside the `content` array of GET /api/v1/event/todayEvents */
type ApiEvent = {
  id: string;
  title: string;
  categoryIds?: string[];
  venue?: { address?: string; city?: string } | null;
  dates?: { date?: string; startTime?: string | null; endTime?: string | null }[];
  startDate?: string;
  imageUrls?: { coverUrlS3Path?: string | null } | null;
};

/** Spring-style paginated envelope */
type Paginated<T> = { content?: T[]; totalElements?: number };

/** One record from GET /api/v1/category */
type ApiCategory = {
  id: string;
  name: string;
  label?: string | null;
  type?: string | null;
};

/**
 * Builds an id -> display-name lookup for EVENT categories.
 * Prefers the shorter `label` for the card badge, falling back to `name`.
 */
async function getEventCategoryNames(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/category`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return map;

    const json: unknown = await res.json();
    if (!Array.isArray(json)) return map;

    for (const c of json as ApiCategory[]) {
      if (typeof c?.id === "string" && typeof c?.name === "string") {
        map.set(c.id, (c.label?.trim() || c.name).toUpperCase());
      }
    }
  } catch {
    // Badge just falls back to a generic label below.
  }
  return map;
}

/** "21:21" -> "9:21 PM". Returns "" if unparseable. */
function formatTime(hhmm: string | null | undefined): string {
  if (!hhmm) return "";
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm.trim());
  if (!m) return "";
  const h = Number(m[1]);
  const min = m[2];
  if (Number.isNaN(h) || h > 23) return "";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${min} ${period}`;
}

/** "Athletic Track P.A.U, Ludhiana, Punjab, India" -> "Athletic Track P.A.U" */
function shortVenue(address: string | null | undefined, city?: string | null): string {
  const first = address?.split(",")[0]?.trim();
  return first || city?.trim() || "";
}

/**
 * Fetches today's events for the homepage rail.
 *
 * Returns an EMPTY array both when there genuinely are no events today and
 * when the API is unavailable — deliberately NOT falling back to the sample
 * events, since showing invented events (with invented times and venues) on a
 * live public site could send people to things that do not exist. The section
 * renders an honest empty state instead.
 */
export async function getTodayEvents(): Promise<TodayEvent[]> {
  try {
    const [res, categoryNames] = await Promise.all([
      fetch(`${API_BASE_URL}/api/v1/event/todayEvents?page=0&size=10`, {
        // Today's list changes through the day — refresh every 5 minutes.
        next: { revalidate: 300 },
      }),
      getEventCategoryNames(),
    ]);

    if (!res.ok) {
      console.error(
        `[todayEvents] API responded ${res.status} ${res.statusText} — showing empty state`,
      );
      return [];
    }

    const json = (await res.json()) as Paginated<ApiEvent> | unknown;
    const content = (json as Paginated<ApiEvent>)?.content;

    if (!Array.isArray(content)) {
      console.error("[todayEvents] Unexpected response shape — showing empty state");
      return [];
    }

    return content
      .filter((e): e is ApiEvent => typeof e?.title === "string")
      .map<TodayEvent>((e) => {
        const categoryId = e.categoryIds?.[0];
        return {
          time: formatTime(e.dates?.[0]?.startTime),
          image: e.imageUrls?.coverUrlS3Path || "/images/events/hero-wide.jpg",
          category:
            (categoryId && categoryNames.get(categoryId)) || "EVENT",
          title: e.title,
          venue: shortVenue(e.venue?.address, e.venue?.city),
        };
      });
  } catch (error) {
    console.error(
      "[todayEvents] Fetch failed — showing empty state:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * This week
 * ------------------------------------------------------------------ */

/** Shape returned by GET /api/v1/event/section?key=... */
type ApiSection = {
  key?: string;
  title?: string;
  hasMore?: boolean;
  events?: ApiEvent[];
};

/** Ludhiana — the launch city. Override with NEXT_PUBLIC_CITY_ID. */
export const CITY_ID =
  process.env.NEXT_PUBLIC_CITY_ID ?? "69ddfd45f46c8343ca62b4b7";

/**
 * "2026-09-20T09:30:00Z" -> "Sun, 20 Sept"
 *
 * Formatted in Asia/Kolkata deliberately: the API returns UTC instants, and an
 * evening IST event lands on the previous day in UTC, so formatting without
 * the timezone would show the wrong date.
 */
function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")}`;
}

/**
 * Fetches a homepage section (THIS_WEEK, etc.) for a city.
 *
 * Like today's events, this returns an empty array on failure rather than
 * falling back to the sample events — inventing listings on a live site would
 * point people at events that do not exist.
 */
export async function getSectionEvents(
  key: string = "THIS_WEEK",
  size = 20,
): Promise<WeekEvent[]> {
  try {
    const url = `${API_BASE_URL}/api/v1/event/section?cityId=${encodeURIComponent(
      CITY_ID,
    )}&key=${encodeURIComponent(key)}&page=0&size=${size}`;

    const [res, categoryNames] = await Promise.all([
      fetch(url, { next: { revalidate: 300 } }),
      getEventCategoryNames(),
    ]);

    if (!res.ok) {
      console.error(
        `[section:${key}] API responded ${res.status} ${res.statusText} — showing empty state`,
      );
      return [];
    }

    const json = (await res.json()) as ApiSection | unknown;
    const events = (json as ApiSection)?.events;

    if (!Array.isArray(events)) {
      console.error(`[section:${key}] Unexpected response shape — showing empty state`);
      return [];
    }

    return events
      .filter((e): e is ApiEvent => typeof e?.title === "string")
      .map<WeekEvent>((e) => {
        const categoryId = e.categoryIds?.[0];
        return {
          image: e.imageUrls?.coverUrlS3Path || "/images/events/hero-wide.jpg",
          title: e.title.trim(),
          category: (categoryId && categoryNames.get(categoryId)) || "EVENT",
          venue: shortVenue(e.venue?.address, e.venue?.city),
          date: formatEventDate(e.startDate ?? e.dates?.[0]?.date),
        };
      });
  } catch (error) {
    console.error(
      `[section:${key}] Fetch failed — showing empty state:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * This Month — This week / Next week / After next week
 * ------------------------------------------------------------------ */

/**
 * "2026-09-20T09:30:00Z" -> "2026-09-20" (Asia/Kolkata calendar date)
 *
 * Same UTC-vs-IST reasoning as formatEventDate above, but ISO output — this
 * is what MonthEventCard/MonthEventList's dayNumber()/weekdayShort() parse.
 */
function formatEventDateISO(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Fetches a "This Month" section — THIS_WEEK, NEXT_WEEK, AFTER_NEXT_WEEK —
 * for the This Month cards/lists on the homepage.
 *
 * Returns MonthEvent (ISO date, start/end time, id-as-slug) rather than
 * getSectionEvents' WeekEvent — that shape is what the /this-week page uses,
 * this one is what MonthEventCard/MonthEventList/groupByDate expect.
 *
 * Empty array on failure or absence, same policy as the other live
 * sections: no invented listings on an outage. Events with no parseable
 * date are dropped since the list is date-anchored.
 */
export async function getMonthSectionEvents(
  key: string,
  size = 20,
): Promise<MonthEvent[]> {
  try {
    const url = `${API_BASE_URL}/api/v1/event/section?cityId=${encodeURIComponent(
      CITY_ID,
    )}&key=${encodeURIComponent(key)}&page=0&size=${size}`;

    const [res, categoryNames] = await Promise.all([
      fetch(url, { next: { revalidate: 300 } }),
      getEventCategoryNames(),
    ]);

    if (!res.ok) {
      console.error(
        `[month:${key}] API responded ${res.status} ${res.statusText} — showing empty state`,
      );
      return [];
    }

    const json = (await res.json()) as ApiSection | unknown;
    const events = (json as ApiSection)?.events;

    if (!Array.isArray(events)) {
      console.error(`[month:${key}] Unexpected response shape — showing empty state`);
      return [];
    }

    return events
      .filter((e): e is ApiEvent => typeof e?.title === "string")
      .map<MonthEvent>((e) => {
        const categoryId = e.categoryIds?.[0];
        const firstDate = e.dates?.[0];
        return {
          id: e.id,
          slug: e.id,
          title: e.title.trim(),
          venue: shortVenue(e.venue?.address, e.venue?.city),
          category: (categoryId && categoryNames.get(categoryId)) || "EVENT",
          date: formatEventDateISO(e.startDate ?? firstDate?.date),
          startTime: formatTime(firstDate?.startTime),
          endTime: formatTime(firstDate?.endTime) || undefined,
          image: e.imageUrls?.coverUrlS3Path || "/images/events/hero-wide.jpg",
        };
      })
      .filter((e) => e.date !== "");
  } catch (error) {
    console.error(
      `[month:${key}] Fetch failed — showing empty state:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * Live music & parties — This weekend / All
 * ------------------------------------------------------------------ */

/** Music & Parties category id — filters the section endpoint server-side. */
const MUSIC_PARTIES_CATEGORY_ID = "6aa0fff6a0724544586e816e";

/** "8:00 PM" + "11:00 PM" -> "8:00 PM – 11:00 PM"; no end time -> "8:00 PM – Late" */
function formatTimeRange(start: string, end: string): string {
  if (!start) return "";
  return end ? `${start} – ${end}` : `${start} – Late`;
}

/**
 * Fetches the Live music & parties carousel for a tab — THIS_WEEK for
 * "This weekend", ALL for "All" — filtered server-side to the Music &
 * Parties category via categoryId.
 *
 * Empty array on failure or absence, same no-invented-listings policy as the
 * other live sections.
 */
export async function getMusicPartiesEvents(
  key: "THIS_WEEK" | "ALL",
  size = 20,
): Promise<WeekendEvent[]> {
  try {
    const url = `${API_BASE_URL}/api/v1/event/section?cityId=${encodeURIComponent(
      CITY_ID,
    )}&key=${encodeURIComponent(key)}&categoryId=${encodeURIComponent(
      MUSIC_PARTIES_CATEGORY_ID,
    )}&page=0&size=${size}`;

    const [res, categoryNames] = await Promise.all([
      fetch(url, { next: { revalidate: 300 } }),
      getEventCategoryNames(),
    ]);

    if (!res.ok) {
      console.error(
        `[music:${key}] API responded ${res.status} ${res.statusText} — showing empty state`,
      );
      return [];
    }

    const json = (await res.json()) as ApiSection | unknown;
    const events = (json as ApiSection)?.events;

    if (!Array.isArray(events)) {
      console.error(`[music:${key}] Unexpected response shape — showing empty state`);
      return [];
    }

    return events
      .filter((e): e is ApiEvent => typeof e?.title === "string")
      .map<WeekendEvent>((e) => {
        const categoryId = e.categoryIds?.[0];
        const firstDate = e.dates?.[0];
        const startTime = formatTime(firstDate?.startTime);
        const endTime = formatTime(firstDate?.endTime);
        return {
          id: e.id,
          slug: e.id,
          title: e.title.trim(),
          dateLabel: formatEventDate(e.startDate ?? firstDate?.date),
          timeLabel: formatTimeRange(startTime, endTime),
          venue: shortVenue(e.venue?.address, e.venue?.city),
          category: (categoryId && categoryNames.get(categoryId)) || "MUSIC",
          image: e.imageUrls?.coverUrlS3Path || "/images/hero/hero-party-real.jpg",
        };
      });
  } catch (error) {
    console.error(
      `[music:${key}] Fetch failed — showing empty state:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * Event categories (with imagery)
 * ------------------------------------------------------------------ */

export type EventCategory = {
  id: string;
  /** Full name, e.g. "Health & Wellness" */
  name: string;
  /** Short display label, e.g. "Wellness" */
  label: string;
  imageUrl: string;
};

/**
 * Used only if the category endpoint is unreachable. These are taxonomy
 * labels, not event claims, so showing them during an outage is safe —
 * they point at local placeholder imagery rather than inventing listings.
 */
const FALLBACK_EVENT_CATEGORIES: EventCategory[] = [
  { id: "f-club", name: "Community Clubs", label: "Club", imageUrl: "/images/events/cat-clubs.jpg" },
  { id: "f-exhibition", name: "Exhibition", label: "Exhibition", imageUrl: "/images/events/cat-exhibitions.jpg" },
  { id: "f-festive", name: "Festive", label: "Festive", imageUrl: "/images/events/hero-wide.jpg" },
  { id: "f-wellness", name: "Health & Wellness", label: "Wellness", imageUrl: "/images/events/grid-g.jpg" },
  { id: "f-kids", name: "Kids", label: "Kids", imageUrl: "/images/events/cat-activities.jpg" },
  { id: "f-live", name: "Live Shows", label: "Live Shows", imageUrl: "/images/events/port-mic.jpg" },
  { id: "f-music", name: "Music & Parties", label: "Music", imageUrl: "/images/events/feat-dusk.jpg" },
  { id: "f-workshops", name: "Social Activities", label: "Workshops", imageUrl: "/images/events/grid-d.jpg" },
];

/**
 * Fetches the EVENT category taxonomy, each with its own cover image.
 *
 * GET /api/v1/category/type/event -> a plain array (not a page envelope).
 */
export async function getEventCategories(): Promise<EventCategory[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/category/type/event?page=0&size=50`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      console.error(
        `[categories] API responded ${res.status} ${res.statusText} — using fallback categories`,
      );
      return FALLBACK_EVENT_CATEGORIES;
    }

    const json: unknown = await res.json();
    if (!Array.isArray(json)) {
      console.error("[categories] Expected an array — using fallback categories");
      return FALLBACK_EVENT_CATEGORIES;
    }

    const items = (json as ApiCategory[])
      .filter(
        (c): c is ApiCategory & { imageUrl: string } =>
          typeof c?.id === "string" &&
          typeof c?.name === "string" &&
          typeof (c as { imageUrl?: unknown }).imageUrl === "string",
      )
      .map<EventCategory>((c) => ({
        id: c.id,
        name: c.name,
        label: c.label?.trim() || c.name,
        imageUrl: (c as unknown as { imageUrl: string }).imageUrl,
      }));

    return items.length > 0 ? items : FALLBACK_EVENT_CATEGORIES;
  } catch (error) {
    console.error(
      "[categories] Fetch failed — using fallback categories:",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_EVENT_CATEGORIES;
  }
}
