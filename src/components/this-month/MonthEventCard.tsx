"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  dayNumber,
  monthShort,
  weekdayShort,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { fadeUp, viewport } from "../motion/variants";

/**
 * This Week card — community-card layout:
 * top row: square photo + category pill, then event name, then date.
 *
 * `index` only drives the reveal delay (two-column cascade).
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
        aria-label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
        aria-pressed={saved}
        className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink lg:top-4 lg:right-4 lg:h-10 lg:w-10"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 lg:h-[18px] lg:w-[18px]" fill={saved ? "#C1481D" : "none"}>
          <path
            d="M12 20.5C12 20.5 4 15.8 4 9.9C4 7.2 6.1 5 8.7 5C10.1 5 11.3 5.7 12 6.8C12.7 5.7 13.9 5 15.3 5C17.9 5 20 7.2 20 9.9C20 15.8 12 20.5 12 20.5Z"
            stroke={saved ? "#C1481D" : "currentColor"}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Link
        href={`/events/${event.slug}`}
        className="group block px-3.5 py-3.5 no-underline lg:px-4 lg:py-4"
      >
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] lg:h-20 lg:w-20 lg:rounded-2xl">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Event name */}
        <div className="mt-3.5 line-clamp-2 text-[15px] leading-[1.25] font-bold text-ink lg:mt-4 lg:text-[17px]">
          {event.title}
        </div>

        {/* Date */}
        {dateLabel ? (
          <div className="mt-1.5 text-[12px] leading-[1.4] text-ink-soft lg:text-[13px]">
            {dateLabel}
            {event.startTime ? ` · ${event.startTime}` : ""}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
