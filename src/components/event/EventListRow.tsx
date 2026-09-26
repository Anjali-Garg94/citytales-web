"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import EventThumb from "@/components/event/EventThumb";
import { ClockIcon, PinIcon } from "@/components/Icons";
import { categoryBadgeColors } from "@/lib/category-badge";

export type EventListRowProps = {
  href: string;
  image: string;
  title: string;
  /** Category label — rendered as eyebrow caps, accent pill, or right-side badge */
  category?: string;
  categoryVariant?: "eyebrow" | "pill" | "badge-right" | "none";
  /** Calendar date under the title (e.g. flat / recently-added lists) */
  date?: string;
  time?: string;
  /** Joiner between date and time when both are set. Default middle-dot. */
  dateTimeJoiner?: string;
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
  dateTimeJoiner = " · ",
  venue,
  urgencyChip,
  ended = false,
  trailing,
  className = "",
}: EventListRowProps) {
  const showCategory =
    Boolean(category) && categoryVariant !== "none";
  const badgeRight = showCategory && categoryVariant === "badge-right";
  const hasTrailing = Boolean(trailing) || badgeRight;
  const badgeColors =
    badgeRight && category ? categoryBadgeColors(category) : null;

  const dateTimeLine = date
    ? `${date}${time ? `${dateTimeJoiner}${time}` : ""}`
    : null;

  return (
    <div
      className={`group relative flex items-start gap-3.5 ${className}`}
    >
      <Link
        href={href}
        className={`flex min-w-0 flex-1 items-start gap-3.5 no-underline ${
          badgeRight ? "pr-[4.75rem]" : hasTrailing ? "pr-9" : ""
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

          {dateTimeLine ? (
            <div className="mt-1 text-meta">{dateTimeLine}</div>
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

      {badgeRight && badgeColors ? (
        <div className="absolute top-0.5 right-0">
          <span
            className="inline-block max-w-[5.5rem] truncate rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] uppercase"
            style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
          >
            {category}
          </span>
        </div>
      ) : null}

      {trailing ? (
        <div
          className={`absolute top-0 flex items-start gap-0.5 ${
            badgeRight ? "right-0 top-8" : "right-0"
          }`}
        >
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
