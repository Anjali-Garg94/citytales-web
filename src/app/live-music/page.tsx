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
 * mockup. Data comes from the same Music & Parties section endpoint the
 * homepage carousel uses.
 */
export default async function LiveMusicPage() {
  const [thisWeekend, all] = await Promise.all([
    getMusicPartiesEvents("THIS_WEEK", 40),
    getMusicPartiesEvents("ALL", 40),
  ]);

  return <LiveMusicPageClient thisWeekend={thisWeekend} all={all} />;
}
