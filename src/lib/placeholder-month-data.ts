/**
 * PLACEHOLDER DATA — NOT REAL EVENTS.
 *
 * Every entry below is invented for design/layout purposes. None of these are
 * confirmed listings and none should ever be presented to the public as real.
 * Replace this whole module with the CityTales API before the section ships.
 *
 * The shape deliberately mirrors what the backend already returns elsewhere
 * (`title`, `venue`, `category`, a start instant and a cover image), so
 * swapping it out is a mapping change in one place rather than a rewrite:
 *
 *   GET /api/v1/event/section?cityId=...&key=THIS_WEEK   -> thisWeek
 *   GET /api/v1/event/section?cityId=...&key=UPCOMING    -> nextUp + laterThisMonth
 *
 * Note: at time of writing the backend has no THIS_MONTH section key (it 400s),
 * so whoever wires this up will need that key added, or will need to derive the
 * month view from UPCOMING.
 */

export type MonthEvent = {
  id: string;
  /** Route target: /events/[slug] */
  slug: string;
  title: string;
  venue: string;
  /** Display label, matching the backend's EVENT category labels */
  category: string;
  /** Calendar date in Asia/Kolkata, ISO yyyy-mm-dd */
  date: string;
  /** Human start time, e.g. "8:00 PM" */
  startTime: string;
  /** Optional human end time, e.g. "11:00 PM" */
  endTime?: string;
  image: string;
};

/** The month this section is describing. Derived from the API once wired. */
export const MONTH_LABEL = "September";

/**
 * Headline switches to the confident "is looking busy" line only once the month
 * actually has enough listed to justify it — otherwise it reads as a promise
 * the page can't keep.
 */
export const BUSY_THRESHOLD = 6;

/* ---------------------------------------------------------------- *
 * Events
 * ---------------------------------------------------------------- */

/** This week's grid — six square cards, two per row. */
export const placeholderThisWeek: MonthEvent[] = [
  {
    id: "pl-0a",
    slug: "midweek-supper-club",
    title: "Midweek Supper Club",
    venue: "Sarabha Nagar",
    category: "Club",
    date: "2026-09-16",
    startTime: "8:00 PM",
    image: "/images/events/grid-c.jpg",
  },
  {
    id: "pl-0b",
    slug: "phulkari-craft-exhibit",
    title: "Phulkari Craft Exhibit",
    venue: "Punjab Kala Bhawan",
    category: "Exhibition",
    date: "2026-09-17",
    startTime: "11:00 AM",
    endTime: "7:00 PM",
    image: "/images/events/cat-exhibitions.jpg",
  },
  {
    id: "pl-1",
    slug: "live-band-night",
    title: "Live Band Night",
    venue: "The Yellow Turban",
    category: "Live Shows",
    date: "2026-09-18",
    startTime: "8:00 PM",
    endTime: "11:00 PM",
    image: "/images/events/grid-e.jpg",
  },
  {
    id: "pl-2",
    slug: "open-mic-night",
    title: "Open Mic Night",
    venue: "Bira 91 The Brewery",
    category: "Live Shows",
    date: "2026-09-19",
    startTime: "3:00 PM",
    endTime: "6:00 PM",
    image: "/images/events/port-mic.jpg",
  },
  {
    id: "pl-3",
    slug: "sunday-farmers-market",
    title: "Sunday Farmers' Market",
    venue: "Partap Bagh Grounds",
    category: "Festive",
    date: "2026-09-20",
    startTime: "9:00 AM",
    endTime: "1:00 PM",
    image: "/images/events/port-market.jpg",
  },
  {
    id: "pl-3b",
    slug: "canal-morning-ride",
    title: "Canal Morning Ride",
    venue: "Sidhwan Canal",
    category: "Wellness",
    date: "2026-09-20",
    startTime: "6:00 AM",
    image: "/images/events/port-cycle.jpg",
  },
];

/** Compact scanning list — the rest of the coming fortnight. */
export const placeholderNextUp: MonthEvent[] = [
  {
    id: "pl-4",
    slug: "yoga-in-the-park",
    title: "Yoga in the Park",
    venue: "Nehru Rose Garden",
    category: "Wellness",
    date: "2026-09-22",
    startTime: "7:00 AM",
    image: "/images/events/cat-activities.jpg",
  },
  {
    id: "pl-5",
    slug: "pottery-workshop",
    title: "Pottery Workshop",
    venue: "Sarabha Nagar Clay Studio",
    category: "Workshops",
    date: "2026-09-24",
    startTime: "4:00 PM",
    image: "/images/events/grid-d.jpg",
  },
  {
    id: "pl-6",
    slug: "heritage-walk-old-town",
    title: "Heritage Walk: Old Town",
    venue: "Chaura Bazaar",
    category: "Club",
    date: "2026-09-26",
    startTime: "6:30 AM",
    image: "/images/events/grid-h.jpg",
  },
  {
    // Same date as the walk above — exercises the date-anchor grouping.
    id: "pl-7",
    slug: "kids-fun-fest",
    title: "Kids Fun Fest",
    venue: "Pavilion Mall",
    category: "Kids",
    date: "2026-09-26",
    startTime: "11:00 AM",
    image: "/images/events/grid-b.jpg",
  },
  {
    id: "pl-8",
    slug: "sunday-run-club",
    title: "Sunday Run Club",
    venue: "PAU Campus",
    category: "Club",
    date: "2026-09-27",
    startTime: "6:30 AM",
    image: "/images/events/port-cycle.jpg",
  },
];

/** Tail of the month — same list format as Next week. */
export const placeholderLaterThisMonth: MonthEvent[] = [
  {
    id: "pl-8b",
    slug: "founders-coffee-morning",
    title: "Founders Coffee Morning",
    venue: "Model Town Cafe",
    category: "Club",
    date: "2026-09-28",
    startTime: "9:00 AM",
    image: "/images/events/grid-a.jpg",
  },
  {
    id: "pl-9",
    slug: "cooking-and-baking-workshop",
    title: "Cooking & Baking Workshop",
    venue: "Model Town Extension",
    category: "Workshops",
    date: "2026-09-29",
    startTime: "5:00 PM",
    image: "/images/events/grid-g.jpg",
  },
  {
    id: "pl-10",
    slug: "theatre-play-punjabi-nights",
    title: "Theatre Play: Punjabi Nights",
    venue: "Punjab Kala Bhawan",
    category: "Live Shows",
    date: "2026-09-30",
    startTime: "7:30 PM",
    image: "/images/events/feat-gallery.jpg",
  },
  {
    id: "pl-11",
    slug: "month-end-flea-market",
    title: "Month-End Flea Market",
    venue: "Rakh Bagh",
    category: "Festive",
    date: "2026-09-30",
    startTime: "4:00 PM",
    image: "/images/events/port-market.jpg",
  },
];

export const placeholderAllMonthEvents: MonthEvent[] = [
  ...placeholderThisWeek,
  ...placeholderNextUp,
  ...placeholderLaterThisMonth,
];

/* ---------------------------------------------------------------- *
 * Vibes
 * ---------------------------------------------------------------- */

export type Vibe = { emoji: string; label: string; categories: string[] };

/** Mood shortcuts — each maps onto one or more real category labels. */
export const vibes: Vibe[] = [
  { emoji: "🎉", label: "Party", categories: ["Music", "Festive"] },
  { emoji: "🎨", label: "Create", categories: ["Workshops", "Exhibition"] },
  { emoji: "🎵", label: "Music", categories: ["Music", "Live Shows"] },
  { emoji: "🧘", label: "Reset", categories: ["Wellness"] },
  { emoji: "👨‍👩‍👧", label: "Kids", categories: ["Kids"] },
  { emoji: "🤝", label: "Meet People", categories: ["Club"] },
];

/* ---------------------------------------------------------------- *
 * Date helpers
 * ---------------------------------------------------------------- */

/** "2026-09-18" -> "18" */
export function dayNumber(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)));
}

/** "2026-09-18" -> "FRI" (weekday in Asia/Kolkata) */
export function weekdayShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  })
    .format(d)
    .toUpperCase();
}

/** "2026-09-02" -> "2nd" (ordinal day number) */
export function dayOrdinal(isoDate: string): string {
  const day = Number(isoDate.slice(8, 10));
  if (Number.isNaN(day)) return "";
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix}`;
}

/** "2026-09-02" -> "Sept", "2026-10-02" -> "Oct" (short month, Asia/Kolkata) */
export function monthShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

/** Today's calendar date in Asia/Kolkata as yyyy-mm-dd. */
export function todayISO(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Date header parts: "Tomorrow / Mon", "22 Sep / Tue".
 * Month and weekday are always 3-letter abbreviations.
 */
export function dateHeaderParts(isoDate: string): {
  primary: string;
  secondary: string;
} {
  const today = todayISO();
  const tomorrowDate = new Date(`${today}T12:00:00+05:30`);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).formatToParts(tomorrowDate);
  const get = (t: string) =>
    tomorrowParts.find((p) => p.type === t)?.value ?? "";
  const tomorrow = `${get("year")}-${get("month")}-${get("day")}`;

  const d = new Date(`${isoDate}T12:00:00+05:30`);
  const parts = Number.isNaN(d.getTime())
    ? []
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        weekday: "short",
        timeZone: "Asia/Kolkata",
      }).formatToParts(d);
  const part = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = part("weekday").slice(0, 3);
  const month = part("month").slice(0, 3);
  const day = part("day");

  if (isoDate === today) return { primary: "Today", secondary: weekday };
  if (isoDate === tomorrow) return { primary: "Tomorrow", secondary: weekday };
  return { primary: `${day} ${month}`, secondary: weekday };
}

/** Groups events by date, preserving order, for the date-anchored list. */
export function groupByDate(events: MonthEvent[]): [string, MonthEvent[]][] {
  const groups = new Map<string, MonthEvent[]>();
  for (const e of events) {
    const bucket = groups.get(e.date);
    if (bucket) bucket.push(e);
    else groups.set(e.date, [e]);
  }
  return [...groups.entries()];
}

/** Category chips, derived from the data so no chip leads to an empty result. */
export function categoriesIn(events: MonthEvent[]): string[] {
  return [...new Set(events.map((e) => e.category))];
}

/* ---------------------------------------------------------------- *
 * Live music & parties this weekend — ALSO PLACEHOLDER
 *
 * Maps to GET /api/v1/event/section?key=THIS_WEEKEND once that section can
 * be filtered by category. Today the endpoint takes no category parameter,
 * so the Music / Live Shows split below has to be done client-side or added
 * to the backend.
 * ---------------------------------------------------------------- */

export type WeekendEvent = {
  id: string;
  slug: string;
  title: string;
  /** Pre-formatted for display, e.g. "Sat, 19 Sep 2026" */
  dateLabel: string;
  /** e.g. "8:00 PM – Late" */
  timeLabel: string;
  venue: string;
  category: string;
  image: string;
};

/**
 * All weekend music & party events, shown as equals in a centre-highlight
 * carousel. There is no "featured" flag on the backend today, so nothing here
 * is promoted above the rest — add one to the API first if you want that.
 */
export const placeholderWeekendEvents: WeekendEvent[] = [
  {
    id: "pl-w0",
    slug: "saturday-night-vibes",
    title: "Saturday Night Vibes",
    dateLabel: "Sat, 19 Sep",
    timeLabel: "8:00 PM – Late",
    venue: "Bira 91, Paragon Mall",
    category: "Music",
    image: "/images/hero/hero-party-real.jpg",
  },
  {
    id: "pl-w1",
    slug: "bhangra-and-bollywood-night",
    title: "Bhangra & Bollywood Night",
    dateLabel: "Sat, 19 Sep",
    timeLabel: "9:00 PM – 1:00 AM",
    venue: "Ground Zero, Model Town",
    category: "Music",
    image: "/images/events/grid-e.jpg",
  },
  {
    id: "pl-w2",
    slug: "open-mic-night-weekend",
    title: "Open Mic Night",
    dateLabel: "Sun, 20 Sep",
    timeLabel: "3:00 PM – 6:00 PM",
    venue: "Bira 91 The Brewery",
    category: "Live Shows",
    image: "/images/events/port-mic.jpg",
  },
  {
    id: "pl-w3",
    slug: "rooftop-acoustic-sessions",
    title: "Rooftop Acoustic Sessions",
    dateLabel: "Sun, 20 Sep",
    timeLabel: "7:00 PM – 10:00 PM",
    venue: "Ferozepur Rd Rooftop",
    category: "Live Shows",
    image: "/images/events/feat-dusk.jpg",
  },
];
