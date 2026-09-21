import type { Metadata } from "next";
import Link from "next/link";
import EventDetailView from "@/components/event/EventDetailView";
import Footer from "@/components/Footer";
import { getEventById } from "@/lib/api";

/**
 * Event detail — GET /api/v1/event/{id}.
 *
 * The route param is named `slug` for historical reasons; live cards pass the
 * backend event id (see getMonthSectionEvents / getMusicPartiesEvents).
 */
export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventById(slug);
  if (!event) return { title: "Event not found | CityTales" };
  return {
    title: `${event.title} | CityTales`,
    description: event.description || event.whenLabel || undefined,
  };
}

export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventById(slug);

  return (
    <>
      <main className="flex-1 bg-bg">
        {event ? (
          <EventDetailView event={event} />
        ) : (
          <section className="flex min-h-[50vh] flex-col justify-center px-5 py-20 text-center lg:px-20 lg:py-32">
            <h1 className="mx-auto max-w-[560px] text-[32px] leading-[1.15] font-semibold text-ink lg:text-[44px]">
              Event not found
            </h1>
            <p className="mx-auto mt-4 max-w-[420px] text-sm leading-[1.6] text-ink-soft lg:text-base">
              This listing may have ended or moved.
            </p>
            <Link
              href="/"
              className="mx-auto mt-7 w-fit text-[13px] font-semibold tracking-[0.03em] text-accent no-underline hover:text-accent-deep"
            >
              ← Back to home
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
