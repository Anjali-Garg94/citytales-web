"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  dayNumber,
  monthShort,
  weekdayShort,
  type MonthEvent,
} from "@/lib/placeholder-month-data";
import { useSaveEvent } from "@/components/event/useSaveEvent";
import { BookmarkIcon, PinIcon } from "../Icons";
import { staggerParent, viewport } from "../motion/variants";

/**
 * Flat scanning list for "Next week" and "Later this month".
 * Meta line matches Explore: Date | Time, then venue.
 */
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function eventDateLabel(isoDate: string): string {
  return [
    weekdayShort(isoDate),
    `${dayNumber(isoDate)} ${monthShort(isoDate)}`,
  ]
    .filter(Boolean)
    .join(" ");
}

function ListEventCard({ event }: { event: MonthEvent }) {
  const { saved, saving, toggleSave } = useSaveEvent(event.id);
  const dateLabel = eventDateLabel(event.date);
  const dateTimeLine = dateLabel
    ? `${dateLabel}${event.startTime ? ` | ${event.startTime}` : ""}`
    : event.startTime || "";

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

            {dateTimeLine ? (
              <div className="mt-1 text-[12.5px] leading-snug font-medium text-ink-soft lg:text-[13px]">
                {dateTimeLine}
              </div>
            ) : null}

            {event.venue ? (
              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12.5px] leading-snug text-ink-soft lg:text-[13px]">
                <PinIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{event.venue}</span>
              </div>
            ) : null}
          </div>
        </Link>

        <button
          type="button"
          disabled={saving}
          onClick={(e) => void toggleSave(e)}
          aria-label={
            saved
              ? `Remove bookmark from ${event.title}`
              : `Bookmark ${event.title}`
          }
          aria-pressed={saved}
          className="absolute top-1/2 right-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition hover:bg-[#F4F3F1] hover:text-ink disabled:opacity-60 lg:right-3"
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
