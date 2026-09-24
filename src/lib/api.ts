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
      .filter((e): e is ApiEvent => typeof e?.title === "string" && typeof e?.id === "string")
      .map<TodayEvent>((e) => {
        const categoryId = e.categoryIds?.[0];
        return {
          id: e.id,
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
  categoryId?: string,
): Promise<MonthEvent[]> {
  try {
    const params = new URLSearchParams({
      cityId: CITY_ID,
      key,
      page: "0",
      size: String(size),
    });
    if (categoryId) params.set("categoryId", categoryId);

    const url = `${API_BASE_URL}/api/v1/event/section?${params.toString()}`;

    const [res, categoryNames] = await Promise.all([
      fetch(url, { next: { revalidate: 300 } }),
      getEventCategoryNames(),
    ]);

    if (!res.ok) {
      console.error(
        `[month:${key}${categoryId ? `:${categoryId}` : ""}] API responded ${res.status} ${res.statusText} — showing empty state`,
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
        const catId = e.categoryIds?.[0];
        const firstDate = e.dates?.[0];
        return {
          id: e.id,
          slug: e.id,
          title: e.title.trim(),
          venue: shortVenue(e.venue?.address, e.venue?.city),
          category: (catId && categoryNames.get(catId)) || "EVENT",
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

/**
 * Events for one category — prefers GET /api/v1/event/category/{categoryId}.
 * That path currently 500s on the live API, so we fall back to merging
 * section feeds filtered by categoryId (THIS_WEEK / NEXT_WEEK / …).
 */
export async function getEventsByCategory(
  categoryId: string,
  size = 60,
): Promise<MonthEvent[]> {
  const categoryNames = await getEventCategoryNames();

  try {
    const params = new URLSearchParams({
      cityId: CITY_ID,
      page: "0",
      size: String(size),
    });
    const url = `${API_BASE_URL}/api/v1/event/category/${encodeURIComponent(
      categoryId,
    )}?${params.toString()}`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (res.ok) {
      const json: unknown = await res.json();
      const mapped = mapApiEventsToMonthEvents(
        extractApiEventList(json),
        categoryNames,
        categoryId,
      );
      if (mapped.length > 0) return mapped;
      console.warn(
        `[category:${categoryId}] Endpoint returned OK but no mappable events — using section fallback`,
      );
    } else {
      console.error(
        `[category:${categoryId}] API responded ${res.status} ${res.statusText} — using section fallback`,
      );
    }
  } catch (error) {
    console.error(
      `[category:${categoryId}] Fetch failed — using section fallback:`,
      error instanceof Error ? error.message : error,
    );
  }

  // Fallback: same filter the app uses on section endpoints.
  const batches = await Promise.all([
    getMonthSectionEvents("THIS_WEEK", size, categoryId),
    getMonthSectionEvents("NEXT_WEEK", size, categoryId),
    getMonthSectionEvents("AFTER_NEXT_WEEK", size, categoryId),
    getMonthSectionEvents("UPCOMING", size, categoryId),
  ]);

  const seen = new Set<string>();
  return batches.flat().filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

/** Pull an ApiEvent[] out of array / {events} / {content} / nested {event} rows. */
function extractApiEventList(json: unknown): ApiEvent[] {
  const rows: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as { events?: unknown })?.events)
      ? ((json as { events: unknown[] }).events)
      : Array.isArray((json as { content?: unknown })?.content)
        ? ((json as { content: unknown[] }).content)
        : [];

  return rows
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const row = item as Record<string, unknown>;
      if (typeof row.event === "object" && row.event !== null) {
        return row.event as ApiEvent;
      }
      return item as ApiEvent;
    })
    .filter((e): e is ApiEvent => typeof e?.title === "string" && typeof e?.id === "string");
}

function mapApiEventsToMonthEvents(
  events: ApiEvent[],
  categoryNames: Map<string, string>,
  fallbackCategoryId?: string,
): MonthEvent[] {
  return events
    .map<MonthEvent>((e) => {
      const catId = e.categoryIds?.[0] ?? fallbackCategoryId;
      const firstDate = e.dates?.[0];
      return {
        id: e.id,
        slug: e.id,
        title: e.title.trim(),
        venue: shortVenue(e.venue?.address, e.venue?.city),
        category: (catId && categoryNames.get(catId)) || "EVENT",
        date: formatEventDateISO(e.startDate ?? firstDate?.date),
        startTime: formatTime(firstDate?.startTime),
        endTime: formatTime(firstDate?.endTime) || undefined,
        image: e.imageUrls?.coverUrlS3Path || "/images/events/hero-wide.jpg",
      };
    })
    .filter((e) => e.date !== "");
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

/** Split an ISO instant into SAT / 23 / SEP for the Live Music list cards. */
function formatMusicDateParts(iso: string | null | undefined): {
  weekday: string;
  day: string;
  month: string;
} {
  if (!iso) return { weekday: "", day: "", month: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { weekday: "", day: "", month: "" };
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    weekday: get("weekday").slice(0, 3).toUpperCase(),
    day: get("day"),
    month: get("month").slice(0, 3).toUpperCase(),
  };
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
        const iso = e.startDate ?? firstDate?.date;
        const dateParts = formatMusicDateParts(iso);
        return {
          id: e.id,
          slug: e.id,
          title: e.title.trim(),
          dateLabel: formatEventDate(iso),
          timeLabel: formatTimeRange(startTime, endTime),
          venue: shortVenue(e.venue?.address, e.venue?.city),
          city: e.venue?.city?.trim() || "",
          category: (categoryId && categoryNames.get(categoryId)) || "MUSIC",
          image: e.imageUrls?.coverUrlS3Path || "/images/hero/hero-party-real.jpg",
          weekday: dateParts.weekday,
          day: dateParts.day,
          month: dateParts.month,
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
  { id: "f-club", name: "Community Clubs", label: "Club", imageUrl: "/images/events/cat-community-clubs-v3.jpg" },
  { id: "f-exhibition", name: "Exhibition", label: "Exhibition", imageUrl: "/images/events/cat-exhibition-bust.jpg" },
  { id: "f-festive", name: "Festive", label: "Festive", imageUrl: "/images/events/cat-festive-diya.jpg" },
  { id: "f-wellness", name: "Health & Wellness", label: "Wellness", imageUrl: "/images/events/cat-wellness-yoga.jpg" },
  { id: "f-kids", name: "Kids", label: "Kids", imageUrl: "/images/events/cat-kids-train.jpg" },
  { id: "f-live", name: "Live Shows", label: "Live Shows", imageUrl: "/images/events/cat-live-shows-mic.jpg" },
  { id: "f-music", name: "Music & Parties", label: "Music", imageUrl: "/images/events/cat-music-disco.jpg" },
  { id: "f-workshops", name: "Workshops & Activities", label: "Workshops", imageUrl: "/images/events/cat-workshops-smiley.jpg" },
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

/* ------------------------------------------------------------------ *
 * Cities — city picker for the sign-up profile step
 * ------------------------------------------------------------------ */

export type City = {
  id: string;
  name: string;
  district?: string | null;
  state?: string | null;
  country?: string | null;
};

/** Only Ludhiana is live today — a single-entry list is a safe fallback. */
const FALLBACK_CITIES: City[] = [
  { id: CITY_ID, name: "Ludhiana", district: "Ludhiana", state: "Punjab", country: "India" },
];

function isCityRecord(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.name === "string";
}

/**
 * Fetches the list of cities the app supports, for the sign-up profile
 * step's city picker. GET /api/v1/city -> a plain array.
 */
export async function getCities(): Promise<City[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/city`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `[cities] API responded ${res.status} ${res.statusText} — using fallback cities`,
      );
      return FALLBACK_CITIES;
    }

    const json: unknown = await res.json();
    if (!Array.isArray(json)) {
      console.error("[cities] Expected an array — using fallback cities");
      return FALLBACK_CITIES;
    }

    const items = json.filter(isCityRecord);
    return items.length > 0 ? items : FALLBACK_CITIES;
  } catch (error) {
    console.error(
      "[cities] Fetch failed — using fallback cities:",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_CITIES;
  }
}

/* ------------------------------------------------------------------ *
 * Event detail — GET /api/v1/event/{id}
 * ------------------------------------------------------------------ */

export type EventBookingOption = {
  id: string;
  label: string;
  value: string;
};

/** One date row for the Date & time / schedule sheet. */
export type EventScheduleItem = {
  /** e.g. "Wed, 23 Sep 2026" */
  dateLabel: string;
  /** e.g. "8:00 pm onwards" */
  timeLabel: string;
  /** Combined line for lists */
  fullLabel: string;
};

export type EventDetail = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  gallery: string[];
  /** e.g. "Wed, 23 Sep 2026 - 8:00 pm onwards" */
  whenLabel: string;
  /** Primary venue line, e.g. "SCO No. 11" */
  venueLine: string;
  /** City / secondary venue line */
  city: string;
  /** Full address string for the venue sheet */
  venueAddress: string;
  venueFurtherInstructions: string;
  /** Event's city id when present; falls back to launch CITY_ID for save calls */
  cityId: string;
  bookingOptions: EventBookingOption[];
  /** All dates for the schedule bottom sheet */
  schedule: EventScheduleItem[];
  hasSchedule: boolean;
};

type ApiEventDetail = {
  id?: string;
  title?: string;
  description?: string | null;
  cityId?: string | null;
  venue?: {
    address?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    furtherInstructions?: string | null;
  } | null;
  dates?: {
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }[];
  startDate?: string | null;
  imageUrls?: {
    coverUrlS3Path?: string | null;
    eventImageOriginalUrlsS3Path?: string[] | null;
  } | null;
  bookingOptions?: {
    id?: string;
    label?: string | null;
    value?: string | null;
  }[] | null;
};

/** "20:00" -> "8:00 pm" (lowercase am/pm, matching the app detail screen) */
function formatTimeLower(hhmm: string | null | undefined): string {
  const raw = formatTime(hhmm);
  if (!raw) return "";
  return raw.replace(" AM", " am").replace(" PM", " pm");
}

/**
 * "2026-09-23T14:30:00Z" + "20:00" -> "Wed, 23 Sep 2026 - 8:00 pm onwards"
 *
 * Prefers the clock from `dates[0].startTime` (organiser-entered local time)
 * and the calendar day from `startDate` in Asia/Kolkata.
 */
function formatDetailWhen(
  startDate: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  const item = formatScheduleItem(startDate, startTime, endTime);
  return item?.fullLabel ?? "";
}

function formatDateLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}

function formatScheduleItem(
  startDate: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): EventScheduleItem | null {
  const dateLabel = formatDateLabel(startDate);
  const start = formatTimeLower(startTime);
  let timeLabel = "";
  if (start) {
    const end = formatTimeLower(endTime);
    timeLabel = end ? `${start} – ${end}` : `${start} onwards`;
  }
  if (!dateLabel && !timeLabel) return null;
  const fullLabel =
    dateLabel && timeLabel
      ? `${dateLabel} - ${timeLabel}`
      : dateLabel || timeLabel;
  return { dateLabel, timeLabel, fullLabel };
}

/**
 * Fetches a single event for the detail page.
 * Returns null on 404 / network failure so the page can show a not-found state.
 */
export async function getEventById(id: string): Promise<EventDetail | null> {
  if (!id) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/event/${encodeURIComponent(id)}`, {
      // Detail changes less often than the "today" rail, but still refresh often.
      next: { revalidate: 300 },
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      console.error(
        `[event:${id}] API responded ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const json = (await res.json()) as ApiEventDetail;
    if (typeof json?.id !== "string" || typeof json?.title !== "string") {
      console.error(`[event:${id}] Unexpected response shape`);
      return null;
    }

    const cover =
      json.imageUrls?.coverUrlS3Path || "/images/events/hero-wide.jpg";
    const galleryRaw = json.imageUrls?.eventImageOriginalUrlsS3Path ?? [];
    const gallery = [
      cover,
      ...galleryRaw.filter(
        (u): u is string => typeof u === "string" && u.length > 0 && u !== cover,
      ),
    ];

    const firstDate = json.dates?.[0];
    const bookingOptions = (json.bookingOptions ?? [])
      .filter(
        (o): o is { id: string; label: string; value: string } =>
          typeof o?.id === "string" &&
          typeof o?.label === "string" &&
          typeof o?.value === "string" &&
          o.value.trim().length > 0,
      )
      .map((o) => ({
        id: o.id,
        label: o.label.trim(),
        value: o.value.trim(),
      }));

    const schedule = (json.dates ?? [])
      .map((d) =>
        formatScheduleItem(
          // Prefer the date field; fall back to startDate for single-date events
          // that only populate the top-level instant.
          d.date ?? json.startDate,
          d.startTime,
          d.endTime,
        ),
      )
      .filter((d): d is EventScheduleItem => d !== null);

    // If dates[] was empty but startDate exists, still show one row.
    if (schedule.length === 0) {
      const lone = formatScheduleItem(
        json.startDate,
        firstDate?.startTime,
        firstDate?.endTime,
      );
      if (lone) schedule.push(lone);
    }

    const venueAddress = [
      json.venue?.address?.trim(),
      json.venue?.addressLine2?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    return {
      id: json.id,
      title: json.title.trim(),
      description: (json.description ?? "").trim(),
      coverImage: cover,
      gallery,
      whenLabel: formatDetailWhen(
        json.startDate ?? firstDate?.date,
        firstDate?.startTime,
        firstDate?.endTime,
      ),
      venueLine: shortVenue(json.venue?.address, json.venue?.city),
      city: json.venue?.city?.trim() || "",
      venueAddress,
      venueFurtherInstructions:
        json.venue?.furtherInstructions?.trim() || "",
      cityId: json.cityId?.trim() || CITY_ID,
      bookingOptions,
      schedule,
      hasSchedule: schedule.length > 1,
    };
  } catch (error) {
    console.error(
      `[event:${id}] Fetch failed:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Event search — Typesense-backed GET /api/v1/event/search
 * ------------------------------------------------------------------ */

export type EventSearchHit = {
  id: string;
  title: string;
  image: string;
  venue: string;
  city: string;
  date: string;
};

type ApiSearchEvent = {
  id?: string;
  title?: string;
  startDate?: string | null;
  dates?: { date?: string | null }[] | null;
  venue?: { address?: string | null; city?: string | null } | null;
  imageUrls?: {
    coverUrlS3Path?: string | null;
    coverUrlS3Full?: string | null;
  } | null;
};

type ApiSearchRow = {
  event?: ApiSearchEvent | null;
} & ApiSearchEvent;

function unwrapSearchRows(json: unknown): ApiSearchEvent[] {
  if (Array.isArray(json)) {
    return json
      .map((row) => {
        const r = row as ApiSearchRow;
        return r.event ?? r;
      })
      .filter((e): e is ApiSearchEvent => typeof e?.title === "string");
  }
  if (json && typeof json === "object") {
    const content = (json as { content?: unknown }).content;
    if (Array.isArray(content)) {
      return content
        .map((row) => {
          const r = row as ApiSearchRow;
          return r.event ?? r;
        })
        .filter((e): e is ApiSearchEvent => typeof e?.title === "string");
    }
  }
  return [];
}

/**
 * Typesense event search for Ludhiana (or override city).
 * Mirrors the app's EventTab: q + city_id + status=ACTIVE.
 */
export async function searchEvents(
  q: string,
  opts: { cityId?: string; page?: number; perPage?: number } = {},
): Promise<EventSearchHit[]> {
  const query = q.trim();
  if (query.length < 2) return [];

  const cityId = opts.cityId?.trim() || CITY_ID;
  const page = opts.page ?? 0;
  const perPage = opts.perPage ?? 50;

  const url = `${API_BASE_URL}/api/v1/event/search?q=${encodeURIComponent(
    query,
  )}&city_id=${encodeURIComponent(cityId)}&status=${encodeURIComponent(
    "ACTIVE",
  )}&page=${page}&per_page=${perPage}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(
        `[event-search] API responded ${res.status} ${res.statusText}`,
      );
      return [];
    }
    const json: unknown = await res.json();
    return unwrapSearchRows(json)
      .filter((e): e is ApiSearchEvent & { id: string; title: string } =>
        typeof e.id === "string" && typeof e.title === "string",
      )
      .map<EventSearchHit>((e) => ({
        id: e.id,
        title: e.title.trim(),
        image:
          e.imageUrls?.coverUrlS3Path ||
          e.imageUrls?.coverUrlS3Full ||
          "/images/events/hero-wide.jpg",
        venue: shortVenue(e.venue?.address, e.venue?.city),
        city: e.venue?.city?.trim() || "",
        date: formatEventDate(e.startDate ?? e.dates?.[0]?.date),
      }));
  } catch (error) {
    console.error(
      "[event-search] Fetch failed:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
