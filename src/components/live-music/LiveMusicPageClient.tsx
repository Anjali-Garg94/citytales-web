"use client";

import type { WeekendEvent } from "@/lib/placeholder-month-data";
import LiveMusicSection from "@/components/live-music/LiveMusicSection";

/** Standalone /live-music screen — includes back + search in the hero. */
export default function LiveMusicPageClient({
  thisWeekend,
}: {
  thisWeekend: WeekendEvent[];
}) {
  return <LiveMusicSection thisWeekend={thisWeekend} variant="page" />;
}
