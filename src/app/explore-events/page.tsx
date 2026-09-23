import type { Metadata } from "next";
import ExploreEventsClient from "@/components/explore/ExploreEventsClient";
import PageShell from "@/components/PageShell";
import { getEventCategories, getMonthSectionEvents } from "@/lib/api";
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
 * Discover events — categories on top + section feed.
 *
 * `?from=this-week|next-week|later` — section key + heading
 * `?category=<id>` — filters via categoryId on the section API; chip selected
 * Pick your Vibe (category only) uses key ALL.
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

  // Section CTA → that week's key. Category from vibe tiles → ALL.
  // Menu Discover with no category → THIS_WEEK.
  const sectionKey = sectionFrom
    ? sectionFrom.key
    : categoryId
      ? "ALL"
      : "THIS_WEEK";

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

  const events = await getMonthSectionEvents(sectionKey, 60, categoryId);

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
