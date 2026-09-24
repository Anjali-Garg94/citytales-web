"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SectionSort } from "@/lib/api";
import { BUSY_THRESHOLD, type MonthEvent } from "@/lib/placeholder-month-data";
import CategoryPill from "@/components/CategoryPill";
import { ArrowRightIcon } from "../Icons";
import RevealGroup from "../motion/RevealGroup";
import RevealItem from "../motion/RevealItem";
import { fadeUp, viewport } from "../motion/variants";
import MonthEventCard from "./MonthEventCard";
import MonthEventList from "./MonthEventList";

const ALL = "All";

type WeekPart = "all" | "weekday" | "weekend";

/** Rows shown per list before "See everything" takes over. */
const LIST_LIMIT = 4;

/** This week grid: fixed at 2 columns, capped at 3 rows (6 cards). */
const THIS_WEEK_GRID_LIMIT = 6;

/** Sat / Sun in Asia/Kolkata. */
function isWeekendDate(isoDate: string): boolean {
  const d = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

type SectionBundle = {
  thisWeek: MonthEvent[];
  nextUp: MonthEvent[];
  later: MonthEvent[];
};

const SORT_OPTIONS: { value: SectionSort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "date", label: "By date" },
];

function SortByDropdown({
  sort,
  onSortChange,
  label,
}: {
  sort: SectionSort;
  onSortChange: (next: SectionSort) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Recently added";

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
    <div ref={rootRef} className="relative z-20 flex items-center gap-1.5">
      <span className="text-[12px] font-medium whitespace-nowrap text-ink-soft">
        Sort by
      </span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`Sort ${label}`}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 py-1.5 pr-2.5 pl-3 text-[12.5px] font-semibold text-ink outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-accent/30"
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
            aria-label={`Sort ${label}`}
            className="absolute top-full right-0 z-30 mt-1.5 min-w-full overflow-hidden rounded-2xl border border-black/8 bg-white py-1 shadow-[0_12px_32px_-8px_rgba(30,26,22,0.28)]"
          >
            {SORT_OPTIONS.map((opt) => {
              const selected = opt.value === sort;
              return (
                <li key={opt.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
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

function SectionHeader({
  label,
  sort,
  onSortChange,
}: {
  label: string;
  sort: SectionSort;
  onSortChange: (next: SectionSort) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <RevealGroup stagger={0.08}>
        <RevealItem>
          <h3 className="font-serif text-[18px] leading-[1.2] font-semibold tracking-[-0.02em] text-ink lg:text-[20px] lg:leading-[1.15]">
            {label}
          </h3>
        </RevealItem>
      </RevealGroup>

      <SortByDropdown
        label={label}
        sort={sort}
        onSortChange={onSortChange}
      />
    </div>
  );
}

function SeeAllLink({
  href,
  children,
  variant = "text",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "text" | "glass";
}) {
  const glass = "glass-surface glass-pill mt-5";

  const text =
    "mt-4 flex items-center justify-center gap-1.5 text-[14px] font-semibold tracking-[0.02em] text-accent no-underline hover:text-accent-deep";

  return (
    <RevealItem inGroup={false} className="flex justify-center">
      <Link href={href} className={variant === "glass" ? glass : text}>
        {children}
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </RevealItem>
  );
}

type Props = {
  bySort: Record<SectionSort, SectionBundle>;
  categories: string[];
};

export default function ThisMonthSectionClient({ bySort, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [sort, setSort] = useState<SectionSort>("recent");
  const [weekPart, setWeekPart] = useState<WeekPart>("all");

  const bundle = bySort[sort];
  const { thisWeek: allThisWeek, nextUp: allNextUp, later: allLater } = bundle;

  const allEvents = useMemo(
    () => [...allThisWeek, ...allNextUp, ...allLater],
    [allThisWeek, allNextUp, allLater],
  );

  const splitAt = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, splitAt);
  const row2 = categories.slice(splitAt);

  const filter = (events: MonthEvent[]) =>
    activeCategory === ALL
      ? events
      : events.filter(
          (e) =>
            e.category.trim().toLowerCase() ===
            activeCategory.trim().toLowerCase(),
        );

  const thisWeekAll = filter(allThisWeek);
  const thisWeek = thisWeekAll.filter((e) => {
    if (weekPart === "all") return true;
    const weekend = isWeekendDate(e.date);
    return weekPart === "weekend" ? weekend : !weekend;
  });
  const nextUp = filter(allNextUp);
  const later = filter(allLater);
  const nothingMatches =
    thisWeekAll.length === 0 && nextUp.length === 0 && later.length === 0;

  const isBusy = allEvents.length >= BUSY_THRESHOLD;

  function seeAllHref(from: string) {
    return `/explore-events?from=${from}&sort=${sort}`;
  }

  return (
    <section
      id="whats-on"
      className="scroll-mt-4 pt-2 pb-10 lg:mx-auto lg:max-w-[1280px] lg:pt-4 lg:pb-16"
    >
      <div className="px-5 lg:px-20">
        <RevealItem inGroup={false}>
          <h2 className="font-serif text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink lg:text-[26px] lg:leading-[1.1]">
            Ludhiana {isBusy ? "is looking busy." : "is taking shape."}
          </h2>
        </RevealItem>
      </div>

      {categories.length > 0 && (
        <motion.div
          className="no-scrollbar mt-3 -mx-0 overflow-x-auto px-5 pb-1 lg:mt-3.5 lg:px-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp(0.1, 14)}
        >
          <div className="flex w-max flex-col gap-2.5 py-1">
            <div className="flex gap-2">
              <CategoryPill
                categoryId={ALL}
                selected={activeCategory === ALL}
                onClick={() => setActiveCategory(ALL)}
                compact
              >
                All
              </CategoryPill>
              {row1.map((chip) => (
                <CategoryPill
                  key={chip}
                  categoryId={chip}
                  selected={chip === activeCategory}
                  onClick={() => setActiveCategory(chip)}
                >
                  <span className="whitespace-nowrap">{chip}</span>
                </CategoryPill>
              ))}
            </div>
            {row2.length > 0 ? (
              <div className="flex gap-2">
                {row2.map((chip) => (
                  <CategoryPill
                    key={chip}
                    categoryId={chip}
                    selected={chip === activeCategory}
                    onClick={() => setActiveCategory(chip)}
                  >
                    <span className="whitespace-nowrap">{chip}</span>
                  </CategoryPill>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {allEvents.length === 0 ? (
        <div className="mx-5 mt-8 rounded-[18px] border border-line px-5 py-12 text-center lg:mx-20">
          <div className="font-serif text-lg font-semibold">
            Nothing listed yet
          </div>
          <div className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-ink-soft lg:text-sm">
            New events go up regularly — check back soon.
          </div>
        </div>
      ) : nothingMatches ? (
        <div className="mx-5 mt-8 rounded-[18px] border border-line px-5 py-12 text-center lg:mx-20">
          <div className="font-serif text-lg font-semibold">
            Nothing in {activeCategory} this month
          </div>
          <button
            type="button"
            onClick={() => setActiveCategory(ALL)}
            className="mt-3 text-[13px] font-semibold text-accent hover:text-accent-deep"
          >
            Show everything
          </button>
        </div>
      ) : (
        <>
          {thisWeekAll.length > 0 ? (
            <div
              id="home-this-week"
              className="this-week-panel mt-5 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-7 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader
                label="This week"
                sort={sort}
                onSortChange={setSort}
              />

              <div className="mt-3 flex gap-2">
                {(
                  [
                    { id: "weekday" as const, label: "Weekday" },
                    { id: "weekend" as const, label: "Weekend" },
                  ] as const
                ).map((opt) => {
                  const active = weekPart === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setWeekPart((prev) =>
                          prev === opt.id ? "all" : opt.id,
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                        active
                          ? "bg-ink text-white"
                          : "bg-white/70 text-ink-soft ring-1 ring-black/8 hover:bg-white hover:text-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {thisWeek.length === 0 ? (
                <p className="mt-5 text-center text-[13px] text-ink-soft">
                  No {weekPart} events this week.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3.5 lg:mt-5 lg:gap-6">
                  {thisWeek.slice(0, THIS_WEEK_GRID_LIMIT).map((event, i) => (
                    <MonthEventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              )}

              <SeeAllLink
                href={seeAllHref("this-week")}
                variant="glass"
              >
                See all this Week
              </SeeAllLink>
            </div>
          ) : null}

          {nextUp.length > 0 && (
            <div
              id="home-next-week"
              className="month-list-panel mt-10 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-16 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader
                label="Next week"
                sort={sort}
                onSortChange={setSort}
              />
              <MonthEventList events={nextUp.slice(0, LIST_LIMIT)} />
              <SeeAllLink
                href={seeAllHref("next-week")}
                variant="glass"
              >
                See All Next Week
              </SeeAllLink>
            </div>
          )}

          {later.length > 0 && (
            <div
              id="home-later"
              className="month-list-panel mt-10 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-16 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader
                label="Later this month"
                sort={sort}
                onSortChange={setSort}
              />
              <MonthEventList events={later.slice(0, LIST_LIMIT)} />
              <SeeAllLink href={seeAllHref("later")} variant="glass">
                Explore everything upcoming
              </SeeAllLink>
            </div>
          )}
        </>
      )}
    </section>
  );
}
