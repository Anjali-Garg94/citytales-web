"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  dayOrdinal,
  groupByDate,
  monthShort,
  weekdayShort,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { staggerParent, viewport } from "../motion/variants";

/**
 * Date-anchored scanning list.
 *
 * The date column prints only on the first event of each date, so dates read as
 * anchors down the left edge rather than as a calendar grid. Used by both
 * "Next week" and "Later this month", which share one format.
 */
const MotionLink = motion.create(Link);

/** Rows arrive top-to-bottom, close together — this is a scanning list. */
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function MonthEventList({ events }: { events: MonthEvent[] }) {
  const groups = groupByDate(events);

  return (
    <motion.div
      className="mt-4 lg:mt-5"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0.07)}
    >
      {groups.map(([date, dayEvents]) =>
        dayEvents.map((event, i) => (
          <MotionLink
            key={event.id}
            href={`/events/${event.slug}`}
            variants={rowVariants}
            className="group flex items-center gap-3.5 py-3.5 no-underline lg:gap-5 lg:py-4"
          >
            {/* Date anchor — only on the first event of each date */}
            <div className="w-12 shrink-0 text-center lg:w-14">
              {i === 0 ? (
                <>
                  <div className="font-serif text-[14px] leading-none font-semibold text-ink lg:text-[15px]">
                    {dayOrdinal(date)}
                  </div>
                  <div className="mt-1 text-[8.5px] leading-none font-semibold tracking-[0.1em] text-ink-soft uppercase">
                    {monthShort(date)}
                  </div>
                  <div className="mt-1 text-[8.5px] leading-none font-semibold tracking-[0.1em] text-ink-soft uppercase">
                    {weekdayShort(date)}
                  </div>
                </>
              ) : (
                <div aria-hidden className="h-px" />
              )}
            </div>

            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl lg:h-16 lg:w-16">
              <Image
                src={event.image}
                alt=""
                fill
                sizes="64px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate font-serif text-[15px] font-semibold text-ink lg:text-base">
                {event.title}
              </div>
              <div className="truncate text-[12px] text-ink-soft lg:text-[12.5px]">
                {event.venue}
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-accent-tint px-2.5 py-1 text-[9.5px] font-bold tracking-[0.08em] text-accent-deep uppercase lg:px-3 lg:py-[5px] lg:text-[10px]">
              {event.category}
            </div>
          </MotionLink>
        )),
      )}
    </motion.div>
  );
}
