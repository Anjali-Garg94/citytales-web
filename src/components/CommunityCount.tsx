"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "./motion/variants";

const TARGET = 500;
const DURATION_MS = 1600;

/**
 * Soft social proof — counts up once when scrolled into view.
 * `variant="hero"` renders it left-aligned without section padding, for the hero column.
 */
export default function CommunityCount({
  variant = "section",
  className = "",
}: {
  variant?: "section" | "hero";
  className?: string;
}) {
  const hero = variant === "hero";
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;

    if (reduceMotion) {
      frame = requestAnimationFrame(() => setValue(TARGET));
      return () => cancelAnimationFrame(frame);
    }

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // Ease-out cubic — fast start, soft settle on the number.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(TARGET * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <section
      ref={ref}
      className={`${hero ? "text-left" : "px-5 py-10 text-center lg:px-20 lg:py-12"} ${className}`}
      aria-label="Community size"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={hero ? "" : "mx-auto max-w-[520px]"}
      >
        <p className="text-[12px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
          Already with us
        </p>

        <p
          className={`mt-3 font-serif leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums ${
            hero ? "text-[56px]" : "text-[56px] lg:text-[72px]"
          }`}
        >
          <span className="text-accent">{value.toLocaleString("en-IN")}</span>
          <span className="text-ink">+</span>
        </p>

        <p
          className={`mt-4 text-[15px] leading-[1.45] text-ink-soft ${
            hero ? "max-w-[300px]" : "mx-auto max-w-[280px] lg:max-w-[340px] lg:text-[16px]"
          }`}
        >
          people exploring Ludhiana through CityTales
        </p>
      </motion.div>
    </section>
  );
}
