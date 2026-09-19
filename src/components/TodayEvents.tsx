import Image from "next/image";
import { getTodayEvents } from "@/lib/api";
import { ClockIcon } from "./Icons";

export default async function TodayEvents() {
  const todayEvents = await getTodayEvents();

  return (
    <div id="today">
      <div className="font-serif text-2xl font-semibold lg:text-[32px]">
        Today&#39;s events
      </div>

      {todayEvents.length === 0 ? (
        <div className="mt-[18px] rounded-[18px] border border-line px-5 py-10 text-center lg:mt-[26px] lg:py-14">
          <div className="font-serif text-lg font-semibold lg:text-xl">
            Nothing listed for today yet
          </div>
          <div className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-ink-soft lg:text-sm">
            New events go up through the day — check back, or browse what&#39;s
            on later this week.
          </div>
          <a
            href="/this-week"
            className="mt-4 inline-block text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
          >
            See this week →
          </a>
        </div>
      ) : (
        <div className="no-scrollbar mt-[18px] flex gap-4 overflow-x-auto pb-1.5 [scroll-snap-type:x_proximity] lg:mt-[26px] lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible">
          {todayEvents.map((event, i) => (
            <div
              key={`${event.title}-${i}`}
              className="min-w-[168px] [scroll-snap-align:start] lg:min-w-0"
            >
              <div className="mb-[9px] flex items-center gap-[5px] lg:mb-[11px] lg:gap-1.5">
                <ClockIcon className="h-3 w-3 text-accent lg:h-[13px] lg:w-[13px]" />
                <span className="text-[11px] font-semibold text-accent lg:text-xs">
                  {event.time || "All day"}
                </span>
              </div>
              <div className="relative aspect-square w-[168px] overflow-hidden rounded-[18px] lg:w-full">
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 168px"
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5 rounded-full bg-white px-[11px] py-1 text-[9.5px] font-bold tracking-[0.03em] text-ink lg:top-[11px] lg:left-[11px] lg:px-3 lg:text-[10px]">
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
      )}
    </div>
  );
}
