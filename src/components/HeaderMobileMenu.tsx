"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth/AuthContext";
import { CloseIcon, MenuIcon, PinIcon } from "./Icons";

/** Launch city — matches CITY_ID in src/lib/api.ts. No switcher wired up yet. */
const CITY_NAME = "Ludhiana";

const PRIMARY_LINKS = [
  { label: "Discover events", href: "/explore-events" },
  { label: "Saved Events", href: "/saved-events" },
] as const;

/**
 * Mobile menu — one dense frosted glass panel.
 */
export default function HeaderMobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="glass-menu-btn relative z-50 flex h-10 w-10 items-center justify-center rounded-[12px] text-ink transition hover:brightness-105"
      >
        {open ? (
          <CloseIcon className="h-[18px] w-[18px]" />
        ) : (
          <MenuIcon className="h-[18px] w-[18px]" />
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/[0.08]"
          />

          <div className="glass-menu-panel fixed top-[68px] right-4 z-50 w-[min(280px,calc(100vw-2rem))] px-4 py-4 sm:right-5">
            <nav>
              <ul className="flex flex-col">
                {PRIMARY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-2.5 py-2.5 text-[16px] font-semibold tracking-[-0.015em] text-ink no-underline transition hover:bg-black/[0.04]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="my-3 h-px bg-black/[0.08]" />

            <div className="px-2.5 pb-1 text-[12px] font-medium text-[#8A8A8E]">
              City
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-2">
              <PinIcon className="h-4 w-4 text-accent-deep" />
              <span className="text-[16px] font-semibold tracking-[-0.015em] text-ink">
                {CITY_NAME}
              </span>
            </div>

            <div className="my-3 h-px bg-black/[0.08]" />

            <div className="px-2.5 pb-1 text-[12px] font-medium text-[#8A8A8E]">
              Account
            </div>
            {!loading && user ? (
              <>
                <div className="truncate px-2.5 py-2 text-[15px] font-semibold text-ink">
                  {user.name || user.phone}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="mt-1.5 w-full rounded-full bg-ink px-4 py-2.5 text-center text-[13px] font-semibold text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-2.5 py-2.5 text-[16px] font-semibold tracking-[-0.015em] text-ink no-underline transition hover:bg-black/[0.04]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-2.5 py-2.5 text-[16px] font-semibold tracking-[-0.015em] text-ink no-underline transition hover:bg-black/[0.04]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
