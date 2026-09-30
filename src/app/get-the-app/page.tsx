import Link from "next/link";
import PageShell from "@/components/PageShell";
import { APP_STORE } from "@/lib/apps";

export default function GetTheAppPage() {
  return (
    <PageShell>
      <section className="flex min-h-[50vh] flex-col justify-center px-5 py-20 text-center lg:px-20 lg:py-32">
        <div className="mx-auto text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          Get the app
        </div>
        <h1 className="mx-auto mt-4 max-w-[560px] font-serif text-[32px] font-semibold leading-[1.15] text-ink lg:text-[44px]">
          {APP_STORE.name}
        </h1>
        <p className="mx-auto mt-4 max-w-[420px] text-sm leading-[1.6] text-ink-soft lg:text-base">
          Discover what&#39;s happening in your city, save events and book in a tap.
        </p>
        <div className="mx-auto mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={APP_STORE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink bg-ink px-6 py-3 text-[13px] font-semibold tracking-[0.03em] text-bg no-underline transition hover:bg-transparent hover:text-ink"
          >
            Download on the App Store
          </a>
          <span className="border border-line px-6 py-3 text-[13px] font-semibold tracking-[0.03em] text-ink-soft">
            Google Play · coming soon
          </span>
        </div>
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
