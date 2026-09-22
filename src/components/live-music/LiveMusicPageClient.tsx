"use client";

import type { WeekendEvent } from "@/lib/placeholder-month-data";
import LiveMusicSection from "@/components/live-music/LiveMusicSection";

/** Standalone /live-music screen — includes back + search in the hero. */
export default function LiveMusicPageClient({
  thisWeekend,
  all,
}: {
  thisWeekend: WeekendEvent[];
  all: WeekendEvent[];
}) {
  return (
    <LiveMusicSection
      thisWeekend={thisWeekend}
      all={all}
      variant="page"
    />
  );
}
