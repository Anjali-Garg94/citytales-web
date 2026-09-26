import type { Metadata } from "next";
import { getMusicPartiesEvents } from "@/lib/api";
import LiveMusicPageClient from "@/components/live-music/LiveMusicPageClient";

export const metadata: Metadata = {
  title: "Live Music & Parties | CityTales",
  description:
    "Great music. Better company. Only in Ludhiana — DJs, live bands, and club nights.",
};

/**
 * Full Live Music & Parties browse screen — dark theme matching the app
 * mockup. This week from the section API; All events goes to Discover.
 */
export default async function LiveMusicPage() {
  const thisWeekend = await getMusicPartiesEvents("THIS_WEEK", 40);

  return <LiveMusicPageClient thisWeekend={thisWeekend} />;
}
