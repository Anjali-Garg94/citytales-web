import PageShell from "@/components/PageShell";
import Link from "next/link";
import { placeholderAllMonthEvents } from "@/lib/placeholder-month-data";

/**
 * Placeholder event detail page.
 *
 * Resolves against the placeholder month data for now so the cards link
 * somewhere real during design review. Swap for an API lookup
 * (GET /api/v1/event/{id}) when the detail endpoint is wired up.
 */
export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = placeholderAllMonthEvents.find((e) => e.slug === slug);

  return (
    <PageShell>
      <section className="flex min-h-[50vh] flex-col justify-center px-5 py-20 text-center lg:px-20 lg:py-32">
        {event ? (
          <>
            <div className="mx-auto text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
              {event.category}
            </div>
            <h1 className="mx-auto mt-4 max-w-[560px] font-serif text-[32px] leading-[1.15] font-semibold text-ink lg:text-[44px]">
              {event.title}
            </h1>
            <p className="mx-auto mt-4 text-sm text-ink-soft lg:text-base">
              {event.venue} · {event.startTime}
              {event.endTime ? ` – ${event.endTime}` : ""}
            </p>
            <p className="mx-auto mt-6 max-w-[420px] text-sm leading-[1.6] text-ink-soft">
              Full event details are coming to this page once the event detail
              API is wired up.
            </p>
          </>
        ) : (
          <>
            <h1 className="mx-auto max-w-[560px] font-serif text-[32px] leading-[1.15] font-semibold text-ink lg:text-[44px]">
              Event not found
            </h1>
            <p className="mx-auto mt-4 max-w-[420px] text-sm leading-[1.6] text-ink-soft">
              This listing may have ended or moved.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mx-auto mt-7 w-fit text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
        >
          ← Back to home
        </Link>
      </section>
    </PageShell>
  );
}
