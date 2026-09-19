"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BUSY_THRESHOLD,
  categoriesIn,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { ArrowRightIcon } from "../Icons";
import MonthEventCard from "./MonthEventCard";
import MonthEventList from "./MonthEventList";

const ALL = "All";

/** Rows shown per list before "See everything" takes over. */
const LIST_LIMIT = 4;

/** This week grid: fixed at 2 columns, capped at 4 rows (8 cards). */
const THIS_WEEK_GRID_LIMIT = 8;

function SectionLabel({ label, note }: { label: string; note?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
        {label}
      </div>
      {note ? (
        <div className="mt-1.5 text-[13px] text-ink-soft lg:text-sm">{note}</div>
      ) : null}
    </div>
  );
}

function SeeAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-4 flex items-center justify-end gap-1.5 text-[13px] font-semibold tracking-[0.02em] text-accent no-underline hover:text-accent-deep"
    >
      {children}
      <ArrowRightIcon className="h-3.5 w-3.5" />
    </Link>
  );
}

type Props = {
  /** THIS_WEEK section — live from the API. */
  thisWeek: MonthEvent[];
  /** NEXT_WEEK section — live from the API. */
  nextUp: MonthEvent[];
  /** AFTER_NEXT_WEEK section — live from the API. */
  later: MonthEvent[];
};

export default function ThisMonthSectionClient({
  thisWeek: allThisWeek,
  nextUp: allNextUp,
  later: allLater,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const allEvents = useMemo(
    () => [...allThisWeek, ...allNextUp, ...allLater],
    [allThisWeek, allNextUp, allLater],
  );

  // Derived from the data so no chip can lead to an empty result.
  const chips = useMemo(() => [ALL, ...categoriesIn(allEvents)], [allEvents]);

  const filter = (events: MonthEvent[]) =>
    activeCategory === ALL
      ? events
      : events.filter((e) => e.category === activeCategory);

  const thisWeek = filter(allThisWeek);
  const nextUp = filter(allNextUp);
  const later = filter(allLater);
  const nothingMatches =
    thisWeek.length === 0 && nextUp.length === 0 && later.length === 0;

  const isBusy = allEvents.length >= BUSY_THRESHOLD;

  return (
    <section
      id="whats-on"
      className="scroll-mt-4 border-t border-line py-10 lg:mx-auto lg:max-w-[1280px] lg:py-16"
    >
      {/* 1 — Month header */}
      <div className="px-5 lg:px-20">
        <h2 className="font-serif text-[34px] leading-[1.1] font-semibold text-ink lg:text-[46px] lg:leading-[1.08]">
          Your city
          <br />
          {isBusy ? <>is looking busy.</> : <>is taking shape.</>}
        </h2>
      </div>

      {/* 2 — Category chips. Full-bleed so a half-chip signals swipe. */}
      {chips.length > 1 && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto px-5 pb-1 lg:mt-8 lg:flex-wrap lg:px-20">
          {chips.map((chip) => {
            const active = chip === activeCategory;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveCategory(chip)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-transparent text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
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
          {/* 3 — This week: the visual anchor */}
          {thisWeek.length > 0 && (
            <div className="mt-9 lg:mt-14">
              <div className="px-5 lg:px-20">
                <SectionLabel label="This week" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3.5 px-5 lg:mt-5 lg:gap-6 lg:px-20">
                {thisWeek.slice(0, THIS_WEEK_GRID_LIMIT).map((event) => (
                  <MonthEventCard key={event.id} event={event} />
                ))}
              </div>

              <div className="px-5 lg:px-20">
                <SeeAllLink href="/this-week">See all this weekend</SeeAllLink>
              </div>
            </div>
          )}

          {/* 4 — Next week: the scanning layer. Capped at 4; the rest lives
              behind "See everything upcoming". */}
          {nextUp.length > 0 && (
            <div className="mt-10 px-5 lg:mt-16 lg:px-20">
              <SectionLabel label="Next week" />
              <MonthEventList events={nextUp.slice(0, LIST_LIMIT)} />
              <SeeAllLink href="/this-week">See everything upcoming</SeeAllLink>
            </div>
          )}

          {/* 5 — After next week: same treatment as Next week */}
          {later.length > 0 && (
            <div className="mt-10 px-5 lg:mt-16 lg:px-20">
              <SectionLabel
                label="Later this month"
                note="The month isn't over yet."
              />
              <MonthEventList events={later.slice(0, LIST_LIMIT)} />
              <SeeAllLink href="/this-week">Explore everything upcoming</SeeAllLink>
            </div>
          )}
        </>
      )}
    </section>
  );
}
