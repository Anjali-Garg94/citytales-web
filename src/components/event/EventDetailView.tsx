"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { EventDetail } from "@/lib/api";
import {
  BookmarkIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GalleryIcon,
  PinIcon,
  ShareIcon,
} from "@/components/Icons";

const ABOUT_PREVIEW_CHARS = 120;

export default function EventDetailView({ event }: { event: EventDetail }) {
  const [saved, setSaved] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const aboutNeedsMore = event.description.length > ABOUT_PREVIEW_CHARS;
  const aboutText = useMemo(() => {
    if (!event.description) return "";
    if (aboutOpen || !aboutNeedsMore) return event.description;
    return `${event.description.slice(0, ABOUT_PREVIEW_CHARS).trimEnd()}…`;
  }, [aboutOpen, aboutNeedsMore, event.description]);

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

  function bookingHref(label: string, value: string): string | undefined {
    const digits = value.replace(/[^\d+]/g, "");
    if (/call/i.test(label) && digits) return `tel:${digits}`;
    if (/whats?app/i.test(label) && digits) {
      const n = digits.replace(/^\+/, "");
      return `https://wa.me/${n}`;
    }
    if (/http/i.test(value) || value.startsWith("www.")) {
      return value.startsWith("http") ? value : `https://${value}`;
    }
    return undefined;
  }

  return (
    <article className="pb-16 lg:pb-24">
      {/* Hero */}
      <div className="relative mx-auto max-w-[720px] px-4 pt-4 lg:px-6 lg:pt-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] lg:aspect-[16/10] lg:rounded-[28px]">
          <Image
            src={event.coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 720px) 720px, 100vw"
            className="object-cover"
          />

          <Link
            href="/"
            aria-label="Back"
            className="absolute top-3.5 left-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_4px_14px_rgba(30,26,22,0.12)] no-underline lg:top-4 lg:left-4 lg:h-11 lg:w-11"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>

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
        <div className="flex items-start gap-3">
          <h1 className="min-w-0 flex-1 text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-ink lg:text-[36px]">
            {event.title}
          </h1>
          <div className="flex shrink-0 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              aria-label={saved ? "Remove from saved" : "Save event"}
              aria-pressed={saved}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink lg:h-11 lg:w-11"
            >
              <BookmarkIcon
                className={`h-[18px] w-[18px] ${saved ? "fill-ink" : ""}`}
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
        </div>

        {/* When + where */}
        <div className="mt-6 flex flex-col gap-5 lg:mt-8 lg:gap-6">
          {event.whenLabel ? (
            <div className="flex gap-3.5">
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
            </div>
          ) : null}

          {event.venueLine || event.city ? (
            <div className="flex gap-3.5">
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
            </div>
          ) : null}
        </div>

        {/* Booking */}
        {event.bookingOptions.length > 0 ? (
          <section className="mt-9 lg:mt-11">
            <h2 className="text-[20px] font-bold text-ink lg:text-[22px]">
              Booking
            </h2>
            <div className="mt-3.5 flex flex-col gap-2.5">
              {event.bookingOptions.map((opt) => {
                const href = bookingHref(opt.label, opt.value);
                const inner = (
                  <>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-ink lg:text-[16px]">
                        {opt.label}
                      </div>
                      <div className="mt-0.5 truncate text-[13px] text-ink-soft lg:text-[14px]">
                        {opt.value}
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                  </>
                );

                const className =
                  "flex items-center justify-between gap-3 rounded-[14px] border border-line px-4 py-3.5 no-underline transition hover:border-ink lg:px-5 lg:py-4";

                return href ? (
                  <a
                    key={opt.id}
                    href={href}
                    className={className}
                    {...(href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={opt.id} className={className}>
                    {inner}
                  </div>
                );
              })}
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

      {/* Simple gallery lightbox */}
      {galleryOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Event photos"
          className="fixed inset-0 z-50 flex flex-col bg-black/92"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-sm font-medium text-white">
              {event.gallery.length} photos
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
                className="relative h-full min-w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="85vw"
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
