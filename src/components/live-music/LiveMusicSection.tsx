"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { WeekendEvent } from "@/lib/placeholder-month-data";
import { darkCategoryBadgeColors } from "@/lib/category-badge";
import { useAuth } from "@/components/auth/AuthContext";
import {
  ArrowRightIcon,
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

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LiveMusicCard({ event }: { event: WeekendEvent }) {
  const { user, openAuthModal } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const colors = darkCategoryBadgeColors(event.category);
  const venueLine = [event.venue, event.city].filter(Boolean).join(", ");

  const toggleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (saving) return;
      if (!user) {
        window.alert("Please login to save events.");
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
      className="relative flex gap-3.5 rounded-[18px] border border-white/10 bg-white/[0.06] p-3 no-underline backdrop-blur-sm transition hover:bg-white/[0.1] lg:gap-5 lg:rounded-[20px] lg:p-4"
    >
      <div className="flex w-10 shrink-0 flex-col items-center justify-center text-center lg:w-12">
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

      <div className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[12px] lg:h-[84px] lg:w-[104px] lg:rounded-[14px]">
        <Image
          src={event.image}
          alt=""
          fill
          sizes="104px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 pr-7">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.06em] uppercase"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {event.category}
        </span>
        <div className="mt-1.5 line-clamp-2 text-[15px] leading-[1.25] font-bold text-white lg:text-[17px]">
          {event.title}
        </div>
        {event.timeLabel ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-white/60 lg:text-[12.5px]">
            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.timeLabel}</span>
          </div>
        ) : null}
        {venueLine ? (
          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-white/60 lg:text-[12.5px]">
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{venueLine}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={toggleSave}
        disabled={saving}
        aria-label={saved ? "Remove from saved" : "Save event"}
        aria-pressed={saved}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[17px] w-[17px]"
          fill={saved ? "#FFFFFF" : "none"}
        >
          <path
            d="M12 20.5C12 20.5 4 15.8 4 9.9C4 7.2 6.1 5 8.7 5C10.1 5 11.3 5.7 12 6.8C12.7 5.7 13.9 5 15.3 5C17.9 5 20 7.2 20 9.9C20 15.8 12 20.5 12 20.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </Link>
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

const HOME_LIST_LIMIT = 5;

/**
 * Shared Live Music & Parties UI — dark hero + filter pills + date-led cards.
 */
export default function LiveMusicSection({
  thisWeekend,
  all,
  variant = "page",
}: Props) {
  const [tab, setTab] = useState<TabId>("weekend");
  const source = tab === "weekend" ? thisWeekend : all;
  const events =
    variant === "home" ? source.slice(0, HOME_LIST_LIMIT) : source;
  const isPage = variant === "page";

  return (
    <section
      className={`relative isolate overflow-hidden text-white ${
        isPage ? "min-h-screen" : ""
      }`}
    >
      {/* Full-section stage lights — no solid black fill */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/live-music/hero-stage-lights-v2.jpg"
          alt=""
          fill
          priority={isPage}
          sizes="100vw"
          className="object-cover object-[center_top]"
        />
      </div>

      <header className="relative">
        <div
          className={`relative z-10 mx-auto max-w-[720px] px-5 lg:px-8 ${
            isPage
              ? "min-h-[280px] pt-4 pb-3 lg:pt-6 lg:pb-4"
              : "min-h-[220px] pt-12 pb-3 lg:min-h-[260px] lg:pt-16 lg:pb-4"
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

          <div className={isPage ? "mt-10 lg:mt-14" : ""}>
            {isPage ? (
              <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-0.02em] text-white lg:text-[40px]">
                Live Music &amp; Parties
              </h1>
            ) : (
              <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-white lg:text-[36px]">
                Live Music &amp; Parties
              </h2>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                    active
                      ? "bg-white text-ink"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  }`}
                >
                  {t.label}
                  {t.id === "weekend" ? (
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto -mt-2 max-w-[720px] px-5 pb-12 lg:px-8 lg:pb-16">
        {events.length === 0 ? (
          <div className="rounded-[18px] border border-white/10 px-5 py-14 text-center">
            <div className="text-lg font-semibold text-white">
              Nothing listed yet
            </div>
            <div className="mx-auto mt-2 max-w-[320px] text-[13px] leading-[1.6] text-white/55">
              New music &amp; party events go up regularly — check back soon.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 lg:gap-3.5">
            {events.map((event) => (
              <LiveMusicCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {variant === "home" ? (
          <div className="mt-8 flex justify-center">
            <Link
              href="/live-music"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-[14px] font-semibold tracking-[0.01em] text-white no-underline shadow-none transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.96] hover:scale-[1.02] lg:px-8 lg:py-3.5 lg:text-[15px]"
            >
              {/* Liquid glass fill — brighter white */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-xl backdrop-saturate-150"
              />
              {/* Specular top highlight */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/55 to-transparent"
              />
              {/* Soft white rim — no black shadow */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_0_0_1px_rgba(255,255,255,0.2)]"
              />
              {/* Fluid sheen on hover */}
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="relative z-10">See all</span>
              <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
