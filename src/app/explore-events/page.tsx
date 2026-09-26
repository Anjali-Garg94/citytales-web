import type { Metadata } from "next";
import ExploreEventsClient, {
  type ExploreSort,
  type ExploreWhen,
} from "@/components/explore/ExploreEventsClient";
import PageShell from "@/components/PageShell";
import {
  getBrowseAllEvents,
  getEventCategories,
  getMonthSectionEvents,
  type SectionSort,
  type SectionWeekPart,
} from "@/lib/api";
import { categoryCoverImage } from "@/lib/category-images";

export const metadata: Metadata = {
  title: "Discover events | CityTales",
  description: "Browse events in Ludhiana by category and week.",
};

const WHEN_TO_SECTION: Partial<
  Record<
    ExploreWhen,
    { key: string; heading: string; part?: SectionWeekPart }
  >
> = {
  today: { key: "THIS_WEEK", heading: "Today", part: "today" },
  tomorrow: { key: "THIS_WEEK", heading: "Tomorrow", part: "tomorrow" },
  weekend: { key: "THIS_WEEK", heading: "Weekend", part: "weekend" },
  "this-week": { key: "THIS_WEEK", heading: "This week" },
  "next-week": { key: "NEXT_WEEK", heading: "Next week" },
  later: { key: "AFTER_NEXT_WEEK", heading: "Later" },
  all: { key: "THIS_WEEK", heading: "Discover events" },
};

const LEGACY_FROM: Record<string, ExploreWhen> = {
  "this-week": "this-week",
  "next-week": "next-week",
  later: "later",
};

function parseWhen(when?: string, from?: string): ExploreWhen {
  if (
    when === "today" ||
    when === "tomorrow" ||
    when === "weekend" ||
    when === "this-week" ||
    when === "next-week" ||
    when === "later" ||
    when === "all"
  ) {
    return when;
  }
  if (from && from in LEGACY_FROM) return LEGACY_FROM[from];
  return "all";
}

function parseSort(value?: string): ExploreSort {
  if (value === "soonest" || value === "latest" || value === "recent") {
    return value;
  }
  // Legacy home links: sort=date → soonest
  if (value === "date") return "soonest";
  return "recent";
}

/** Map UI sort → section API sort. */
function toApiSort(sort: ExploreSort): SectionSort | undefined {
  if (sort === "recent") return "recent";
  if (sort === "soonest") return "date";
  if (sort === "latest") return "latest";
  return undefined;
}

/**
 * Discover events — time windows + categories + sort.
 *
 * `?when=today|tomorrow|weekend|this-week|next-week|later|all`
 * `?from=` still accepted (maps to when)
 * `?category=<id>` — vibe / chip filter (combined with when)
 * `?sort=recent|soonest|latest` — ignored for today/tomorrow (backend sorts by start time)
 *
 * Browse all uses POST /api/v1/event/filter/v2 (not section GETs).
 */
export default async function ExploreEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    when?: string;
    from?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  const {
    when: whenParam,
    from,
    category: categoryParam,
    sort: sortParam,
  } = await searchParams;

  const when = parseWhen(whenParam, from);
  const sortLocked = when === "today" || when === "tomorrow";
  // Display-only for locked windows; API sort is owned by the backend for today/tomorrow.
  const sort = sortLocked ? "soonest" : parseSort(sortParam);
  const apiSort = sortLocked ? undefined : toApiSort(sort);

  const categories = await getEventCategories();
  const selectedCategory = categoryParam
    ? categories.find((c) => c.id === categoryParam)
    : undefined;
  const categoryId = selectedCategory?.id;

  const section = WHEN_TO_SECTION[when] ?? WHEN_TO_SECTION.all!;

  const heading =
    when === "all" ? "Discover events" : section.heading;

  // Only Start exploring (from=home) pins the when-strip to the left.
  // Manually tapping Browse all leaves the strip scroll position alone.
  const pinWhenStripStart = when === "all" && from === "home";

  const events = await loadExploreEvents({
    when,
    categoryId,
    apiSort,
    section,
  });

  const tiles = categories.map((c) => ({
    id: c.id,
    name: c.name,
    label: c.label,
    image: categoryCoverImage(c.name, c.imageUrl),
  }));

  return (
    <PageShell>
      <section className="-mt-2 pt-0 pb-6 lg:-mt-3 lg:pb-8">
        <ExploreEventsClient
          categories={tiles}
          events={events}
          heading={heading}
          initialCategoryId={categoryId ?? "all"}
          when={when}
          sort={sort}
          showWhenChips
          pinWhenStripStart={pinWhenStripStart}
        />
      </section>
    </PageShell>
  );
}

async function loadExploreEvents({
  when,
  categoryId,
  apiSort,
  section,
}: {
  when: ExploreWhen;
  categoryId?: string;
  apiSort: SectionSort | undefined;
  section: { key: string; heading: string; part?: SectionWeekPart };
}) {
  if (when === "all") {
    return getBrowseAllEvents(60, categoryId, apiSort);
  }

  return getMonthSectionEvents(
    section.key,
    60,
    categoryId,
    apiSort,
    section.part,
  );
}
