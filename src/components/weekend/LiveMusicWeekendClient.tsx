"use client";

import Link from "next/link";
import { useState } from "react";
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
 * Owns the This weekend / All toggle. Data for both tabs is fetched
 * server-side (see LiveMusicWeekend.tsx) so switching tabs is instant.
 */
export default function LiveMusicWeekendClient({ thisWeekend, all }: Props) {
  const [tab, setTab] = useState<Tab>("This weekend");
  const events = tab === "This weekend" ? thisWeekend : all;

  return (
    <section className="overflow-hidden bg-[#0C0A09] pt-10 pb-12 lg:pt-14 lg:pb-16">
      <div className="lg:mx-auto lg:max-w-[1280px]">
        <RevealGroup
          className="flex items-end justify-between px-5 lg:px-20"
          stagger={0.08}
        >
          <RevealItem>
            <h2 className="font-serif text-2xl font-medium text-white lg:text-[32px]">
              Live music &amp; parties
            </h2>
          </RevealItem>
          <RevealItem>
            <Link
              href="/events?category=Music"
              className="hidden items-center gap-1.5 pb-1 text-[13px] font-semibold text-accent-tint no-underline hover:text-white lg:flex"
            >
              See all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </RevealItem>
        </RevealGroup>

        <RevealItem inGroup={false} className="mt-5 flex gap-2 px-5 lg:px-20">
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "border-white bg-white text-ink"
                    : "border-white/25 bg-transparent text-white/70 hover:border-white/60 hover:text-white"
                }`}
              >
                {t}
              </button>
            );
          })}
        </RevealItem>

        {/* The carousel reveals as one block rather than card by card: it
            already runs its own scale/opacity pass on whichever card is
            centred, and a second animation on the same properties would
            fight it. */}
        {events.length > 0 ? (
          <RevealItem inGroup={false}>
            <MusicPartiesCarousel events={events} />
          </RevealItem>
        ) : (
          <RevealItem
            inGroup={false}
            className="mx-5 mt-8 rounded-[18px] border border-white/15 px-5 py-12 text-center lg:mx-20"
          >
            <div className="font-serif text-lg font-semibold text-white">
              Nothing listed yet
            </div>
            <div className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-white/60 lg:text-sm">
              New music &amp; party events go up regularly — check back soon.
            </div>
          </RevealItem>
        )}

        <RevealItem inGroup={false} className="mt-6 px-5 lg:hidden">
          <Link
            href="/events?category=Music"
            className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-accent-tint no-underline"
          >
            See all music &amp; parties
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </RevealItem>
      </div>
    </section>
  );
}
