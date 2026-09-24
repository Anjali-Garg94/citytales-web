"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  dateHeaderParts,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { BookmarkIcon, ClockIcon, PinIcon } from "../Icons";
import { staggerParent, viewport } from "../motion/variants";

/**
 * Flat scanning list for "Next week" and "Later this month".
 * Card stack: title → date → time · location.
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
  return event.startTime || "";
}

function eventDateLabel(isoDate: string): string {
  const { primary, secondary } = dateHeaderParts(isoDate);
  if (!primary) return "";
  return secondary ? `${primary} / ${secondary}` : primary;
}

function ListEventCard({ event }: { event: MonthEvent }) {
  const [saved, setSaved] = useState(false);
  const time = timeLabel(event);
  const dateLabel = eventDateLabel(event.date);

  return (
    <motion.div variants={rowVariants}>
      <div className="relative overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_-12px_rgba(30,26,22,0.22)] ring-1 ring-black/[0.04]">
        <Link
          href={`/events/${event.slug}`}
          className="flex items-center gap-3 py-3 pr-11 pl-2.5 no-underline lg:gap-3.5 lg:py-3.5 lg:pr-12 lg:pl-3"
        >
          <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[12px] bg-[#F4F3F1] lg:h-[76px] lg:w-[76px]">
            <Image
              src={event.image}
              alt=""
              fill
              sizes="76px"
              className="object-cover"
              style={{ objectPosition: "var(--thumb-object-position)" }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-[15px] leading-[1.3] font-bold tracking-[-0.01em] text-ink lg:text-[16px]">
              {event.title}
            </div>

            {dateLabel ? (
              <div className="mt-1 text-[12.5px] leading-snug font-medium text-ink-soft lg:text-[13px]">
                {dateLabel}
              </div>
            ) : null}

            {time || event.venue ? (
              <div className="mt-1 flex min-w-0 items-center gap-2 text-[12.5px] leading-snug text-ink-soft lg:text-[13px]">
                {time ? (
                  <span className="inline-flex min-w-0 shrink-0 items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{time}</span>
                  </span>
                ) : null}
                {time && event.venue ? (
                  <span className="shrink-0 text-ink-soft/50" aria-hidden>
                    ·
                  </span>
                ) : null}
                {event.venue ? (
                  <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
                    <PinIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{event.venue}</span>
                  </span>
                ) : null}
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
          className="absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition hover:bg-[#F4F3F1] hover:text-ink lg:right-3"
        >
          <BookmarkIcon className="h-4 w-4" filled={saved} />
        </button>
      </div>
    </motion.div>
  );
}

export default function MonthEventList({
  events,
}: {
  events: MonthEvent[];
}) {
  return (
    <motion.div
      className="mt-5 flex flex-col gap-3 lg:mt-6 lg:gap-3.5"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0.06)}
    >
      {events.map((event) => (
        <ListEventCard key={event.id} event={event} />
      ))}
    </motion.div>
  );
}
