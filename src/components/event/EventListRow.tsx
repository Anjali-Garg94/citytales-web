"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import EventThumb from "@/components/event/EventThumb";
import { ClockIcon, PinIcon } from "@/components/Icons";

export type EventListRowProps = {
  href: string;
  image: string;
  title: string;
  /** Category label — rendered as eyebrow caps or accent pill */
  category?: string;
  categoryVariant?: "eyebrow" | "pill" | "none";
  /** Calendar date under the title (e.g. flat / recently-added lists) */
  date?: string;
  time?: string;
  venue?: string;
  /** Soft chip above the title (e.g. Saved “Tonight”) */
  urgencyChip?: string;
  ended?: boolean;
  /** Bookmark / share / etc. — absolute top-right when provided */
  trailing?: ReactNode;
  className?: string;
};

/**
 * Shared horizontal event row — Explore, This Month lists, Saved.
 * Uses EventThumb for consistent photography crops.
 */
export default function EventListRow({
  href,
  image,
  title,
  category,
  categoryVariant = "eyebrow",
  date,
  time,
  venue,
  urgencyChip,
  ended = false,
  trailing,
  className = "",
}: EventListRowProps) {
  const showCategory =
    Boolean(category) && categoryVariant !== "none";
  const hasTrailing = Boolean(trailing);

  return (
    <div
      className={`group relative flex items-start gap-3.5 ${className}`}
    >
      <Link
        href={href}
        className={`flex min-w-0 flex-1 items-start gap-3.5 no-underline ${
          hasTrailing ? "pr-9" : ""
        }`}
      >
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          <EventThumb src={image} variant="list" ended={ended} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {urgencyChip && !ended ? (
            <span className="inline-block rounded-full bg-[#FFF1E0] px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-[#C46A1B]">
              {urgencyChip}
            </span>
          ) : null}

          {showCategory && categoryVariant === "eyebrow" ? (
            <div
              className={`truncate text-eyebrow ${
                urgencyChip && !ended ? "mt-0.5" : ""
              }`}
            >
              {category}
            </div>
          ) : null}

          <div
            className={`line-clamp-2 text-event-title ${
              (urgencyChip && !ended) ||
              (showCategory && categoryVariant === "eyebrow")
                ? "mt-0.5"
                : ""
            }`}
          >
            {title}
          </div>

          {/* Date under title (with time), matching This Week card stack */}
          {date ? (
            <div className="mt-1 text-meta">
              {date}
              {time ? ` · ${time}` : ""}
            </div>
          ) : null}

          {/* Time row when there is no date line */}
          {!date && (time || (showCategory && categoryVariant === "pill")) ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-meta">
              {time ? (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{time}</span>
                </span>
              ) : null}
              {showCategory && categoryVariant === "pill" ? (
                <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-accent-deep uppercase">
                  {category}
                </span>
              ) : null}
            </div>
          ) : null}

          {venue ? (
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-meta">
              <PinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
          ) : null}
        </div>
      </Link>

      {trailing ? (
        <div className="absolute top-0 right-0 flex items-start gap-0.5">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
