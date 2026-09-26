import Image from "next/image";
import Link from "next/link";
import { getBrowseAllEvents } from "@/lib/api";
import RevealGroup from "./motion/RevealGroup";
import RevealItem from "./motion/RevealItem";

/**
 * "Everything on" — a single continuously-scrolling row, right to left.
 *
 * Events come from the same POST /api/v1/event/filter/v2 catalogue as
 * Start exploring / Browse all (all categories).
 *
 * The list is duplicated once so the track can loop seamlessly: animating
 * from translateX(0) to translateX(-50%) always lands on an identical copy
 * of the start, so the loop point is invisible.
 */
export default async function EverythingOnMarquee() {
  const events = await getBrowseAllEvents(20);

  if (events.length === 0) return null;

  const track = [...events, ...events];

  return (
    <section className="overflow-hidden py-9 lg:py-12">
      <RevealGroup
        className="mb-5 flex items-baseline justify-between px-5 lg:mx-auto lg:mb-[26px] lg:max-w-[1280px] lg:px-20"
        stagger={0.08}
      >
        <RevealItem>
          <div className="font-serif text-lg font-medium lg:text-[22px]">
            Everything on
          </div>
        </RevealItem>
        <RevealItem>
          <Link
            href="/explore-events?when=all&from=home"
            className="text-xs font-semibold tracking-[0.04em] text-accent no-underline lg:text-[13px]"
          >
            Browse all →
          </Link>
        </RevealItem>
      </RevealGroup>

      {/* Spacing is a margin per card rather than `gap` on the track — see the
          note in OrganisersMarquee: `gap` leaves the two-copy track half a gap
          short of twice one copy, so -50% lands off the seam and the loop
          jerks. A trailing margin on every card makes it exact. */}
      <div
        className="flex w-max [--dur:52s] animate-marquee-left lg:[--dur:60s]"
        style={{ animationDuration: "var(--dur)" }}
      >
        {track.map((event, i) => (
          <Link
            key={`${event.id}-${i}`}
            href={`/events/${event.slug}`}
            className="mr-4 w-[168px] shrink-0 no-underline lg:mr-6 lg:w-[200px]"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-[18px]">
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 200px, 168px"
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5 rounded-full bg-white px-[11px] py-1 text-[9.5px] font-bold tracking-[0.03em] text-ink uppercase lg:top-[11px] lg:left-[11px] lg:px-3 lg:text-[10px]">
                {event.category}
              </div>
            </div>
            <div className="mt-2.5 font-serif text-[15px] font-semibold leading-[1.25] text-ink lg:mt-[11px] lg:text-base">
              {event.title}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-soft lg:mt-[5px] lg:text-xs">
              {event.venue}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
