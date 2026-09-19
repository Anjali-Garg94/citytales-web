"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { WeekEvent } from "@/lib/data";
import { BookmarkIcon } from "./Icons";

/**
 * The animated card grid. Split out from ThisWeek so the section itself can be
 * an async server component that fetches from the API, while the scroll-reveal
 * animation stays on the client.
 */
export default function ThisWeekGrid({ events }: { events: WeekEvent[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 pb-11 lg:mt-[30px] lg:grid-cols-3 lg:gap-x-8 lg:gap-y-9 lg:pb-14">
      {events.map((event, i) => (
        <motion.div
          key={`${event.title}-${i}`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
        >
          <div className="group relative aspect-square w-full overflow-hidden rounded-full">
            <Image
              src={event.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[rgba(18,15,13,0)] from-38% to-[rgba(18,15,13,0.8)]" />
            <div className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 lg:top-4 lg:left-4 lg:h-[34px] lg:w-[34px]">
              <BookmarkIcon className="h-[13px] w-[13px] text-ink lg:h-[15px] lg:w-[15px]" />
            </div>
            <div className="absolute right-0 bottom-0 left-0 px-3.5 pb-[18px] text-center lg:px-5 lg:pb-6">
              <div className="font-serif text-sm font-bold leading-[1.2] text-white lg:text-[17px]">
                {event.title}
              </div>
              <div className="mt-1.5 text-[9px] font-bold tracking-[0.1em] text-accent-tint uppercase lg:mt-[6px] lg:text-[10px]">
                {event.category}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center lg:mt-4">
            <div className="font-serif text-[14.5px] font-semibold leading-[1.25] lg:text-base">
              {event.title}
            </div>
            <div className="mt-[3px] text-[11px] text-ink-soft lg:mt-1 lg:text-xs">
              {event.venue}
            </div>
            <div className="mt-[3px] text-[10.5px] text-ink-soft lg:text-[11.5px]">
              {event.date}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
