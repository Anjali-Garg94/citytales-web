import type { Metadata } from "next";
import ExploreEventsClient from "@/components/explore/ExploreEventsClient";
import PageShell from "@/components/PageShell";
import {
  getEventCategories,
  getEventsByCategory,
  getMonthSectionEvents,
} from "@/lib/api";
import { categoryCoverImage } from "@/lib/category-images";

export const metadata: Metadata = {
  title: "Discover events | CityTales",
  description: "Browse events in Ludhiana by category and week.",
};

type SectionFrom = "this-week" | "next-week" | "later";

const SECTION_BY_FROM: Record<
  SectionFrom,
  { key: string; heading: string; backHref: string }
> = {
  "this-week": {
    key: "THIS_WEEK",
    heading: "This Week",
    backHref: "/#home-this-week",
  },
  "next-week": {
    key: "NEXT_WEEK",
    heading: "Next week",
    backHref: "/#home-next-week",
  },
  later: {
    key: "AFTER_NEXT_WEEK",
    heading: "Later this month",
    backHref: "/#home-later",
  },
};

/**
 * Discover events — categories on top + feed.
 *
 * `?from=this-week|next-week|later` — section key (+ optional categoryId)
 * `?category=<id>` alone (Pick your Vibe / chip) — GET /event/category/{id}
 * Menu Discover with no params — THIS_WEEK
 */
export default async function ExploreEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; category?: string }>;
}) {
  const { from, category: categoryParam } = await searchParams;

  const categories = await getEventCategories();
  const selectedCategory = categoryParam
    ? categories.find((c) => c.id === categoryParam)
    : undefined;
  const categoryId = selectedCategory?.id;

  const sectionFrom =
    from && from in SECTION_BY_FROM
      ? SECTION_BY_FROM[from as SectionFrom]
      : null;

  const heading = sectionFrom
    ? sectionFrom.heading
    : selectedCategory
      ? selectedCategory.name
      : "Discover events";

  const backHref = sectionFrom
    ? sectionFrom.backHref
    : categoryId
      ? "/#home-pick-vibe"
      : "/";

  // Home / Discover category pick → dedicated category endpoint.
  // Week CTAs keep the section API (optionally filtered by category).
  const events = categoryId && !sectionFrom
    ? await getEventsByCategory(categoryId, 60)
    : await getMonthSectionEvents(
        sectionFrom?.key ?? "THIS_WEEK",
        60,
        categoryId,
      );

  const tiles = categories.map((c) => ({
    id: c.id,
    name: c.name,
    label: c.label,
    image: categoryCoverImage(c.name, c.imageUrl),
  }));

  return (
    <PageShell>
      <section className="py-6 lg:py-10">
        <ExploreEventsClient
          categories={tiles}
          events={events}
          heading={heading}
          backHref={backHref}
          initialCategoryId={categoryId ?? "all"}
          from={from}
        />
      </section>
    </PageShell>
  );
}
