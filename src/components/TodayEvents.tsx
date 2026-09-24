import { getTodayEvents } from "@/lib/api";
import RevealItem from "./motion/RevealItem";
import TodayEventsGrid from "./TodayEventsGrid";

/**
 * Happening Today rail. Hidden entirely when the API returns no events —
 * no empty-state box, no heading, no section padding.
 */
export default async function TodayEvents() {
  const todayEvents = await getTodayEvents();

  if (todayEvents.length === 0) return null;

  return (
    <section
      id="today"
      className="px-5 pt-9 pb-4 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pt-12 lg:pb-6"
    >
      <RevealItem inGroup={false}>
        <div className="flex items-center gap-2.5">
          <span className="live-dot" aria-hidden />
          <div className="font-serif text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink lg:text-[26px] lg:leading-[1.1]">
            Happening Today
          </div>
        </div>
      </RevealItem>

      <TodayEventsGrid events={todayEvents} />
    </section>
  );
}
