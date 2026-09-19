"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * One global switch for every Framer Motion animation on the site.
 *
 * `reducedMotion="user"` means that when the visitor's OS asks for reduced
 * motion, transform and layout animations are dropped and elements land in
 * their final state immediately — opacity still fades, which is the
 * behaviour the accessibility guidance actually asks for. Doing it here
 * rather than in every component means a new reveal can't forget to.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
