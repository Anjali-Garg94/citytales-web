"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WeekendEvent } from "@/lib/placeholder-month-data";
import { useAuth } from "@/components/auth/AuthContext";
import EventThumb from "@/components/event/EventThumb";
import {
  ArrowRightIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ClockIcon,
  PinIcon,
  SearchIcon,
} from "@/components/Icons";

const TABS = [
  { id: "weekend" as const, label: "This weekend" },
  { id: "all" as const, label: "All events" },
];
type TabId = (typeof TABS)[number]["id"];

function LiveMusicCard({
  event,
  className = "",
}: {
  event: WeekendEvent;
  className?: string;
}) {
  const { user, openAuthModal } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const venueLine = [event.venue, event.city].filter(Boolean).join(", ");

  const toggleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (saving) return;
      if (!user) {
        window.alert("Please login to bookmark events.");
        openAuthModal("login");
        return;
      }
      const next = !saved;
      setSaved(next);
      setSaving(true);
      try {
        const res = await fetch("/api/user/saved-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            cityId: user.cityId,
            save: next,
          }),
        });
        if (!res.ok) {
          setSaved(!next);
          window.alert("Could not update saved events.");
        }
      } catch {
        setSaved(!next);
        window.alert("Could not update saved events.");
      } finally {
        setSaving(false);
      }
    },
    [user, saved, saving, event.id, openAuthModal],
  );

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`relative ml-3 flex gap-3.5 rounded-[18px] border border-white/10 bg-black/45 py-3 pr-3 pl-5 no-underline backdrop-blur-md transition hover:bg-black/55 lg:ml-4 lg:gap-4 lg:rounded-[20px] lg:py-3.5 lg:pr-3.5 lg:pl-6 ${className}`}
    >
      <div className="flex w-10 shrink-0 flex-col items-center justify-center text-center lg:w-11">
        <div className="text-[10px] font-semibold tracking-[0.08em] text-white/55 uppercase lg:text-[11px]">
          {event.weekday || "—"}
        </div>
        <div className="mt-0.5 text-[22px] leading-none font-bold text-white lg:text-[26px]">
          {event.day || "–"}
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-white/55 uppercase lg:text-[11px]">
          {event.month || ""}
        </div>
      </div>

      <EventThumb src={event.image} variant="live" onDark />

      <div className="min-w-0 flex-1 pr-7">
        <div
          className="line-clamp-2 font-bold text-white"
          style={{
            fontSize: "var(--text-title)",
            lineHeight: "var(--leading-title)",
          }}
        >
          {event.title}
        </div>
        {event.timeLabel ? (
          <div
            className="mt-1.5 flex items-center gap-1.5 text-white/60"
            style={{ fontSize: "var(--text-meta)" }}
          >
            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.timeLabel}</span>
          </div>
        ) : null}
        {venueLine ? (
          <div
            className="mt-1 flex items-center gap-1.5 text-white/60"
            style={{ fontSize: "var(--text-meta)" }}
          >
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{venueLine}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={toggleSave}
        disabled={saving}
        aria-label={saved ? "Remove bookmark" : "Bookmark event"}
        aria-pressed={saved}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
      >
        <BookmarkIcon className="h-[17px] w-[17px]" filled={saved} />
      </button>
    </Link>
  );
}

const HOME_PAGE_SIZE = 5;

function chunkEvents<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function HomeEventsCarousel({ events }: { events: WeekendEvent[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pages = chunkEvents(events, HOME_PAGE_SIZE);

  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [events]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const slides = Array.from(scroller.children) as HTMLElement[];
      if (slides.length === 0) return;
      const centre = scroller.scrollLeft + scroller.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((slide, i) => {
        const mid = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(mid - centre);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [pages.length]);

  const scrollToIndex = (index: number) => {
    const slide = scrollerRef.current?.children[index] as
      | HTMLElement
      | undefined;
    slide?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 lg:-mx-8 lg:px-8"
      >
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="flex w-full shrink-0 snap-start flex-col gap-3 pr-3 lg:gap-3.5 lg:pr-4"
          >
            {page.map((event) => (
              <LiveMusicCard key={event.id} event={event} />
            ))}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div
          className="mt-4 flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Event pages"
        >
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show page ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  thisWeekend: WeekendEvent[];
  all: WeekendEvent[];
  /**
   * `page` — standalone /live-music screen with back + search.
   * `home` — landing-page section (no back/search), capped list + See all.
   */
  variant?: "page" | "home";
};

export default function LiveMusicSection({
  thisWeekend,
  all,
  variant = "page",
}: Props) {
  const [tab, setTab] = useState<TabId>("weekend");
  const events = tab === "weekend" ? thisWeekend : all;
  const isPage = variant === "page";

  return (
    <section
      className={`relative isolate overflow-hidden text-white ${
        isPage ? "min-h-screen" : "min-h-[72vh] lg:min-h-[78vh]"
      }`}
    >
      {/* Black canvas + blurred mint/sky aurora */}
      <div className="live-music-aurora -z-10" aria-hidden>
        <span className="live-music-aurora__glow live-music-aurora__glow--a" />
        <span className="live-music-aurora__glow live-music-aurora__glow--b" />
        <span className="live-music-aurora__glow live-music-aurora__glow--c" />
        <span className="live-music-aurora__veil" />
      </div>

      <header className="relative">
        <div
          className={`relative z-10 mx-auto max-w-[720px] px-5 lg:px-8 ${
            isPage
              ? "pt-3 pb-2 lg:pt-4 lg:pb-2.5"
              : "pt-16 pb-3 lg:pt-24 lg:pb-4"
          }`}
        >
          {isPage ? (
            <div className="flex items-center justify-between">
              <Link
                href="/"
                aria-label="Back"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md no-underline ring-1 ring-white/15"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>
              <button
                type="button"
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md ring-1 ring-white/15"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <div className={isPage ? "mt-5 lg:mt-6" : ""}>
            {isPage ? (
              <h1 className="text-[26px] leading-[1.08] font-bold tracking-[-0.03em] text-white lg:text-[34px]">
                Live Music &amp; Parties
              </h1>
            ) : (
              <h2 className="text-[26px] leading-[1.08] font-bold tracking-[-0.03em] text-white lg:text-[34px]">
                Live Music &amp; Parties
              </h2>
            )}
            <p className="mt-2 max-w-[28rem] text-[14px] leading-[1.45] text-white/70 lg:text-[15px]">
              Stages, sets, and late nights across Ludhiana.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 lg:mt-7">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                    active
                      ? "bg-white text-ink"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto mt-5 max-w-[720px] px-5 pb-14 lg:mt-6 lg:px-8 lg:pb-20">
        {events.length === 0 ? (
          <div className="rounded-[18px] border border-white/10 px-5 py-14 text-center">
            <div className="text-lg font-semibold text-white">
              Nothing listed yet
            </div>
            <div className="mx-auto mt-2 max-w-[320px] text-[13px] leading-[1.6] text-white/55">
              New music &amp; party events go up regularly — check back soon.
            </div>
          </div>
        ) : variant === "home" ? (
          <HomeEventsCarousel events={events} />
        ) : (
          <div className="flex flex-col gap-3 lg:gap-3.5">
            {events.map((event) => (
              <LiveMusicCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {variant === "home" ? (
          <div className="mt-9 flex justify-center lg:mt-10">
            <Link
              href="/live-music"
              className="group inline-flex items-center gap-2 rounded-full bg-white/20 px-7 py-3 text-[14px] font-semibold tracking-[0.01em] text-white no-underline ring-1 ring-white/40 backdrop-blur-md transition hover:bg-white/28 lg:px-8 lg:py-3.5 lg:text-[15px]"
            >
              See all
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
