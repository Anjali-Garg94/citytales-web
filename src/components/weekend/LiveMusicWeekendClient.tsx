"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { WeekendEvent } from "@/lib/placeholder-month-data";
import { ArrowRightIcon } from "../Icons";
import RevealGroup from "../motion/RevealGroup";
import RevealItem from "../motion/RevealItem";
import MusicPartiesCarousel from "./MusicPartiesCarousel";

const TABS = ["This weekend", "All"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  /** THIS_WEEK, filtered to Music & Parties — live from the API. */
  thisWeekend: WeekendEvent[];
  /** ALL, filtered to Music & Parties — live from the API. */
  all: WeekendEvent[];
};

/**
 * Owns the This weekend / All toggle. Heading + tabs sit on the light page
 * ground; the carousel is on the black band; View event sits below the band.
 */
export default function LiveMusicWeekendClient({ thisWeekend, all }: Props) {
  const [tab, setTab] = useState<Tab>("This weekend");
  const events = tab === "This weekend" ? thisWeekend : all;
  const [activeEvent, setActiveEvent] = useState<WeekendEvent | undefined>(
    events[0],
  );

  const onActiveChange = useCallback((event: WeekendEvent | undefined) => {
    setActiveEvent(event);
  }, []);

  return (
    <section className="overflow-hidden">
      {/* Heading + tabs — outside the black band */}
      <div className="lg:mx-auto lg:max-w-[1280px]">
        <RevealGroup
          className="flex items-end justify-between px-5 pt-9 lg:px-20 lg:pt-12"
          stagger={0.08}
        >
          <RevealItem>
            <h2 className="font-serif text-[26px] font-medium leading-[1.15] text-ink lg:text-[34px]">
              Live music &amp; parties
            </h2>
          </RevealItem>
          <RevealItem>
            <Link
              href="/events?category=Music"
              className="hidden items-center gap-1.5 pb-1 text-[13px] font-semibold text-accent no-underline hover:text-accent-deep lg:flex"
            >
              See all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </RevealItem>
        </RevealGroup>

        <RevealItem
          inGroup={false}
          className="mt-5 flex gap-2 px-5 pb-6 lg:mt-6 lg:px-20 lg:pb-8"
        >
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-[#F1EFEC] text-ink-soft hover:bg-[#E6E2DB] hover:text-ink"
                }`}
              >
                {t}
              </button>
            );
          })}
        </RevealItem>
      </div>

      {/* Black band — carousel + side arrows only */}
      <div className="bg-[#0C0A09] pt-6 pb-8 lg:pt-8 lg:pb-10">
        <div className="lg:mx-auto lg:max-w-[1280px]">
          {events.length > 0 ? (
            <RevealItem inGroup={false}>
              <MusicPartiesCarousel
                events={events}
                onActiveChange={onActiveChange}
              />
            </RevealItem>
          ) : (
            <RevealItem
              inGroup={false}
              className="mx-5 rounded-[18px] border border-white/15 px-5 py-12 text-center lg:mx-20"
            >
              <div className="font-serif text-lg font-semibold text-white">
                Nothing listed yet
              </div>
              <div className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-white/60 lg:text-sm">
                New music &amp; party events go up regularly — check back soon.
              </div>
            </RevealItem>
          )}
        </div>
      </div>

      {/* View event — below the black band */}
      {activeEvent ? (
        <RevealItem
          inGroup={false}
          className="flex justify-center px-5 pt-6 pb-10 lg:pt-8 lg:pb-14"
        >
          <Link
            href={`/events/${activeEvent.slug}`}
            className="flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-[14px] font-semibold tracking-[0.01em] text-white no-underline transition hover:gap-3 hover:brightness-110 lg:px-7 lg:py-3 lg:text-[15px]"
          >
            View event
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </RevealItem>
      ) : null}
    </section>
  );
}
