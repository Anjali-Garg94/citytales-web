"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WeekendEvent } from "@/lib/placeholder-month-data";
import { ArrowRightIcon } from "../Icons";

/**
 * Centre-highlight carousel.
 *
 * Built on native horizontal scrolling with CSS scroll-snap rather than a
 * transform track: momentum scrolling, swipe and keyboard all come for free on
 * touch devices, and the arrows just scroll the container. The "which card is
 * highlighted" state is derived from scroll position — whichever card centre is
 * nearest the container centre wins — so dragging and tapping stay in sync.
 *
 * Note: the controls are styled for a DARK ground (white arrows, white dots).
 * Reusing this on a light section needs a tone prop.
 */
export default function MusicPartiesCarousel({
  events,
}: {
  events: WeekendEvent[];
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

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(events.length - 1, index));
    // block:"nearest" keeps the page from jumping vertically.
    cardRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const activeEvent = events[active];

  return (
    <div>
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

      {/* Controls — the centre CTA follows whichever card is highlighted */}
      <div className="mt-2 flex items-center justify-center gap-3 lg:mt-3 lg:gap-4">
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          disabled={active === 0}
          aria-label="Previous event"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
        </button>

        <Link
          href={`/events/${activeEvent?.slug ?? ""}`}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14px] font-semibold text-white no-underline transition hover:gap-3 hover:brightness-110"
        >
          View event
          <ArrowRightIcon className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          disabled={active === events.length - 1}
          aria-label="Next event"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Position dots */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {events.map((event, i) => (
          <button
            key={event.id}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to ${event.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-5 bg-white" : "w-1.5 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
