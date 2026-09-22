"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth/AuthContext";
import { MenuIcon, PinIcon } from "./Icons";

/** Launch city — matches CITY_ID in src/lib/api.ts. No switcher wired up yet. */
const CITY_NAME = "Ludhiana";

/**
 * Mobile-only hamburger menu, opening a small panel with the current city
 * and Login / Sign up — the mobile-nav essentials, not the full desktop nav.
 */
export default function HeaderMobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center text-ink"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-ink/20"
          />

          <div className="absolute top-[calc(100%+10px)] right-0 z-50 w-[260px] rounded-2xl bg-bg p-4 shadow-[0_18px_40px_-12px_rgba(30,26,22,0.28)]">
            <div className="flex items-center gap-1.5 rounded-xl bg-accent-tint px-3.5 py-2.5">
              <PinIcon className="h-4 w-4 text-accent-deep" />
              <span className="text-[13px] font-semibold text-ink">
                {CITY_NAME}
              </span>
            </div>

            {!loading && user ? (
              <div className="mt-3">
                <div className="truncate text-[13px] font-semibold text-ink">
                  {user.name || user.phone}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="mt-2.5 w-full rounded-full border border-ink px-4 py-2.5 text-center text-[13px] font-semibold text-ink"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-ink px-4 py-2.5 text-center text-[13px] font-semibold text-ink no-underline"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-accent px-4 py-2.5 text-center text-[13px] font-semibold text-white no-underline"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
