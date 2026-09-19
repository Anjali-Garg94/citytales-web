import Image from "next/image";
import Link from "next/link";
import { eventGrid } from "@/lib/data";

/**
 * "Everything on" — a single continuously-scrolling row, right to left.
 *
 * The list is duplicated once so the track can loop seamlessly: animating
 * from translateX(0) to translateX(-50%) always lands on an identical copy
 * of the start, so the loop point is invisible.
 *
 * Card size matches Today's events (aspect-square, 168px / rounded-[18px]).
 */
export default function EverythingOnMarquee() {
  const track = [...eventGrid, ...eventGrid];

  return (
    <section className="overflow-hidden border-t border-line py-9 lg:py-12">
      <div className="mb-5 flex items-baseline justify-between px-5 lg:mx-auto lg:mb-[26px] lg:max-w-[1280px] lg:px-20">
        <div className="font-serif text-[26px] font-semibold lg:text-[34px]">
          Everything on
        </div>
        <Link
          href="/events"
          className="text-xs font-semibold tracking-[0.04em] text-accent no-underline lg:text-[13px]"
        >
          See all events →
        </Link>
      </div>

      <div
        className="flex w-max gap-4 [--dur:34s] animate-marquee-left lg:gap-6 lg:[--dur:40s]"
        style={{ animationDuration: "var(--dur)" }}
      >
        {track.map((event, i) => (
          <div key={`${event.title}-${i}`} className="w-[168px] shrink-0 lg:w-[200px]">
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
            <div className="mt-2.5 font-serif text-[15px] font-semibold leading-[1.25] lg:mt-[11px] lg:text-base">
              {event.title}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-soft lg:mt-[5px] lg:text-xs">
              {event.venue}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
