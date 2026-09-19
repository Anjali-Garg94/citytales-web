import { getMusicPartiesEvents } from "@/lib/api";
import LiveMusicWeekendClient from "./LiveMusicWeekendClient";

/**
 * The one dark band on an otherwise light page — the night-out section gets a
 * black ground so it reads as a mood shift rather than another white block.
 *
 * Server wrapper: fetches the This weekend (THIS_WEEK) and All (ALL) tabs in
 * parallel, both filtered to the Music & Parties category, and hands them to
 * the client component, which owns the tab toggle.
 */
export default async function LiveMusicWeekend() {
  const [thisWeekend, all] = await Promise.all([
    getMusicPartiesEvents("THIS_WEEK"),
    getMusicPartiesEvents("ALL"),
  ]);

  return <LiveMusicWeekendClient thisWeekend={thisWeekend} all={all} />;
}
