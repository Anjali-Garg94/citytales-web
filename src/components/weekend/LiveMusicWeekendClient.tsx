"use client";

import type { WeekendEvent } from "@/lib/placeholder-month-data";
import LiveMusicSection from "@/components/live-music/LiveMusicSection";

/**
 * Landing-page Live Music block — same dark design as /live-music, without
 * back/search chrome.
 */
export default function LiveMusicWeekendClient({
  thisWeekend,
}: {
  thisWeekend: WeekendEvent[];
}) {
  return (
    <LiveMusicSection thisWeekend={thisWeekend} variant="home" />
  );
}
