import { getEventCategories } from "@/lib/api";
import { categoryCoverImage } from "@/lib/category-images";
import EventCategoriesGrid, { type CategoryTile } from "./EventCategoriesGrid";
import RevealItem from "./motion/RevealItem";

/**
 * "Pick your Vibe" — photo tiles, two per row.
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
    image: categoryCoverImage(category.name, category.imageUrl),
  }));

  return (
    <section
      id="home-pick-vibe"
      className="scroll-mt-24 px-4 pt-9 pb-11 lg:mx-auto lg:max-w-[1280px] lg:px-10 lg:pt-12 lg:pb-14"
    >
      <RevealItem inGroup={false}>
        <div className="font-serif text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink lg:text-[26px] lg:leading-[1.1]">
          Pick your Vibe
        </div>
      </RevealItem>

      <EventCategoriesGrid tiles={tiles} />
    </section>
  );
}
