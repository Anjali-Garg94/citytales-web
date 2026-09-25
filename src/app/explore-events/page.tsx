import type { Metadata } from "next";
import ExploreEventsClient, {
  type ExploreSort,
  type ExploreWhen,
} from "@/components/explore/ExploreEventsClient";
import PageShell from "@/components/PageShell";
import {
  getEventCategories,
  getEventsByCategory,
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
 * `?category=<id>` — vibe / chip filter
 * `?sort=recent|soonest|latest` — ignored for today/tomorrow (always recently added)
 *
 * Browse all merges This week + Next week + Later with the chosen sort.
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
  const sort = sortLocked ? "recent" : parseSort(sortParam);
  const apiSort = toApiSort(sort);

  const categories = await getEventCategories();
  const selectedCategory = categoryParam
    ? categories.find((c) => c.id === categoryParam)
    : undefined;
  const categoryId = selectedCategory?.id;

  const section = WHEN_TO_SECTION[when] ?? WHEN_TO_SECTION.all!;

  // Vibe-only entry (Pick your Vibe) — no time chips emphasis, category heading.
  const vibeOnly = Boolean(categoryId && !whenParam && !from);

  const heading = vibeOnly
    ? selectedCategory!.name
    : when === "all"
      ? "Discover events"
      : section.heading;

  const events = await loadExploreEvents({
    when,
    vibeOnly,
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
          showWhenChips={!vibeOnly}
        />
      </section>
    </PageShell>
  );
}

async function loadExploreEvents({
  when,
  vibeOnly,
  categoryId,
  apiSort,
  section,
}: {
  when: ExploreWhen;
  vibeOnly: boolean;
  categoryId?: string;
  apiSort: SectionSort | undefined;
  section: { key: string; heading: string; part?: SectionWeekPart };
}) {
  if (categoryId && vibeOnly) {
    return getEventsByCategory(categoryId, 60, apiSort);
  }

  // Browse all — merge the three forward windows under one sort.
  if (when === "all") {
    const [thisWeek, nextWeek, later] = await Promise.all([
      getMonthSectionEvents("THIS_WEEK", 40, categoryId, apiSort),
      getMonthSectionEvents("NEXT_WEEK", 40, categoryId, apiSort),
      getMonthSectionEvents("AFTER_NEXT_WEEK", 40, categoryId, apiSort),
    ]);
    return mergeBrowseAll(thisWeek, nextWeek, later, apiSort);
  }

  return getMonthSectionEvents(
    section.key,
    60,
    categoryId,
    apiSort,
    section.part,
  );
}

function mergeBrowseAll(
  thisWeek: Awaited<ReturnType<typeof getMonthSectionEvents>>,
  nextWeek: Awaited<ReturnType<typeof getMonthSectionEvents>>,
  later: Awaited<ReturnType<typeof getMonthSectionEvents>>,
  apiSort: SectionSort | undefined,
) {
  const seen = new Set<string>();
  const merged = [...thisWeek, ...nextWeek, ...later].filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  if (apiSort === "latest") {
    return merged.sort((a, b) => b.date.localeCompare(a.date));
  }
  if (apiSort === "date") {
    return merged.sort((a, b) => a.date.localeCompare(b.date));
  }
  // recent — each section already came back newest-listed; keep section order
  // (this week → next week → later) which matches how Discover reads forward.
  return merged;
}
