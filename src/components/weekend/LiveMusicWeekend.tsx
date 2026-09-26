import { getMusicPartiesEvents } from "@/lib/api";
import LiveMusicWeekendClient from "./LiveMusicWeekendClient";

/**
 * Homepage Live Music & Parties section — dark hero + This week list.
 * "All events" deep-links to Discover with Browse all + Music & Parties.
 */
export default async function LiveMusicWeekend() {
  const thisWeekend = await getMusicPartiesEvents("THIS_WEEK");

  return <LiveMusicWeekendClient thisWeekend={thisWeekend} />;
}
