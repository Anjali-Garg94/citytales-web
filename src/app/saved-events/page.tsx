import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import SavedEventsClient from "@/components/saved/SavedEventsClient";

export const metadata: Metadata = {
  title: "Saved Events | CityTales",
};

export default function SavedEventsPage() {
  return (
    <PageShell>
      <section className="-mt-2 px-5 pt-0 pb-6 lg:mx-auto lg:max-w-[720px] lg:-mt-3 lg:px-8 lg:pb-8">
        <h1 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-ink lg:text-[26px]">
          Saved Events
        </h1>
        <SavedEventsClient />
      </section>
    </PageShell>
  );
}
