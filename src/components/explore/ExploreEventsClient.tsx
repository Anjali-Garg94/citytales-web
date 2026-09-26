"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
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

/** Time windows when arriving from Start exploring / Browse all. */
export type ExploreWhen =
  | "today"
  | "tomorrow"
  | "weekend"
  | "this-week"
  | "next-week"
  | "later"
  | "all";

/**
 * Sort modes (UI). Better wordings:
 * - Recently added — newest listings first
 * - Soonest first — upcoming dates, nearest first
 * - Latest dates — farthest / newest calendar dates first
 */
export type ExploreSort = "recent" | "soonest" | "latest";

const WHEN_OPTIONS: { id: ExploreWhen; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "weekend", label: "Weekend" },
  { id: "this-week", label: "This week" },
  { id: "next-week", label: "Next week" },
  { id: "later", label: "Later" },
  { id: "all", label: "Browse all" },
];

const SORT_OPTIONS: { id: ExploreSort; label: string }[] = [
  { id: "recent", label: "Recently added" },
  { id: "soonest", label: "Soonest first" },
  { id: "latest", label: "Latest dates" },
];

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

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

function SortByDropdown({
  sort,
  onSortChange,
}: {
  sort: ExploreSort;
  onSortChange: (next: ExploreSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current =
    SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Recently added";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-20">
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label="Sort events"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F7F7F8] py-1.5 pr-2.5 pl-3 text-[12.5px] font-semibold text-ink outline-none transition hover:bg-[#EFEFEF] focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          {current}
          <svg
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 text-ink-soft transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Sort events"
            className="absolute top-full right-0 z-30 mt-1.5 min-w-full overflow-hidden rounded-2xl border border-black/8 bg-white py-1 shadow-[0_12px_32px_-8px_rgba(30,26,22,0.28)]"
          >
            {SORT_OPTIONS.map((opt) => {
              const selected = opt.id === sort;
              return (
                <li key={opt.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange(opt.id);
                      setOpen(false);
                    }}
                    className={`flex w-full whitespace-nowrap px-3.5 py-2.5 text-left text-[13px] font-semibold transition hover:bg-[#F7F7F8] ${
                      selected ? "text-accent" : "text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ExploreListLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center px-1 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-[2.5px] border-accent/25 border-t-accent"
        aria-hidden
      />
      <p className="mt-4 text-[13px] font-medium text-ink-soft">
        Loading events…
      </p>
    </div>
  );
}

/**
 * Discover Events — time windows + categories + sort (UI).
 * When / sort navigate via query params; list wiring can follow.
 */
export default function ExploreEventsClient({
  categories,
  events,
  heading = "Discover events",
  initialCategoryId = "all",
  when: whenProp = "all",
  sort: sortProp = "recent",
  /** Show time-window chips (Start exploring / browse). Hide for vibe-only. */
  showWhenChips = true,
  /** From Start exploring only — scroll when-strip to show Today first. */
  pinWhenStripStart = false,
}: {
  categories: ExploreCategory[];
  events: MonthEvent[];
  heading?: string;
  initialCategoryId?: string | "all";
  when?: ExploreWhen;
  sort?: ExploreSort;
  showWhenChips?: boolean;
  pinWhenStripStart?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const whenStripRef = useRef<HTMLDivElement>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [pendingWhen, setPendingWhen] = useState<ExploreWhen | null>(null);
  const [pendingSort, setPendingSort] = useState<ExploreSort | null>(null);

  const activeCategoryId = pendingCategory ?? initialCategoryId;
  const when = pendingWhen ?? whenProp;
  const sort = pendingSort ?? sortProp;

  // Only show the loader while server props still disagree with what we asked for.
  // Clearing pending on any prop change (old behavior) + rapid taps could leave
  // pending set while whenProp never "changed" again → infinite "Loading events…".
  const isLoading =
    (pendingWhen !== null && pendingWhen !== whenProp) ||
    (pendingCategory !== null && pendingCategory !== initialCategoryId) ||
    (pendingSort !== null && pendingSort !== sortProp);

  // Drop pending once the matching server props arrive (including round-trips
  // that end on the same value we started from after a cancelled intermediate tap).
  useEffect(() => {
    if (pendingWhen !== null && pendingWhen === whenProp) {
      setPendingWhen(null);
    }
  }, [whenProp, pendingWhen]);

  useEffect(() => {
    if (pendingCategory !== null && pendingCategory === initialCategoryId) {
      setPendingCategory(null);
    }
  }, [initialCategoryId, pendingCategory]);

  useEffect(() => {
    if (pendingSort !== null && pendingSort === sortProp) {
      setPendingSort(null);
    }
  }, [sortProp, pendingSort]);

  // Safety net — never leave the list stuck spinning if a navigation is dropped.
  useEffect(() => {
    if (!isLoading) return;
    const t = window.setTimeout(() => {
      setPendingWhen(null);
      setPendingCategory(null);
      setPendingSort(null);
    }, 12000);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  useEffect(() => {
    const strip = categoryStripRef.current;
    if (!strip || activeCategoryId === "all") return;
    const chip = strip.querySelector<HTMLElement>(
      `[data-category-id="${CSS.escape(activeCategoryId)}"]`,
    );
    if (!chip) return;
    requestAnimationFrame(() => {
      chip.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }, [activeCategoryId, categories]);

  useEffect(() => {
    const strip = whenStripRef.current;
    if (!strip || !showWhenChips) return;

    // Browse all: never center the Browse all chip.
    // Only Start exploring (pinWhenStripStart) resets scroll to Today.
    if (when === "all") {
      if (pinWhenStripStart) strip.scrollLeft = 0;
      return;
    }

    const chip = strip.querySelector<HTMLElement>(
      `[data-when-id="${CSS.escape(when)}"]`,
    );
    if (!chip) return;
    requestAnimationFrame(() => {
      chip.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }, [when, showWhenChips, pinWhenStripStart]);

  const sortLocked = when === "today" || when === "tomorrow";

  /** Same date sections as Soonest first — calendar order (or reverse for Latest). */
  const groups = useMemo(() => {
    const entries = groupByDate(events);
    const descending = sort === "latest";
    return [...entries].sort(([a], [b]) =>
      descending ? b.localeCompare(a) : a.localeCompare(b),
    );
  }, [events, sort]);

  const splitAt = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, splitAt);
  const row2 = categories.slice(splitAt);

  function buildHref(next: {
    category?: string | "all";
    when?: ExploreWhen;
    sort?: ExploreSort;
  }) {
    const params = new URLSearchParams();

    // Always keep `when` in the URL (including `all`) so a category change
    // never drops the time window / hides the Today–Browse all row.
    const nextWhen = next.when !== undefined ? next.when : when;
    params.set("when", nextWhen);

    const category =
      next.category !== undefined ? next.category : activeCategoryId;
    if (category && category !== "all") params.set("category", category);

    const sortLocked = nextWhen === "today" || nextWhen === "tomorrow";
    const nextSort = sortLocked
      ? undefined
      : next.sort !== undefined
        ? next.sort
        : sort;
    if (nextSort && nextSort !== "recent") params.set("sort", nextSort);

    return `/explore-events?${params.toString()}`;
  }

  function selectWhen(id: ExploreWhen) {
    if (id === when) return;
    setPendingWhen(id);
    // Today / Tomorrow: backend owns start-time order — drop sort from the URL.
    if (id === "today" || id === "tomorrow") {
      setPendingSort("soonest");
      startTransition(() => {
        router.push(buildHref({ when: id }));
      });
      return;
    }
    startTransition(() => {
      router.push(buildHref({ when: id }));
    });
  }

  function selectCategory(id: string | "all") {
    if (id === activeCategoryId) return;
    setPendingCategory(id);
    startTransition(() => {
      router.push(buildHref({ category: id }));
    });
  }

  function selectSort(next: ExploreSort) {
    if (next === sort) return;
    setPendingSort(next);
    startTransition(() => {
      router.push(buildHref({ sort: next }));
    });
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
      {/* When chips stay visible with categories; header shows City Tales. */}
      <h1 className="sr-only">{heading}</h1>

      {/* Time windows — always shown so category + when can combine */}
      {showWhenChips ? (
        <div
          ref={whenStripRef}
          className="no-scrollbar -mx-5 overflow-x-auto px-5 lg:-mx-8 lg:px-8"
        >
          <div className="flex w-max gap-2 py-1">
            {WHEN_OPTIONS.map((opt) => {
              const active = when === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-when-id={opt.id}
                  aria-pressed={active}
                  onClick={() => selectWhen(opt.id)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition ${
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
        </div>
      ) : null}

      {/* Categories */}
      <div
        ref={categoryStripRef}
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
                <span className="whitespace-nowrap">
                  {toTitleCase(cat.name)}
                </span>
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
                <span className="whitespace-nowrap">
                  {toTitleCase(cat.name)}
                </span>
              </CategoryPill>
            ))}
          </div>
        </div>
      </div>

      {sortLocked ? null : (
        <div className="mt-4 flex justify-end">
          <SortByDropdown sort={sort} onSortChange={selectSort} />
        </div>
      )}

      <div className="mt-8" aria-busy={isLoading}>
        {isLoading ? (
          <ExploreListLoader />
        ) : events.length === 0 ? (
          <div className="px-1 py-14 text-center">
            <div className="flex justify-center text-ink-soft">
              <SearchIcon className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">
              No events found
            </p>
            <p className="mx-auto mt-1.5 max-w-[280px] text-meta">
              Try another time or category.
            </p>
          </div>
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
