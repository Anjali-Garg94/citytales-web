"use client";

import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import HeaderSearch from "./search/HeaderSearch";
import { APP_STORE } from "@/lib/apps";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      {/* Wordmark — same accent blue on Home and Discover */}
      <Link href="/" className="flex shrink-0 items-center no-underline">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          CityTales
        </span>
      </Link>

      {/* Search + CTA (desktop) + menu — ml-auto locks them to the right */}
      <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-[22px]">
        <HeaderSearch iconClassName="h-5 w-5 text-ink lg:h-[19px] lg:w-[19px]" />
        <a
          href={APP_STORE.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get ${APP_STORE.name} on the App Store`}
          className="hidden border border-ink px-5 py-[9px] text-[12.5px] font-semibold tracking-[0.03em] text-ink no-underline hover:bg-ink hover:text-bg lg:inline-block"
        >
          Get the app
        </a>
        <HeaderMenu />
      </div>
    </header>
  );
}
