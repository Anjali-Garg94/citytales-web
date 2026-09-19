"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { TodayEvent } from "@/lib/data";
import { fadeUp, staggerParent, viewport } from "./motion/variants";

/**
 * The card rail. Split out from TodayEvents so that section stays an async
 * server component fetching the API, with only the reveal on the client —
 * the same split ThisWeekGrid already uses.
 *
 * The *rail* watches the viewport, not the individual cards. On a phone this
 * is a horizontal scroller several screens wide, so a card past the right
 * edge never intersects the viewport and a per-card trigger would leave it
 * invisible until someone swiped it into view — an event you can't read
 * until you find it. Triggering once on the container reveals the whole row
 * together, however far it runs.
 *
 * Cards then cascade on their own capped delays: five steps maximum, so the
 * tenth card isn't waiting on the first.
 */
export default function TodayEventsGrid({ events }: { events: TodayEvent[] }) {
  return (
    <motion.div
      className="no-scrollbar mt-[18px] flex gap-4 overflow-x-auto pb-1.5 [scroll-snap-type:x_proximity] lg:mt-[26px] lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(0)}
    >
      {events.map((event, i) => (
        <motion.div
          key={`${event.title}-${i}`}
          className="min-w-[168px] [scroll-snap-align:start] lg:min-w-0"
          variants={fadeUp(Math.min(i, 4) * 0.07, 18)}
        >
          <div className="mb-[9px] flex items-center lg:mb-[11px]">
            <span className="text-[11px] font-semibold text-accent lg:text-xs">
              {event.time || "All day"}
            </span>
          </div>
          {/* 4:3 rather than square — shorter card, and it lines up with the
              "This Week" grid below, which already uses this ratio. */}
          <div className="relative aspect-[4/3] w-[168px] overflow-hidden rounded-[18px] lg:w-full">
            <Image
              src={event.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 20vw, 168px"
              className="object-cover"
            />
            <div className="absolute top-2.5 left-2.5 rounded-full bg-white px-[11px] py-1 text-[9.5px] font-bold tracking-[0.03em] text-ink lg:top-[11px] lg:left-[11px] lg:px-3 lg:text-[10px]">
              {event.category}
            </div>
          </div>
          <div className="mt-2.5 font-serif text-[15px] font-semibold leading-[1.25] lg:mt-[11px] lg:text-base">
            {event.title}
          </div>
          <div className="mt-1 text-[11.5px] text-ink-soft lg:mt-[5px] lg:text-xs">
            {event.venue}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
