import { getMonthSectionEvents } from "@/lib/api";
import ThisMonthSectionClient from "./ThisMonthSectionClient";

/**
 * Server wrapper: fetches the three live "This Month" sections in parallel
 * and hands them to the client component, which owns the category-filter
 * interactivity.
 *
 *   THIS_WEEK        -> This week (grid)
 *   NEXT_WEEK        -> Next week (list)
 *   AFTER_NEXT_WEEK  -> Later this month (list)
 */
export default async function ThisMonthSection() {
  const [thisWeek, nextUp, later] = await Promise.all([
    getMonthSectionEvents("THIS_WEEK", 20),
    getMonthSectionEvents("NEXT_WEEK", 20),
    getMonthSectionEvents("AFTER_NEXT_WEEK", 20),
  ]);

  return (
    <ThisMonthSectionClient thisWeek={thisWeek} nextUp={nextUp} later={later} />
  );
}
