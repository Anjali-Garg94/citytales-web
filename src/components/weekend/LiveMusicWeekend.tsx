import { getMusicPartiesEvents } from "@/lib/api";
import LiveMusicWeekendClient from "./LiveMusicWeekendClient";

/**
 * Homepage Live Music & Parties section — dark hero + event list matching
 * the app mockup. Full browse lives at /live-music.
 *
 * Server wrapper: fetches This weekend + All in parallel, filtered to Music
 * & Parties, and hands them to the client for the tab toggle.
 */
export default async function LiveMusicWeekend() {
  const [thisWeekend, all] = await Promise.all([
    getMusicPartiesEvents("THIS_WEEK"),
    getMusicPartiesEvents("ALL"),
  ]);

  return <LiveMusicWeekendClient thisWeekend={thisWeekend} all={all} />;
}
