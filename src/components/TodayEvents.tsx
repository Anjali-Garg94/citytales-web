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
        <div className="font-serif text-xl font-medium lg:text-[26px]">
          Happening Today
        </div>
      </RevealItem>

      <TodayEventsGrid events={todayEvents} />
    </section>
  );
}
