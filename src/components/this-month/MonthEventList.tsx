"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  dateHeaderParts,
  groupByDate,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { BookmarkIcon, ClockIcon, PinIcon } from "../Icons";
import { staggerParent, viewport } from "../motion/variants";

/**
 * Date-grouped scanning list for "Next week" and "Later this month".
 *
 * Each day gets a Luma-style header — "Tomorrow / Monday" or
 * "22 September / Tuesday" — then horizontal event rows with a large
 * thumbnail, bold title, and time + venue meta.
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
    <motion.div
      variants={rowVariants}
      className="group relative flex items-start gap-3.5 lg:gap-5"
    >
      <Link
        href={`/events/${event.slug}`}
        className="flex min-w-0 flex-1 items-start gap-3.5 no-underline lg:gap-5"
      >
        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[14px] lg:h-[96px] lg:w-[96px] lg:rounded-2xl">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1 pt-0.5 pr-9">
          <div className="line-clamp-2 font-serif text-base leading-[1.25] font-medium text-ink lg:text-lg">
            {event.title}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12px] text-ink-soft lg:text-[13px]">
            {time ? (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                {time}
              </span>
            ) : null}
            <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-accent-deep uppercase">
              {event.category}
            </span>
          </div>

          {event.venue ? (
            <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px] text-ink-soft lg:text-[13px]">
              <PinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-label={
          saved
            ? `Remove bookmark from ${event.title}`
            : `Bookmark ${event.title}`
        }
        aria-pressed={saved}
        className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink"
      >
        <BookmarkIcon className="h-4 w-4" filled={saved} />
      </button>
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
            <h4 className="text-[14px] leading-[1.3] font-normal tracking-[-0.01em] text-ink lg:text-[15px]">
              {primary}
              {secondary ? (
                <span className="text-ink-soft">
                  {" "}
                  / {secondary}
                </span>
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
