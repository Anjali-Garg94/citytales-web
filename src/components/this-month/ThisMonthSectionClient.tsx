"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BUSY_THRESHOLD, type MonthEvent } from "@/lib/placeholder-month-data";
import { ArrowRightIcon } from "../Icons";
import RevealGroup from "../motion/RevealGroup";
import RevealItem from "../motion/RevealItem";
import RevealLines from "../motion/RevealLines";
import { fadeUp, viewport } from "../motion/variants";
import MonthEventCard from "./MonthEventCard";
import MonthEventList from "./MonthEventList";

const ALL = "All";

/** Rows shown per list before "See everything" takes over. */
const LIST_LIMIT = 4;

/** This week grid: fixed at 2 columns, capped at 4 rows (8 cards). */
const THIS_WEEK_GRID_LIMIT = 8;

function SectionLabel({ label, note }: { label: string; note?: string }) {
  return (
    <RevealGroup stagger={0.08}>
      <RevealItem>
        <div className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          {label}
        </div>
      </RevealItem>
      {note ? (
        <RevealItem className="mt-1.5">
          <div className="text-[13px] text-ink-soft lg:text-sm">{note}</div>
        </RevealItem>
      ) : null}
    </RevealGroup>
  );
}

function SeeAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <RevealItem inGroup={false}>
      <Link
        href={href}
        className="mt-4 flex items-center justify-end gap-1.5 text-[13px] font-semibold tracking-[0.02em] text-accent no-underline hover:text-accent-deep"
      >
        {children}
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </RevealItem>
  );
}

type Props = {
  /** THIS_WEEK section — live from the API. */
  thisWeek: MonthEvent[];
  /** NEXT_WEEK section — live from the API. */
  nextUp: MonthEvent[];
  /** AFTER_NEXT_WEEK section — live from the API. */
  later: MonthEvent[];
  /** Full category taxonomy — live from the category API. */
  categories: string[];
};

export default function ThisMonthSectionClient({
  thisWeek: allThisWeek,
  nextUp: allNextUp,
  later: allLater,
  categories,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const allEvents = useMemo(
    () => [...allThisWeek, ...allNextUp, ...allLater],
    [allThisWeek, allNextUp, allLater],
  );

  // From the category API, not derived from the events in view — a category
  // with nothing on this week still shows up as a chip.
  const chips = useMemo(() => [ALL, ...categories], [categories]);

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
      className="scroll-mt-4 pt-2 pb-10 lg:mx-auto lg:max-w-[1280px] lg:pt-4 lg:pb-16"
    >
      {/* 1 — Month header. The page's headline moment, so it gets the masked
          line reveal rather than the plain fade everything else uses. */}
      <div className="px-5 lg:px-20">
        <h2 className="font-serif text-2xl leading-[1.1] font-medium text-ink lg:text-[32px] lg:leading-[1.08]">
          <RevealLines
            className="block"
            lines={["Your city", isBusy ? "is looking busy." : "is taking shape."]}
          />
        </h2>
      </div>

      {/* 2 — Category chips. Full-bleed so a half-chip signals swipe. */}
      {chips.length > 1 && (
        <motion.div
          className="no-scrollbar mt-6 flex gap-2 overflow-x-auto px-5 pb-1 lg:mt-8 lg:flex-wrap lg:px-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp(0.1, 14)}
        >
          {chips.map((chip) => {
            const active = chip === activeCategory;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveCategory(chip)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-[#F1EFEC] text-ink-soft hover:bg-[#E6E2DB] hover:text-ink"
                }`}
              >
                {chip}
              </button>
            );
          })}
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
          {/* 3 — This week: the visual anchor */}
          {thisWeek.length > 0 && (
            <div className="mt-9 lg:mt-14">
              <RevealGroup
                className="flex items-center justify-between px-5 lg:px-20"
                stagger={0.08}
              >
                <RevealItem>
                  <h3 className="font-serif text-[22px] font-bold text-ink lg:text-[28px]">
                    This Week
                  </h3>
                </RevealItem>
                <RevealItem>
                  <Link
                    href="/this-week"
                    className="flex items-center gap-1 text-[13px] font-semibold text-accent no-underline hover:text-accent-deep"
                  >
                    See all
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </RevealItem>
              </RevealGroup>

              {/* Cards carry their own index so the two columns cascade
                  diagonally rather than row-by-row. */}
              <div className="mt-5 grid grid-cols-2 gap-3.5 px-5 lg:mt-6 lg:gap-6 lg:px-20">
                {thisWeek.slice(0, THIS_WEEK_GRID_LIMIT).map((event, i) => (
                  <MonthEventCard key={event.id} event={event} index={i} />
                ))}
              </div>

              <RevealItem inGroup={false} className="mt-5 px-5 lg:px-20">
                <Link
                  href="/this-week"
                  className="flex items-center justify-center gap-1.5 rounded-full border border-line py-3 text-[13px] font-semibold text-ink no-underline hover:border-ink"
                >
                  See all this weekend
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </RevealItem>
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
