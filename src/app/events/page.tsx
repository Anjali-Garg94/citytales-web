import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getEventCategories } from "@/lib/api";

/**
 * Category browse landing. Currently a placeholder that confirms the chosen
 * category — swap the body for a real listing once an events-by-category
 * endpoint exists.
 */
export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  const { category } = await searchParams;
  const selected = typeof category === "string" ? category : undefined;
  const categories = await getEventCategories();

  return (
    <PageShell>
      <section className="px-5 py-16 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:py-24">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          {selected ? selected : "Browse"}
        </div>
        <h1 className="mt-4 max-w-[560px] font-serif text-[32px] leading-[1.15] font-semibold text-ink lg:text-[44px]">
          {selected
            ? `${selected} events`
            : "Browse events"}
        </h1>
        <p className="mt-4 max-w-[440px] text-sm leading-[1.6] text-ink-soft lg:text-base">
          Listings for this section are on their way. In the meantime, pick
          another mood below.
        </p>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/events?category=${encodeURIComponent(c.label)}`}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium no-underline transition ${
                c.label === selected
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-10 inline-block text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
        >
          ← Back to home
        </Link>
      </section>
    </PageShell>
  );
}
