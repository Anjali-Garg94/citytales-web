"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUpImage, viewport } from "./variants";

/**
 * Slides an image up into its own frame as it comes on screen.
 *
 * Goes *between* a `relative overflow-hidden` container and the
 * `<Image fill>` inside it: this adds one absolutely positioned layer and
 * changes nothing about the container, so the aspect ratio, rounding and
 * reserved space are exactly what they were — the reveal can't shift layout.
 * The container's existing `overflow-hidden` is what masks the movement.
 *
 * Meant for the larger, more deliberate pictures (mood tiles, feature
 * imagery). Small repeated card thumbnails reveal at card level instead, so
 * a grid reads as a grid arriving rather than a dozen separate images.
 *
 * Pass `inGroup` when it sits inside a <RevealGroup> and should take its turn
 * in that sequence rather than watching the viewport itself.
 */
export default function RevealImage({
  children,
  className = "",
  delay = 0,
  inGroup = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inGroup?: boolean;
}) {
  const standaloneProps = inGroup
    ? {}
    : ({ initial: "hidden", whileInView: "visible", viewport } as const);

  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      variants={fadeUpImage(delay)}
      {...standaloneProps}
    >
      {children}
    </motion.div>
  );
}
