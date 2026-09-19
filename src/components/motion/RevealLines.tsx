"use client";

import { motion } from "framer-motion";
import { EASE, staggerParent, viewport } from "./variants";

/**
 * Masked line reveal: each line rises out from behind its own edge, one after
 * the next, instead of fading in as a block.
 *
 * Kept for the page's two or three statement headlines — it's the most
 * noticeable move on the site, and it only reads as confident while it stays
 * rare. Ordinary headings use the plain fade in <RevealItem>.
 *
 * Lines are passed in already split. Nothing here measures or re-wraps text,
 * so it's only correct for headings whose breaks are authored (the caller
 * writes one string per line); a paragraph that rewraps at different widths
 * would need real text splitting and doesn't belong here.
 *
 * The mask is exactly one line box — no padding. Padding for descender
 * clearance was the obvious guard, but it grew the heading by ~5px and the
 * clearance turns out to be unnecessary: at these sizes the half-leading
 * either side of the font box already leaves the tail of a "y" a couple of
 * pixels inside the mask. Worth re-measuring if this is ever used on
 * leading tighter than ~1.1.
 */
export default function RevealLines({
  lines,
  className,
  stagger = 0.1,
}: {
  lines: string[];
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(stagger)}
    >
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "105%" },
              visible: {
                y: "0%",
                transition: { duration: 0.85, ease: EASE },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
