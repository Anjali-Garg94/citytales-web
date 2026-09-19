"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { dayNumber, weekdayShort, type MonthEvent } from "@/lib/placeholder-month-data";

/**
 * Square photo card for the "This week" grid.
 *
 * All the text sits on the photo rather than below it, so six cards fit in a
 * single phone screen — the point of the grid is scanning six at once, which a
 * caption under each card would defeat.
 */
export default function MonthEventCard({ event }: { event: MonthEvent }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative">
      <Link
        href={`/events/${event.slug}`}
        className="group block overflow-hidden rounded-[16px] no-underline lg:rounded-[18px]"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-30% to-[rgba(16,13,11,0.88)]" />

          {/* Date anchor */}
          <div className="absolute top-2.5 left-2.5 rounded-[11px] bg-white/95 px-2 py-1.5 text-center lg:top-3 lg:left-3 lg:px-2.5">
            <div className="font-serif text-[15px] leading-none font-semibold text-ink lg:text-[17px]">
              {dayNumber(event.date)}
            </div>
            <div className="mt-[2px] text-[8px] leading-none font-semibold tracking-[0.1em] text-ink-soft lg:text-[8.5px]">
              {weekdayShort(event.date)}
            </div>
          </div>

          {/* Text block */}
          <div className="absolute right-0 bottom-0 left-0 p-3 lg:p-4">
            <div className="text-[8.5px] font-semibold tracking-[0.14em] text-accent-tint uppercase lg:text-[9.5px]">
              {event.category}
            </div>
            <div className="mt-1 font-serif text-[14px] leading-[1.15] font-bold text-white lg:text-[17px]">
              {event.title}
            </div>
            <div className="mt-1 truncate text-[10.5px] text-white/80 lg:text-[12px]">
              {event.venue}
            </div>
          </div>
        </div>
      </Link>

      {/* Save — deliberately low-contrast, sits above the link */}
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
        aria-pressed={saved}
        className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition hover:bg-white lg:top-3 lg:right-3 lg:h-8 lg:w-8"
      >
        <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] lg:h-4 lg:w-4" fill={saved ? "#C1481D" : "none"}>
          <path
            d="M12 20.5C12 20.5 4 15.8 4 9.9C4 7.2 6.1 5 8.7 5C10.1 5 11.3 5.7 12 6.8C12.7 5.7 13.9 5 15.3 5C17.9 5 20 7.2 20 9.9C20 15.8 12 20.5 12 20.5Z"
            stroke={saved ? "#C1481D" : "#1E1A16"}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
