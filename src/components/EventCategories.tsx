import { getEventCategories } from "@/lib/api";
import EventCategoriesGrid, { type CategoryTile } from "./EventCategoriesGrid";
import RevealItem from "./motion/RevealItem";

/**
 * Hand-picked local photo for a specific category, used instead of whatever
 * the API currently returns for it. Keyed by the category's full `name`.
 */
const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  Exhibition: "/images/events/cat-exhibitions.jpg",
};

/**
 * "What are you in the mood for?" — photo tiles, two per row.
 *
 * Shows only the category's full `name`. The API also returns a short `label`,
 * but for most categories the two are identical ("Exhibition"/"Exhibition"), so
 * printing both read as a stutter.
 */
export default async function EventCategories() {
  const categories = await getEventCategories();

  // Resolved here rather than in the grid: the override lookup is server data,
  // and what crosses to the client should be plain serialisable tiles.
  const tiles: CategoryTile[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    label: category.label,
    image: CATEGORY_IMAGE_OVERRIDES[category.name] ?? category.imageUrl,
  }));

  return (
    <section className="px-4 pt-9 pb-11 lg:mx-auto lg:max-w-[1280px] lg:px-10 lg:pt-12 lg:pb-14">
      <RevealItem inGroup={false}>
        <div className="font-serif text-xl font-medium lg:text-[26px]">
          What are you in the mood for?
        </div>
      </RevealItem>

      <EventCategoriesGrid tiles={tiles} />
    </section>
  );
}
