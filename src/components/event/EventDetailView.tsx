"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventDetail } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import EventBottomSheet from "@/components/event/EventBottomSheet";
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CloseIcon,
  GalleryIcon,
  InstagramIcon,
  PhoneIcon,
  PinIcon,
  ShareIcon,
} from "@/components/Icons";

const ABOUT_PREVIEW_CHARS = 120;
const SAVE_TIP_KEY = "ct_saved_events_tip_seen";

function isPhoneBookingValue(value: string): boolean {
  const raw = String(value ?? "").trim();
  if (!raw || /[a-z]/i.test(raw)) return false;
  return (raw.match(/\d/g) || []).length >= 7;
}

function bookingSubtitle(value: string): string {
  if (isPhoneBookingValue(value)) return value;
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(withScheme).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function bookingHref(value: string): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  if (isPhoneBookingValue(raw)) {
    const digits = raw.replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : undefined;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isInstagramLabel(label: string): boolean {
  return /^insta(gram)?$/i.test(label.trim());
}

/** "@name", "name", or "instagram.com/name/..." -> "name" */
function instagramHandle(value: string): string {
  const raw = value.trim();
  const fromUrl = raw.match(/instagram\.com\/([^/?#]+)/i);
  return (fromUrl ? fromUrl[1] : raw).replace(/^@/, "");
}

export default function EventDetailView({
  event,
  bookingLocked = false,
}: {
  event: EventDetail;
  /** Event has booking options but the visitor is logged out — options were withheld server-side. */
  bookingLocked?: boolean;
}) {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveTip, setShowSaveTip] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const savingRef = useRef(false);

  const aboutNeedsMore = event.description.length > ABOUT_PREVIEW_CHARS;
  const aboutText = useMemo(() => {
    if (!event.description) return "";
    if (aboutOpen || !aboutNeedsMore) return event.description;
    return `${event.description.slice(0, ABOUT_PREVIEW_CHARS).trimEnd()}…`;
  }, [aboutOpen, aboutNeedsMore, event.description]);

  // Load whether this event is already saved for the logged-in user.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSaved(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const cityId = user.cityId || event.cityId;
        const res = await fetch(
          `/api/user/saved-events?cityId=${encodeURIComponent(cityId)}&page=0&size=100`,
          { cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { eventIds?: string[] };
        if (!cancelled) {
          setSaved((data.eventIds ?? []).includes(event.id));
        }
      } catch {
        // Leave current icon state alone on a soft failure.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, event.id, event.cityId]);

  useEffect(() => {
    if (!galleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryOpen]);

  const toggleSave = useCallback(async () => {
    if (savingRef.current) return;

    if (!user) {
      window.alert("Please log in or sign up to save events.");
      openAuthModal();
      return;
    }

    const next = !saved;
    savingRef.current = true;
    setSaving(true);
    // Optimistic — roll back if the server rejects.
    setSaved(next);

    try {
      const res = await fetch("/api/user/saved-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          cityId: user.cityId || event.cityId,
          save: next,
        }),
      });

      if (!res.ok) {
        setSaved(!next);
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        window.alert(data?.message || "Could not update saved events.");
        return;
      }

      if (next) {
        try {
          if (!localStorage.getItem(SAVE_TIP_KEY)) {
            localStorage.setItem(SAVE_TIP_KEY, "1");
            setShowSaveTip(true);
          }
        } catch {
          // localStorage blocked — skip tip.
        }
      }
    } catch {
      setSaved(!next);
      window.alert("Could not update saved events.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [user, saved, event.id, event.cityId, openAuthModal]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // User cancelled share / clipboard unavailable — ignore.
    }
  }

  function trackBookingClick(optionId: string) {
    // Fire-and-forget — never await; a dropped count must not block booking.
    void fetch(
      `/api/events/${encodeURIComponent(event.id)}/booking/${encodeURIComponent(optionId)}/click`,
      { method: "POST" },
    ).catch(() => {});
  }

  const singleSchedule = event.schedule.length === 1 ? event.schedule[0] : null;

  const { bookingLinks, bookingCards } = useMemo(() => {
    const links: { id: string; label: string; href: string }[] = [];
    const cards: {
      id: string;
      kind: "phone" | "instagram";
      title: string;
      subtitle: string;
      href: string;
    }[] = [];

    for (const opt of event.bookingOptions) {
      if (isInstagramLabel(opt.label)) {
        const handle = instagramHandle(opt.value);
        if (!handle) continue;
        cards.push({
          id: opt.id,
          kind: "instagram",
          title: "Follow on Instagram",
          subtitle: "",
          href: /instagram\.com/i.test(opt.value)
            ? (bookingHref(opt.value) ?? "")
            : `https://instagram.com/${encodeURIComponent(handle)}`,
        });
        continue;
      }

      const href = bookingHref(opt.value);
      if (!href) continue;

      if (isPhoneBookingValue(opt.value)) {
        cards.push({
          id: opt.id,
          kind: "phone",
          title: opt.label,
          subtitle: bookingSubtitle(opt.value),
          href,
        });
      } else {
        links.push({
          id: opt.id,
          label: /^book\s*my\s*show$/i.test(opt.label.trim())
            ? "Book on BookMyShow"
            : opt.label,
          href,
        });
      }
    }

    return { bookingLinks: links, bookingCards: cards };
  }, [event.bookingOptions]);

  return (
    <article className="pb-16 lg:pb-24">
      <div className="mx-auto max-w-[720px] px-4 pt-3 lg:px-6 lg:pt-5">
        {/* Cover: 93% wide, tall portrait crop (capped on desktop), 24px radius */}
        <div className="relative mx-auto h-[52vh] max-h-[600px] min-h-[320px] w-[93%] overflow-hidden rounded-[24px] border border-white/25 lg:h-[58vh] lg:max-h-[680px]">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            aria-label="View full picture"
            className="absolute inset-0 cursor-zoom-in"
          >
            <Image
              src={event.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 720px) 670px, 93vw"
              className="object-cover"
            />
          </button>

          {event.gallery.length > 1 ? (
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm lg:right-4 lg:bottom-4 lg:px-3 lg:text-[13px]"
            >
              <GalleryIcon className="h-3.5 w-3.5" />
              View all
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-5 pt-5 lg:px-6 lg:pt-7">
        {/* Title + actions */}
        <div className="relative flex items-start gap-3">
          <h1 className="min-w-0 flex-1 text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-ink lg:text-[36px]">
            {event.title}
          </h1>
          <div className="flex shrink-0 gap-2 pt-1">
            <button
              type="button"
              onClick={toggleSave}
              disabled={saving}
              aria-label={saved ? "Remove bookmark" : "Bookmark event"}
              aria-pressed={saved}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink disabled:opacity-60 lg:h-11 lg:w-11"
            >
              <BookmarkIcon
                className="h-[18px] w-[18px]"
                filled={saved}
              />
            </button>
            <button
              type="button"
              onClick={share}
              aria-label="Share event"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink lg:h-11 lg:w-11"
            >
              <ShareIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          {showSaveTip ? (
            <div className="absolute top-12 right-0 z-20 w-[220px] rounded-2xl bg-ink px-3.5 py-3 text-[12px] leading-[1.45] text-white shadow-[0_12px_28px_rgba(30,26,22,0.28)]">
              Bookmarked! Find your saved events from your profile later.
              <button
                type="button"
                onClick={() => setShowSaveTip(false)}
                className="mt-2 block text-[12px] font-semibold text-accent-tint"
              >
                Got it
              </button>
            </div>
          ) : null}
        </div>

        {/* When + where */}
        <div className="mt-6 flex flex-col gap-5 lg:mt-8 lg:gap-6">
          {event.whenLabel ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="flex gap-3.5 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line text-accent lg:h-12 lg:w-12">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="text-[15px] leading-[1.35] font-semibold text-ink lg:text-[16px]">
                  {event.whenLabel}
                </div>
                <div className="mt-1 text-[13px] text-ink-soft lg:text-[14px]">
                  View full schedule &amp; timeline
                </div>
              </div>
            </button>
          ) : null}

          {event.venueLine || event.city ? (
            <button
              type="button"
              onClick={() => setVenueOpen(true)}
              className="flex gap-3.5 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line text-accent lg:h-12 lg:w-12">
                <PinIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                {event.venueLine ? (
                  <div className="text-[15px] leading-[1.35] font-semibold text-ink lg:text-[16px]">
                    {event.venueLine}
                  </div>
                ) : null}
                {event.city ? (
                  <div className="mt-0.5 text-[15px] text-ink lg:text-[16px]">
                    {event.city}
                  </div>
                ) : null}
              </div>
            </button>
          ) : null}
        </div>

        {bookingLocked ? (
          <div className="mt-9 flex justify-center lg:mt-11">
            <button
              type="button"
              onClick={openAuthModal}
              className="cta-pill cta-pill--hero"
            >
              Book Now
            </button>
          </div>
        ) : null}

        {/* Booking — only when options exist */}
        {bookingLinks.length > 0 || bookingCards.length > 0 ? (
          <section className="mt-9 lg:mt-11">
            {bookingCards.some((c) => c.kind === "phone") ? (
              <p className="mb-3 text-[15px] leading-[1.4] font-semibold text-ink lg:text-[17px]">
                Contact the organizers directly
              </p>
            ) : null}
            <div className="flex flex-col gap-2.5 rounded-[18px] bg-[#FBEDEF] p-3 lg:gap-3 lg:rounded-[22px] lg:p-5">
              {bookingLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBookingClick(link.id)}
                  className="flex h-12 min-w-0 items-center gap-3 rounded-[14px] bg-[#9B2C4B] px-4 text-white no-underline transition hover:bg-[#7E2140] lg:h-14 lg:px-5"
                >
                  <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold lg:text-[16px]">
                    {link.label}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 lg:h-[18px] lg:w-[18px]" />
                </a>
              ))}

              {bookingCards.length > 0 ? (
                <div
                  className={`grid gap-2.5 lg:gap-3 ${
                    bookingCards.length === 1
                      ? "grid-cols-1"
                      : bookingCards.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {bookingCards.map((card) => (
                    <a
                      key={card.id}
                      href={card.href}
                      onClick={() => trackBookingClick(card.id)}
                      {...(card.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex min-w-0 items-center gap-2 rounded-[14px] bg-white p-2.5 no-underline shadow-[0_1px_2px_rgba(30,26,22,0.04)] transition hover:shadow-[0_4px_14px_rgba(155,44,75,0.12)] lg:gap-3 lg:p-3.5"
                    >
                      {card.kind === "instagram" ? (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_110%,#FDD674_0%,#F77737_25%,#E1306C_50%,#C13584_72%,#833AB4_100%)] text-white lg:h-9 lg:w-9">
                          <InstagramIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBE1E7] text-[#9B2C4B] lg:h-9 lg:w-9">
                          <PhoneIcon className="h-[15px] w-[15px] lg:h-4 lg:w-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] leading-[1.25] font-semibold break-words text-ink lg:text-[14.5px]">
                          {card.title}
                        </span>
                        {card.subtitle ? (
                          <span className="mt-0.5 block truncate text-[11px] text-ink-soft lg:text-[13px]">
                            {card.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* About */}
        {event.description ? (
          <section className="mt-9 lg:mt-11">
            <h2 className="text-[20px] font-bold text-ink lg:text-[22px]">
              About Event
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.55] text-ink lg:text-[15px]">
              {aboutText}
            </p>
            {aboutNeedsMore ? (
              <button
                type="button"
                onClick={() => setAboutOpen((o) => !o)}
                className="mt-1.5 text-[14px] font-semibold text-accent hover:text-accent-deep"
              >
                {aboutOpen ? "Show less" : "Read more"}
              </button>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* Date & time sheet */}
      <EventBottomSheet
        open={scheduleOpen}
        title="Date & time"
        onClose={() => setScheduleOpen(false)}
      >
        {singleSchedule ? (
          <div className="pb-4">
            <div className="rounded-[18px] bg-[#F7F5F2] px-5 py-6 text-center">
              <div className="text-[22px] font-bold text-ink">
                {singleSchedule.dateLabel}
              </div>
              {singleSchedule.timeLabel ? (
                <div className="mt-2 text-[15px] text-ink-soft">
                  {singleSchedule.timeLabel}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 pb-4">
            {event.schedule.map((row, i) => (
              <li
                key={`${row.fullLabel}-${i}`}
                className="rounded-[14px] border border-[#E5E7EB] px-4 py-3.5"
              >
                <div className="text-[15px] font-semibold text-ink">
                  {row.dateLabel}
                </div>
                {row.timeLabel ? (
                  <div className="mt-1 text-[13px] text-ink-soft">
                    {row.timeLabel}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </EventBottomSheet>

      {/* Venue sheet — same shell as Date & time */}
      <EventBottomSheet
        open={venueOpen}
        title="Venue"
        onClose={() => setVenueOpen(false)}
      >
        <div className="pb-4">
          {event.venueLine ? (
            <div className="text-[17px] font-bold text-ink">{event.venueLine}</div>
          ) : null}
          {event.city ? (
            <div className="mt-1 text-[15px] text-ink-soft">{event.city}</div>
          ) : null}
          {event.venueAddress ? (
            <p className="mt-4 text-[14px] leading-[1.55] text-ink">
              {event.venueAddress}
            </p>
          ) : null}
          {event.venueFurtherInstructions ? (
            <p className="mt-3 text-[13px] leading-[1.55] text-ink-soft">
              {event.venueFurtherInstructions}
            </p>
          ) : null}
        </div>
      </EventBottomSheet>

      {/* Gallery lightbox */}
      {galleryOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Event photos"
          className="fixed inset-0 z-50 flex flex-col bg-black/92"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-sm font-medium text-white">
              {event.gallery.length > 1 ? `${event.gallery.length} photos` : ""}
            </div>
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              aria-label="Close gallery"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-8">
            {event.gallery.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={`relative h-full shrink-0 snap-center overflow-hidden rounded-2xl ${
                  event.gallery.length > 1 ? "min-w-[85%]" : "min-w-full"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes={event.gallery.length > 1 ? "85vw" : "100vw"}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
