import Image from "next/image";
import Link from "next/link";
import { getEventCategories } from "@/lib/api";

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

  return (
    <section className="border-t border-line px-4 pt-9 pb-11 lg:mx-auto lg:max-w-[1280px] lg:px-10 lg:pt-12 lg:pb-14">
      <div className="font-serif text-2xl font-semibold lg:text-[32px]">
        What are you in the mood for?
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3.5 lg:mt-7 lg:grid-cols-4 lg:gap-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/events?category=${encodeURIComponent(category.label)}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-[8px] no-underline lg:rounded-[10px]"
          >
            <Image
              src={CATEGORY_IMAGE_OVERRIDES[category.name] ?? category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[rgba(14,11,10,0.82)] from-4% via-[rgba(14,11,10,0.28)] via-42% to-transparent" />

            <div className="absolute right-0 bottom-0 left-0 p-3.5 lg:p-4">
              <div className="font-serif text-[16px] leading-[1.15] font-semibold text-white lg:text-[18px]">
                {category.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
