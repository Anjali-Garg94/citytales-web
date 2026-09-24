"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SectionSort } from "@/lib/api";
import type { MonthEvent } from "@/lib/placeholder-month-data";
import {
  dateHeaderParts,
  groupByDate,
} from "@/lib/placeholder-month-data";
import CategoryPill from "@/components/CategoryPill";
import EventListRow from "@/components/event/EventListRow";
import { SearchIcon } from "@/components/Icons";

export type ExploreCategory = {
  id: string;
  name: string;
  label: string;
  image: string;
};

const SORT_OPTIONS: { id: SectionSort; label: string }[] = [
  { id: "recent", label: "Recently added" },
  { id: "date", label: "By date" },
];

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

/** "Today / Wednesday" — Luma-style date group header. */
function dateGroupLabel(isoDate: string): string {
  const { primary } = dateHeaderParts(isoDate);
  const d = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return primary;
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(d);
  return `${primary} / ${weekday}`;
}

/**
 * Explore Events — pill category chips (gradient oval ring when selected)
 * + date-grouped list (or flat when sorted by recently added).
 * Category / sort changes navigate via query params.
 */
export default function ExploreEventsClient({
  categories,
  events,
  heading = "Discover events",
  initialCategoryId = "all",
  from,
  sort,
}: {
  categories: ExploreCategory[];
  events: MonthEvent[];
  heading?: string;
  initialCategoryId?: string | "all";
  from?: string;
  sort?: SectionSort;
}) {
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const activeCategoryId = pendingId ?? initialCategoryId;

  useEffect(() => {
    setPendingId(null);
  }, [initialCategoryId]);

  // Keep the selected chip in view (e.g. arrived from home with a right-side category).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || activeCategoryId === "all") return;

    const chip = strip.querySelector<HTMLElement>(
      `[data-category-id="${CSS.escape(activeCategoryId)}"]`,
    );
    if (!chip) return;

    // Defer until layout is ready after navigation.
    requestAnimationFrame(() => {
      chip.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }, [activeCategoryId, categories]);

  const groups = useMemo(() => groupByDate(events), [events]);
  const showFlat = sort === "recent";

  const splitAt = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, splitAt);
  const row2 = categories.slice(splitAt);

  function buildHref(next: {
    category?: string | "all";
    sort?: SectionSort | null;
  }) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);

    const category =
      next.category !== undefined ? next.category : activeCategoryId;
    if (category && category !== "all") params.set("category", category);

    const nextSort = next.sort !== undefined ? next.sort : sort;
    if (nextSort) params.set("sort", nextSort);

    const qs = params.toString();
    return qs ? `/explore-events?${qs}` : "/explore-events";
  }

  function selectCategory(id: string | "all") {
    if (id === activeCategoryId) return;
    setPendingId(id);
    router.push(buildHref({ category: id }));
  }

  function selectSort(next: SectionSort) {
    if (next === sort) return;
    router.push(buildHref({ sort: next }));
  }

  function renderRow(event: MonthEvent) {
    return (
      <EventListRow
        href={`/events/${event.slug}`}
        image={event.image}
        title={event.title}
        category={event.category}
        categoryVariant="eyebrow"
        time={event.startTime || undefined}
        venue={event.venue || undefined}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-16 lg:px-8">
      <h1 className="text-page">{heading}</h1>

      <div
        ref={stripRef}
        className="no-scrollbar mt-3 -mx-5 overflow-x-auto px-5 lg:-mx-8 lg:px-8"
      >
        <div className="flex w-max flex-col gap-2.5 py-1">
          <div className="flex gap-2">
            <CategoryPill
              categoryId="all"
              selected={activeCategoryId === "all"}
              onClick={() => selectCategory("all")}
              compact
            >
              All
            </CategoryPill>
            {row1.map((cat) => (
              <CategoryPill
                key={cat.id}
                categoryId={cat.id}
                selected={activeCategoryId === cat.id}
                onClick={() => selectCategory(cat.id)}
              >
                <span className="whitespace-nowrap">{toTitleCase(cat.name)}</span>
              </CategoryPill>
            ))}
          </div>
          <div className="flex gap-2">
            {row2.map((cat) => (
              <CategoryPill
                key={cat.id}
                categoryId={cat.id}
                selected={activeCategoryId === cat.id}
                onClick={() => selectCategory(cat.id)}
              >
                <span className="whitespace-nowrap">{toTitleCase(cat.name)}</span>
              </CategoryPill>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectSort(opt.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? "bg-ink text-white"
                  : "bg-[#F1EFEC] text-ink-soft hover:bg-[#E6E2DB] hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {events.length === 0 ? (
          <div className="px-1 py-14 text-center">
            <div className="flex justify-center text-ink-soft">
              <SearchIcon className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">
              No events found
            </p>
            <p className="mx-auto mt-1.5 max-w-[280px] text-meta">
              Try another category.
            </p>
          </div>
        ) : showFlat ? (
          <ul className="flex flex-col gap-5">
            {events.map((event) => (
              <li key={event.id}>{renderRow(event)}</li>
            ))}
          </ul>
        ) : (
          groups.map(([date, dayEvents]) => (
            <section key={date} className="mb-7">
              <h2 className="mb-4 text-section">{dateGroupLabel(date)}</h2>

              <ul className="flex flex-col gap-5">
                {dayEvents.map((event) => (
                  <li key={event.id}>{renderRow(event)}</li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
