import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import SavedEventsClient, {
  SavedEventsBackButton,
} from "@/components/saved/SavedEventsClient";

export const metadata: Metadata = {
  title: "Saved Events | CityTales",
};

export default function SavedEventsPage() {
  return (
    <PageShell>
      <section className="px-5 py-8 lg:mx-auto lg:max-w-[720px] lg:px-8 lg:py-12">
        <div className="flex items-center gap-3">
          <SavedEventsBackButton />
          <h1 className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-ink lg:text-[26px]">
            Saved Events
          </h1>
        </div>
        <SavedEventsClient />
      </section>
    </PageShell>
  );
}
