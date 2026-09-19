"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Drifts one large image slightly against the page as its section scrolls
 * past — the picture moves a touch slower than everything around it, which is
 * what gives a scroll depth without anyone noticing why.
 *
 * Geometry, so this can't tear:
 *   - the layer is inflated 8% top and bottom beyond its container, so there
 *     is always image beyond the frame to move into;
 *   - travel is ±6% of container height, expressed in percent rather than
 *     pixels so it stays proportional at any size and can never out-run that
 *     8% of headroom;
 *   - the container's own `overflow-hidden` clips the rest.
 *
 * Deliberately narrow: desktop only (below `lg` the value is pinned to 0, no
 * scroll work at all — phones get the static image), off under reduced
 * motion, and only worth applying to a handful of large images. Everything
 * moving at its own speed is a fairground, not a scroll.
 */
export default function Parallax({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const active = isDesktop && !reduceMotion;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    active ? ["-6%", "6%"] : ["0%", "0%"],
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, top: "-8%", bottom: "-8%", left: 0, right: 0 }}
      className={`absolute ${className}`}
    >
      {children}
    </motion.div>
  );
}
