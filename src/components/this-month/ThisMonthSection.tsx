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
 * category taxonomy in parallel, and hands them to the client component,
 * which owns the category-filter interactivity.
 *
 *   THIS_WEEK        -> This week (grid)
 *   NEXT_WEEK        -> Next week (list)
 *   AFTER_NEXT_WEEK  -> Later this month (list)
 *
 * The chip list comes from the category API rather than being derived from
 * whichever events happen to be in these three windows, so a category with
 * nothing on right now still shows up as a chip.
 */
export default async function ThisMonthSection() {
  const [thisWeek, nextUp, later, eventCategories] = await Promise.all([
    getMonthSectionEvents("THIS_WEEK", 20),
    getMonthSectionEvents("NEXT_WEEK", 20),
    getMonthSectionEvents("AFTER_NEXT_WEEK", 20),
    getEventCategories(),
  ]);

  // Title case for chips; filter compares case-insensitively against event labels.
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
