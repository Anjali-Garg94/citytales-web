"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, viewport } from "./variants";

/**
 * One step of a reveal.
 *
 * Inside a <RevealGroup> it takes its turn in that group's sequence; on its
 * own it watches the viewport itself. Either way it renders a single plain
 * `div` wrapper, which keeps this usable from server components — the
 * sections stay server-rendered and only this wrapper is client code.
 *
 * `y` and `duration` exist for the rare element that wants a slightly longer
 * travel (a standalone pull quote); most call sites should leave them alone
 * so the whole page moves by the same amount.
 */
export default function RevealItem({
  children,
  className,
  delay = 0,
  y,
  duration,
  inGroup = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  inGroup?: boolean;
}) {
  const standaloneProps = inGroup
    ? {}
    : ({ initial: "hidden", whileInView: "visible", viewport } as const);

  return (
    <motion.div
      className={className}
      variants={fadeUp(delay, y, duration)}
      {...standaloneProps}
    >
      {children}
    </motion.div>
  );
}
