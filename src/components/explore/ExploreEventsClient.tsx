"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MonthEvent } from "@/lib/placeholder-month-data";
import {
  dateHeaderParts,
  groupByDate,
} from "@/lib/placeholder-month-data";
import CategoryPill from "@/components/CategoryPill";
import {
  ClockIcon,
  PinIcon,
  SearchIcon,
} from "@/components/Icons";

export type ExploreCategory = {
  id: string;
  name: string;
  label: string;
  image: string;
};

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
 * + date-grouped list. Category changes navigate via `?category=`.
 */
export default function ExploreEventsClient({
  categories,
  events,
  heading = "Discover events",
  initialCategoryId = "all",
  from,
}: {
  categories: ExploreCategory[];
  events: MonthEvent[];
  heading?: string;
  initialCategoryId?: string | "all";
  from?: string;
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

  const splitAt = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, splitAt);
  const row2 = categories.slice(splitAt);

  function selectCategory(id: string | "all") {
    if (id === activeCategoryId) return;
    setPendingId(id);

    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (id !== "all") params.set("category", id);
    const qs = params.toString();
    router.push(qs ? `/explore-events?${qs}` : "/explore-events");
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-16 lg:px-8">
      <h1 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-ink lg:text-[26px]">
        {heading}
      </h1>

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

      <div className="mt-8">
        {groups.length === 0 ? (
          <div className="px-1 py-14 text-center">
            <div className="flex justify-center text-ink-soft">
              <SearchIcon className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">
              No events found
            </p>
            <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] text-ink-soft">
              Try another category.
            </p>
          </div>
        ) : (
          groups.map(([date, dayEvents]) => (
            <section key={date} className="mb-7">
              <h2 className="mb-4 text-[14px] font-medium text-[#8A8A8A]">
                {dateGroupLabel(date)}
              </h2>

              <ul className="flex flex-col gap-5">
                {dayEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="flex gap-3.5 no-underline"
                    >
                      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[12px] bg-[#F4F3F1]">
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          sizes="84px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="truncate text-[11px] font-semibold tracking-[0.06em] text-[#9A9A9A] uppercase">
                          {event.category}
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-[15px] leading-[1.3] font-semibold text-ink">
                          {event.title}
                        </div>
                        {event.startTime ? (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#8A8A8A]">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{event.startTime}</span>
                          </div>
                        ) : null}
                        {event.venue ? (
                          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#8A8A8A]">
                            <PinIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
