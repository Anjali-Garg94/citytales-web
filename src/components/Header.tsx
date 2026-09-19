import Link from "next/link";
import { SearchIcon } from "./Icons";
import { navLinks } from "@/lib/data";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-[18px] lg:px-20 lg:py-6">
      {/* Logo */}
      <Link
        href="/"
        className="flex flex-col items-center text-ink no-underline lg:items-start"
      >
        <span className="font-serif text-[21px] font-bold leading-none tracking-[0.01em] lg:text-2xl">
          CityTales
        </span>
        <span className="mt-[3px] text-[9px] font-semibold tracking-[0.18em] text-ink-soft lg:mt-1 lg:text-[9.5px]">
          WHAT&#39;S ON
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

      {/* Mobile: search icon */}
      <SearchIcon className="h-5 w-5 text-ink lg:hidden" />

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
