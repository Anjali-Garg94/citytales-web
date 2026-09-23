/**
 * Hand-picked local photos for EVENT categories (Pick your Vibe + Explore).
 * Keyed by the category's full `name` from the taxonomy API.
 */
export const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  "Community Clubs": "/images/events/cat-community-clubs-v3.jpg",
  Exhibition: "/images/events/cat-exhibition-bust.jpg",
  Festive: "/images/events/cat-festive-diya.jpg",
  "Health & Wellness": "/images/events/cat-wellness-yoga.jpg",
  Kids: "/images/events/cat-kids-train.jpg",
  "Live Shows": "/images/events/cat-live-shows-mic.jpg",
  "Music & Parties": "/images/events/cat-music-disco.jpg",
  "Workshops & Activities": "/images/events/cat-workshops-smiley.jpg",
};

export function categoryCoverImage(
  name: string,
  fallbackUrl?: string | null,
): string {
  return (
    CATEGORY_IMAGE_OVERRIDES[name] ??
    fallbackUrl ??
    "/images/events/hero-wide.jpg"
  );
}
