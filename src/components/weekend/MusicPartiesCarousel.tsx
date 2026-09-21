"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WeekendEvent } from "@/lib/placeholder-month-data";
import { ArrowRightIcon } from "../Icons";

/**
 * Centre-highlight carousel with left/right arrows overlaid mid-height on
 * the active picture. The View event CTA lives outside this component (below
 * the black band) — parent tracks the active card via onActiveChange.
 */
export default function MusicPartiesCarousel({
  events,
  onActiveChange,
}: {
  events: WeekendEvent[];
  onActiveChange?: (event: WeekendEvent | undefined) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const centre = scroller.scrollLeft + scroller.clientWidth / 2;

    let nearest = 0;
    let nearestDistance = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCentre = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCentre - centre);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    syncActive();
    window.addEventListener("resize", syncActive);
    return () => window.removeEventListener("resize", syncActive);
  }, [syncActive]);

  useEffect(() => {
    onActiveChange?.(events[active]);
  }, [active, events, onActiveChange]);

  // Reset when the tab swaps in a new list.
  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ left: 0 });
    onActiveChange?.(events[0]);
  }, [events, onActiveChange]);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(events.length - 1, index));
    cardRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={syncActive}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-[calc((100%-264px)/2)] py-6 lg:gap-6 lg:px-[calc((100%-340px)/2)] lg:py-8"
      >
        {events.map((event, i) => {
          const isActive = i === active;
          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              aria-current={isActive ? "true" : undefined}
              tabIndex={isActive ? 0 : -1}
              className={`relative aspect-[3/4] w-[264px] shrink-0 snap-center overflow-hidden rounded-[22px] no-underline transition-all duration-500 ease-out lg:w-[340px] ${
                isActive
                  ? "scale-100 opacity-100 shadow-[0_26px_50px_-18px_rgba(30,26,22,0.45)] grayscale-0"
                  : "scale-[0.88] opacity-70 grayscale-[0.55]"
              }`}
            >
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 340px, 264px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[rgba(12,10,9,0.92)] from-8% via-[rgba(12,10,9,0.35)] via-45% to-transparent" />

              <div className="absolute right-0 bottom-0 left-0 p-5 lg:p-6">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                  {event.category}
                </div>
                <div className="mt-2 font-serif text-[26px] leading-[1.08] font-bold text-white lg:text-[32px]">
                  {event.title}
                </div>
                <div className="mt-2.5 text-[12.5px] text-white/80 lg:text-[13px]">
                  {event.dateLabel} · {event.timeLabel}
                </div>
                <div className="text-[12.5px] text-white/65 lg:text-[13px]">
                  {event.venue}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mid-height arrows on the left and right of the carousel */}
      <button
        type="button"
        onClick={() => scrollToIndex(active - 1)}
        disabled={active === 0}
        aria-label="Previous event"
        className="absolute top-1/2 left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25 lg:left-6 lg:h-12 lg:w-12"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => scrollToIndex(active + 1)}
        disabled={active === events.length - 1}
        aria-label="Next event"
        className="absolute top-1/2 right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25 lg:right-6 lg:h-12 lg:w-12"
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
