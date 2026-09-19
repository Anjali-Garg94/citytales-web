"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth scrolling, mounted once in the root layout.
 *
 * Renders nothing — it's a side-effect controller, so the page's DOM and
 * layout are untouched. Lenis runs against the real window scroll (no
 * wrapper/content elements), which matters: scroll position, anchors,
 * `position: sticky` and IntersectionObserver (what the reveals below use)
 * all keep working exactly as they do natively.
 *
 * Two deliberate restraints:
 *
 *  - `syncTouch: false` leaves touch scrolling completely native. Smoothing
 *    touch adds input latency and a rAF loop on every drag, and most
 *    CityTales visitors are on a phone. Wheel and trackpad get the smoothing;
 *    fingers get the real thing.
 *  - Under prefers-reduced-motion Lenis never starts at all, so scrolling is
 *    plain native scrolling. Nothing to tear down because nothing ran.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // ~1s settle: enough to feel carried, short enough that a flick still
      // lands where you expect. Longer than this starts feeling like lag.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Same-page anchors (Hero's "Start exploring" → #whats-on) would
    // otherwise jump instantly while everything else glides. Handled here
    // rather than on the links themselves so the markup stays as it was.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      );
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -16 });
      // preventDefault also suppresses the hash the browser would have put in
      // the URL, so put it back — the link stays copyable and the history
      // entry still exists.
      history.pushState(null, "", href);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
