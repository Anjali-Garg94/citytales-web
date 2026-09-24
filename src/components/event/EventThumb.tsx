"use client";

import Image from "next/image";

export type EventThumbVariant = "list" | "card" | "live";

type Props = {
  src: string;
  alt?: string;
  variant?: EventThumbVariant;
  /** Dim + “Ended” chip for past events */
  ended?: boolean;
  /** Extra grade for dark surfaces (Live Music) */
  onDark?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

const SIZES: Record<EventThumbVariant, string> = {
  list: "84px",
  card: "80px",
  live: "84px",
};

/**
 * Shared event photo crop — square thumbs, consistent focal point + grade.
 */
export default function EventThumb({
  src,
  alt = "",
  variant = "list",
  ended = false,
  onDark = false,
  priority = false,
  className = "",
  sizes,
}: Props) {
  return (
    <div
      className={`event-thumb event-thumb--${variant} ${
        onDark ? "event-thumb--on-dark" : ""
      } ${ended ? "event-thumb--ended" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? SIZES[variant]}
        className="event-thumb__img"
      />
      {ended ? (
        <span className="absolute bottom-1.5 left-1.5 z-[1] rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Ended
        </span>
      ) : null}
    </div>
  );
}
