"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import HeaderMobileMenu from "./HeaderMobileMenu";
import HeaderSearch from "./search/HeaderSearch";
import { navLinks } from "@/lib/data";

function isDiscoverEventsPath(pathname: string) {
  return pathname === "/explore-events" || pathname.startsWith("/explore-events/");
}

/** Matches Discover page headings for `?when=` / legacy `?from=`. */
function discoverHeaderLabel(
  when: string | null,
  from: string | null,
  category: string | null,
): string {
  const key = when || from;
  switch (key) {
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "weekend":
      return "Weekend";
    case "this-week":
      return "This week";
    case "next-week":
      return "Next week";
    case "later":
      return "Later";
    case "all":
      return "Discover events";
    default:
      // Vibe-only entry (`?category=` with no when) — keep a generic label;
      // the page h1 already shows the category name.
      if (category && !when && !from) return "Discover events";
      return "Discover events";
  }
}

function HeaderFallback() {
  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">
        City Tales
      </span>
      <div className="ml-auto h-10 w-24 lg:hidden" aria-hidden />
      <div className="hidden h-10 w-40 lg:block" aria-hidden />
    </header>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onDiscover = isDiscoverEventsPath(pathname);
  const discoverLabel = onDiscover
    ? discoverHeaderLabel(
        searchParams.get("when"),
        searchParams.get("from"),
        searchParams.get("category"),
      )
    : null;

  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      {/* Left: City Tales wordmark, or current Discover window label. */}
      {onDiscover ? (
        <span className="min-w-0 shrink truncate text-[15px] font-semibold tracking-[-0.015em] text-ink">
          {discoverLabel}
        </span>
      ) : (
        <Link href="/" className="flex shrink-0 items-center no-underline">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">
            City Tales
          </span>
        </Link>
      )}

      {/* Desktop nav */}
      <nav className="hidden gap-10 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[13px] font-semibold tracking-[0.03em] text-ink no-underline hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile: search + hamburger — ml-auto locks them to the right */}
      <div className="ml-auto flex shrink-0 items-center gap-4 lg:hidden">
        <HeaderSearch iconClassName="h-5 w-5 text-ink" />
        <HeaderMobileMenu />
      </div>

      {/* Desktop: search + CTA */}
      <div className="hidden items-center gap-[22px] lg:flex">
        <HeaderSearch iconClassName="h-[19px] w-[19px] text-ink" />
        <Link
          href="/get-the-app"
          className="border border-ink px-5 py-[9px] text-[12.5px] font-semibold tracking-[0.03em] text-ink no-underline hover:bg-ink hover:text-bg"
        >
          Get the app
        </Link>
      </div>
    </header>
  );
}

/**
 * Home renders Header without PageShell — wrap useSearchParams in Suspense
 * so `/` can prerender.
 */
export default function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  );
}
