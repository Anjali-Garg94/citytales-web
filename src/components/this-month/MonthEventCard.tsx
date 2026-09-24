"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  dayNumber,
  monthShort,
  weekdayShort,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import EventThumb from "@/components/event/EventThumb";
import { BookmarkIcon } from "../Icons";
import { fadeUp, viewport } from "../motion/variants";

/**
 * This Week card — square photo via shared EventThumb, title + date.
 */
export default function MonthEventCard({
  event,
  index = 0,
}: {
  event: MonthEvent;
  index?: number;
}) {
  const [saved, setSaved] = useState(false);
  const delay = Math.min(Math.floor(index / 2), 3) * 0.08 + (index % 2) * 0.05;

  const dateLabel = [
    weekdayShort(event.date),
    `${dayNumber(event.date)} ${monthShort(event.date)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      className="relative rounded-[18px] border border-[#F0EEEA] bg-white lg:rounded-[20px]"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp(delay, 20)}
    >
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-label={saved ? `Remove bookmark from ${event.title}` : `Bookmark ${event.title}`}
        aria-pressed={saved}
        className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink lg:top-4 lg:right-4 lg:h-10 lg:w-10"
      >
        <BookmarkIcon
          className="h-4 w-4 lg:h-[18px] lg:w-[18px]"
          filled={saved}
        />
      </button>

      <Link
        href={`/events/${event.slug}`}
        className="group block px-3.5 py-3.5 no-underline lg:px-4 lg:py-4"
      >
        <div className="transition-transform duration-500 group-hover:scale-[1.03]">
          <EventThumb src={event.image} variant="card" />
        </div>

        <div className="mt-3.5 line-clamp-2 text-event-title lg:mt-4">
          {event.title}
        </div>

        {dateLabel ? (
          <div className="mt-1.5 text-meta">
            {dateLabel}
            {event.startTime ? ` · ${event.startTime}` : ""}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
