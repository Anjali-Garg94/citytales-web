"use client";

import Image from "next/image";
import Link from "next/link";
import {
  dayNumber,
  groupByDate,
  weekdayShort,
  type MonthEvent,
} from "@/lib/placeholder-month-data";

/**
 * Date-anchored scanning list.
 *
 * The date column prints only on the first event of each date, so dates read as
 * anchors down the left edge rather than as a calendar grid. Used by both
 * "Next week" and "Later this month", which share one format.
 */
export default function MonthEventList({ events }: { events: MonthEvent[] }) {
  const groups = groupByDate(events);

  return (
    <div className="mt-4 border-t border-line lg:mt-5">
      {groups.map(([date, dayEvents]) =>
        dayEvents.map((event, i) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group flex items-center gap-3.5 border-b border-line py-3.5 no-underline lg:gap-5 lg:py-4"
          >
            {/* Date anchor — only on the first event of each date */}
            <div className="w-10 shrink-0 text-center lg:w-12">
              {i === 0 ? (
                <>
                  <div className="font-serif text-[19px] leading-none font-semibold text-ink lg:text-[21px]">
                    {dayNumber(date)}
                  </div>
                  <div className="mt-1 text-[9.5px] leading-none font-semibold tracking-[0.1em] text-ink-soft">
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
          </Link>
        )),
      )}
    </div>
  );
}
