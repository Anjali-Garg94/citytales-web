import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import { APP_STORE, PLAY_STORE } from "@/lib/apps";

/**
 * The one link behind the app's QR code: https://citytales.in/get-the-app
 *
 *   app installed      → the OS hands this URL to the app (Universal Link / App Link — it is
 *                        listed in apple-app-site-association and the Android manifest), so
 *                        this page never loads.
 *   iPhone, no app     → redirected to the App Store.
 *   Android, no app    → redirected to Google Play.
 *   anything else      → this page, with both store buttons (desktop, iPad, bots).
 *
 * Reading the request headers makes the page render per request, which is what lets it
 * redirect by device.
 */
export default async function GetTheAppPage() {
  const ua = (await headers()).get("user-agent") ?? "";

  if (/iPhone|iPod/i.test(ua)) {
    redirect(APP_STORE.url);
  }
  if (/Android/i.test(ua) && PLAY_STORE.live) {
    redirect(PLAY_STORE.url);
  }

  const storeButton =
    "border border-ink bg-ink px-6 py-3 text-[13px] font-semibold tracking-[0.03em] text-bg no-underline transition hover:bg-transparent hover:text-ink";

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
            className={storeButton}
          >
            Download on the App Store
          </a>
          {PLAY_STORE.live ? (
            <a
              href={PLAY_STORE.url}
              target="_blank"
              rel="noopener noreferrer"
              className={storeButton}
            >
              Get it on Google Play
            </a>
          ) : (
            <span className="border border-line px-6 py-3 text-[13px] font-semibold tracking-[0.03em] text-ink-soft">
              Google Play · coming soon
            </span>
          )}
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
