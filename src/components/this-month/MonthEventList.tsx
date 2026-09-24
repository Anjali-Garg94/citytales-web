"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  dateHeaderParts,
  groupByDate,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import EventListRow from "@/components/event/EventListRow";
import { BookmarkIcon } from "../Icons";
import { staggerParent, viewport } from "../motion/variants";

/**
 * Date-grouped scanning list for "Next week" and "Later this month".
 * Uses the shared EventListRow so home matches Explore / Saved.
 */
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function timeLabel(event: MonthEvent): string {
  if (event.startTime && event.endTime) {
    return `${event.startTime} – ${event.endTime}`;
  }
  return event.startTime || "";
}

function ListEventRow({ event }: { event: MonthEvent }) {
  const [saved, setSaved] = useState(false);
  const time = timeLabel(event);

  return (
    <motion.div variants={rowVariants}>
      <EventListRow
        href={`/events/${event.slug}`}
        image={event.image}
        title={event.title}
        category={event.category}
        categoryVariant="pill"
        time={time || undefined}
        venue={event.venue || undefined}
        trailing={
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-label={
              saved
                ? `Remove bookmark from ${event.title}`
                : `Bookmark ${event.title}`
            }
            aria-pressed={saved}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink"
          >
            <BookmarkIcon className="h-4 w-4" filled={saved} />
          </button>
        }
      />
    </motion.div>
  );
}

export default function MonthEventList({ events }: { events: MonthEvent[] }) {
  const groups = groupByDate(events);

  return (
    <motion.div
      className="mt-5 lg:mt-6"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0.06)}
    >
      {groups.map(([date, dayEvents], groupIndex) => {
        const { primary, secondary } = dateHeaderParts(date);

        return (
          <div
            key={date}
            className={groupIndex === 0 ? "" : "mt-8 lg:mt-10"}
          >
            <h4 className="text-[length:var(--text-section)] leading-[1.3] font-medium tracking-[-0.01em] text-ink lg:text-[length:var(--text-section-lg)]">
              {primary}
              {secondary ? (
                <span className="text-ink-soft"> / {secondary}</span>
              ) : null}
            </h4>

            <div className="mt-3.5 flex flex-col gap-4 lg:mt-4 lg:gap-5">
              {dayEvents.map((event) => (
                <ListEventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
