"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { dayNumber, weekdayShort, type MonthEvent } from "@/lib/placeholder-month-data";
import { PinIcon } from "../Icons";
import { fadeUp, viewport } from "../motion/variants";

type BadgeColors = { bg: string; text: string };

/** Category pill colors, keyed by the backend's uppercase category label. */
const CATEGORY_BADGE_COLORS: Record<string, BadgeColors> = {
  MUSIC: { bg: "#EDE7FB", text: "#6D4FC4" },
  "LIVE SHOWS": { bg: "#DFF3E7", text: "#1F8A54" },
  WORKSHOPS: { bg: "#FDE9D2", text: "#B9631A" },
  "FOOD & DRINKS": { bg: "#FBE4E4", text: "#C23B3B" },
  CLUB: { bg: "#E3EEFC", text: "#2563A6" },
  EXHIBITION: { bg: "#FBE4E4", text: "#C23B3B" },
  FESTIVE: { bg: "#FEF0C7", text: "#A16207" },
  WELLNESS: { bg: "#E1F5F1", text: "#0F8A78" },
  KIDS: { bg: "#FDE7F3", text: "#C23B86" },
};

const DEFAULT_BADGE: BadgeColors = {
  bg: "var(--accent-tint)",
  text: "var(--accent-deep)",
};

function badgeColors(category: string): BadgeColors {
  return CATEGORY_BADGE_COLORS[category.toUpperCase()] ?? DEFAULT_BADGE;
}

/**
 * White photo-topped card for the "This week" grid — image up top with the
 * date and save controls, a colour-coded category pill straddling the
 * photo/card boundary, then title, venue and time on a plain white ground.
 *
 * `index` is the card's position in the grid and only drives the reveal
 * delay: `% 2` matches the two columns, so a row's pair arrives together and
 * the grid cascades downward. Capped at four steps — a card further down the
 * grid should not inherit a long wait from the cards above it.
 */
export default function MonthEventCard({
  event,
  index = 0,
}: {
  event: MonthEvent;
  index?: number;
}) {
  const [saved, setSaved] = useState(false);
  const colors = badgeColors(event.category);
  const delay = Math.min(Math.floor(index / 2), 3) * 0.08 + (index % 2) * 0.05;

  return (
    <motion.div
      className="relative overflow-hidden rounded-[16px] bg-white shadow-[0_2px_14px_rgba(30,26,22,0.1)] lg:rounded-[18px]"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp(delay, 20)}
    >
      <Link href={`/events/${event.slug}`} className="group block no-underline">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />

          {/* Date anchor */}
          <div className="absolute top-2.5 left-2.5 rounded-[11px] bg-white/95 px-2 py-1.5 text-center lg:top-3 lg:left-3 lg:px-2.5">
            <div className="font-serif text-[15px] leading-none font-semibold text-ink lg:text-[17px]">
              {dayNumber(event.date)}
            </div>
            <div className="mt-[2px] text-[8px] leading-none font-semibold tracking-[0.1em] text-ink-soft lg:text-[8.5px]">
              {weekdayShort(event.date)}
            </div>
          </div>
        </div>

        <div className="relative px-3.5 pt-5 pb-3.5 lg:px-4 lg:pt-6 lg:pb-4">
          {/* Category pill — straddles the photo/card boundary */}
          <span
            className="absolute -top-3 left-3.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold lg:-top-3.5 lg:left-4 lg:text-[11px]"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {event.category}
          </span>

          <div className="line-clamp-2 font-serif text-[15px] leading-[1.22] font-bold text-ink lg:text-[17px]">
            {event.title}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-soft lg:text-[12.5px]">
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
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
    </motion.div>
  );
}
