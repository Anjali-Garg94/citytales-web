"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BUSY_THRESHOLD, type MonthEvent } from "@/lib/placeholder-month-data";
import CategoryPill from "@/components/CategoryPill";
import { ArrowRightIcon } from "../Icons";
import RevealGroup from "../motion/RevealGroup";
import RevealItem from "../motion/RevealItem";
import { fadeUp, viewport } from "../motion/variants";
import MonthEventCard from "./MonthEventCard";
import MonthEventList from "./MonthEventList";

const ALL = "All";

/** Rows shown per list before "See everything" takes over. */
const LIST_LIMIT = 4;

/** This week grid: fixed at 2 columns, capped at 3 rows (6 cards). */
const THIS_WEEK_GRID_LIMIT = 6;

function SectionHeader({ label }: { label: string }) {
  return (
    <RevealGroup stagger={0.08}>
      <RevealItem>
        <h3 className="font-serif text-[18px] leading-[1.2] font-semibold tracking-[-0.02em] text-ink lg:text-[20px] lg:leading-[1.15]">
          {label}
        </h3>
      </RevealItem>
    </RevealGroup>
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
  thisWeek: MonthEvent[];
  nextUp: MonthEvent[];
  later: MonthEvent[];
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

  const thisWeek = filter(allThisWeek);
  const nextUp = filter(allNextUp);
  const later = filter(allLater);
  const nothingMatches =
    thisWeek.length === 0 && nextUp.length === 0 && later.length === 0;

  const isBusy = allEvents.length >= BUSY_THRESHOLD;

  function seeAllHref(from: string) {
    return `/explore-events?from=${from}`;
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
          {thisWeek.length > 0 ? (
            <div
              id="home-this-week"
              className="this-week-panel mt-5 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-7 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader label="This week" />

              <div className="mt-4 grid grid-cols-2 gap-3.5 lg:mt-5 lg:gap-6">
                {thisWeek.slice(0, THIS_WEEK_GRID_LIMIT).map((event, i) => (
                  <MonthEventCard key={event.id} event={event} index={i} />
                ))}
              </div>

              <SeeAllLink href={seeAllHref("this-week")} variant="glass">
                See all this Week
              </SeeAllLink>
            </div>
          ) : null}

          {nextUp.length > 0 && (
            <div
              id="home-next-week"
              className="month-list-panel mt-10 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-16 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader label="Next week" />
              <MonthEventList events={nextUp.slice(0, LIST_LIMIT)} />
              <SeeAllLink href={seeAllHref("next-week")} variant="glass">
                See All Next Week
              </SeeAllLink>
            </div>
          )}

          {later.length > 0 && (
            <div
              id="home-later"
              className="month-list-panel mt-10 scroll-mt-24 mx-2 rounded-[22px] px-4 py-5 lg:mt-16 lg:mx-8 lg:rounded-[28px] lg:px-6 lg:py-7"
            >
              <SectionHeader label="Later" />
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
