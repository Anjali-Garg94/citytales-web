import Link from "next/link";
import HeaderMobileMenu from "./HeaderMobileMenu";
import { SearchIcon } from "./Icons";
import { navLinks } from "@/lib/data";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      {/* Wordmark — same treatment as the "Later this month" section labels
          (11px, semibold, wide tracking, uppercase), in ink rather than accent. */}
      <Link href="/" className="flex shrink-0 items-center no-underline">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">
          City Tales
        </span>
      </Link>

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

      {/* Mobile: search + hamburger */}
      <div className="flex items-center gap-4 lg:hidden">
        <SearchIcon className="h-5 w-5 text-ink" />
        <HeaderMobileMenu />
      </div>

      {/* Desktop: search + CTA */}
      <div className="hidden items-center gap-[22px] lg:flex">
        <SearchIcon className="h-[19px] w-[19px] text-ink" />
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
