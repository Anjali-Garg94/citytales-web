import { getEventCategories, getMonthSectionEvents } from "@/lib/api";
import ThisMonthSectionClient from "./ThisMonthSectionClient";

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

/**
 * Server wrapper: fetches the three live "This Month" sections plus the full
 * category taxonomy, and hands them to the client.
 *
 *   THIS_WEEK        -> This week (grid)
 *   NEXT_WEEK        -> Next week (list)
 *   AFTER_NEXT_WEEK  -> Later this month (list)
 */
export default async function ThisMonthSection() {
  const [thisWeek, nextUp, later, eventCategories] = await Promise.all([
    getMonthSectionEvents("THIS_WEEK", 20, undefined, "recent"),
    getMonthSectionEvents("NEXT_WEEK", 20, undefined, "recent"),
    getMonthSectionEvents("AFTER_NEXT_WEEK", 20, undefined, "recent"),
    getEventCategories(),
  ]);

  const categories = [
    ...new Set(
      eventCategories.map((c) => toTitleCase(c.label.trim() || c.name)),
    ),
  ];

  return (
    <ThisMonthSectionClient
      thisWeek={thisWeek}
      nextUp={nextUp}
      later={later}
      categories={categories}
    />
  );
}
