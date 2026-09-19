"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerParent, viewport } from "./variants";

/**
 * Walks a cluster in one at a time — heading, then its line of copy, then the
 * button — instead of the whole block arriving at once.
 *
 * Children opt in by carrying `variants={fadeUp()}` and nothing else: Framer
 * Motion propagates the hidden/visible state down from here, so a child needs
 * no viewport logic of its own and the order on screen is the order in the
 * markup.
 */
export default function RevealGroup({
  children,
  className,
  stagger = 0.12,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}
