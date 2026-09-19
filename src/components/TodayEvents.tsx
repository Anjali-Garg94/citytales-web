import { getTodayEvents } from "@/lib/api";
import RevealItem from "./motion/RevealItem";
import TodayEventsGrid from "./TodayEventsGrid";

export default async function TodayEvents() {
  const todayEvents = await getTodayEvents();

  return (
    <div id="today">
      <RevealItem inGroup={false}>
        <div className="font-serif text-2xl font-medium lg:text-[32px]">
          Happening Today
        </div>
      </RevealItem>

      {todayEvents.length === 0 ? (
        <RevealItem
          inGroup={false}
          className="mt-[18px] rounded-[18px] border border-line px-5 py-10 text-center lg:mt-[26px] lg:py-14"
        >
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
        </RevealItem>
      ) : (
        <TodayEventsGrid events={todayEvents} />
      )}
    </div>
  );
}
