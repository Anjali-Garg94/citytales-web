import Link from "next/link";
import { getSectionEvents } from "@/lib/api";
import { ArrowRightIcon } from "./Icons";
import ThisWeekGrid from "./ThisWeekGrid";

export default async function ThisWeek() {
  const events = await getSectionEvents("THIS_WEEK");

  return (
    <div>
      <div className="mt-7 flex items-baseline justify-between lg:mt-[52px]">
        <div className="font-serif text-2xl font-semibold lg:text-[32px]">
          This week
        </div>
        <Link
          href="/this-week"
          className="flex items-center gap-1 text-[12.5px] font-semibold text-accent no-underline lg:gap-1.5 lg:text-sm"
        >
          Show all
          <ArrowRightIcon className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-5 mb-11 rounded-[18px] border border-line px-5 py-10 text-center lg:mt-[30px] lg:mb-14 lg:py-14">
          <div className="font-serif text-lg font-semibold lg:text-xl">
            No events listed this week yet
          </div>
          <div className="mx-auto mt-2 max-w-[360px] text-[13px] leading-[1.6] text-ink-soft lg:text-sm">
            Organisers are still adding what&#39;s on. Check back soon — or list
            your own event.
          </div>
          <Link
            href="/for-organisers"
            className="mt-4 inline-block text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
          >
            Become an organiser →
          </Link>
        </div>
      ) : (
        <ThisWeekGrid events={events} />
      )}
    </div>
  );
}
