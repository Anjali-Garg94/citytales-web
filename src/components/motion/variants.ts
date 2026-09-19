import type { Variants } from "framer-motion";

/**
 * Shared vocabulary for the site's scroll reveals.
 *
 * One easing curve and two movement distances everywhere, so every section
 * enters the same way and the page reads as one piece rather than a pile of
 * separate effects. Nothing here scales, rotates or bounces — content lifts a
 * little and fades in, and that's it.
 *
 * Reduced motion is handled globally by <MotionProvider> (MotionConfig
 * reducedMotion="user"), so none of these need their own guard.
 */

/** Soft deceleration — fast at the start, long settle. No overshoot. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Text, buttons, list rows: lift and fade. */
export function fadeUp(delay = 0, y = 24, duration = 0.7): Variants {
  return {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE, delay } },
  };
}

/**
 * Images: the same lift, slightly longer, with a hint of scale settling back
 * to 1. Applied to a layer inside the image's existing overflow-hidden frame,
 * so the frame masks the movement — the picture appears to slide into place
 * behind its own window rather than popping in.
 */
export function fadeUpImage(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 32, scale: 1.045 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: EASE, delay },
    },
  };
}

/**
 * Opacity only. For a frame whose *contents* are doing the moving — without
 * this the wrapper and the image inside it would both translate and the
 * movement would read as twice what was intended.
 */
export function fadeIn(delay = 0, duration = 0.7): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, ease: EASE, delay } },
  };
}

/** Parent that walks its children in, one shortly after the next. */
export function staggerParent(stagger = 0.12, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/**
 * Fire once, slightly before the element is fully on screen, so content is
 * already settled by the time it reaches comfortable reading position — the
 * reveal should never be something the reader waits on.
 */
export const viewport = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -8% 0px",
} as const;
