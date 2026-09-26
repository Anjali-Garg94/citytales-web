type BadgeColors = { bg: string; text: string };

/** Category pill colors, keyed by the backend's uppercase category label. */
const CATEGORY_BADGE_COLORS: Record<string, BadgeColors> = {
  MUSIC: { bg: "#EDE7FB", text: "#6D4FC4" },
  "LIVE SHOWS": { bg: "#DFF3E7", text: "#1F8A54" },
  WORKSHOPS: { bg: "#FDE9D2", text: "#B9631A" },
  "FOOD & DRINKS": { bg: "#FBE4E4", text: "#C23B3B" },
  CLUB: { bg: "#E3EEFC", text: "#2563A6" },
  CLUBS: { bg: "#E3EEFC", text: "#2563A6" },
  EXHIBITION: { bg: "#FBE4E4", text: "#C23B3B" },
  EXHIBITIONS: { bg: "#FBE4E4", text: "#C23B3B" },
  FESTIVE: { bg: "#FEF0C7", text: "#A16207" },
  WELLNESS: { bg: "#E1F5F1", text: "#0F8A78" },
  "HEALTH & WELLNESS": { bg: "#E1F5F1", text: "#0F8A78" },
  KIDS: { bg: "#FDE7F3", text: "#C23B86" },
  ACTIVITIES: { bg: "#FDE9D2", text: "#B9631A" },
  DANCE: { bg: "#FDE7F3", text: "#C23B86" },
  EVENT: { bg: "var(--accent-tint)", text: "var(--accent-deep)" },
};

const DEFAULT_BADGE: BadgeColors = {
  bg: "var(--accent-tint)",
  text: "var(--accent-deep)",
};

/** Colour-coded category pill, matching the This Week cards. */
export function categoryBadgeColors(category: string): BadgeColors {
  return CATEGORY_BADGE_COLORS[category.toUpperCase()] ?? DEFAULT_BADGE;
}

/** Stronger saturated pills for dark Live Music screens (white label text). */
const DARK_CATEGORY_BADGE_COLORS: Record<string, BadgeColors> = {
  MUSIC: { bg: "#7C5CFC", text: "#FFFFFF" },
  "LIVE SHOWS": { bg: "#E11D48", text: "#FFFFFF" },
  "LIVE MUSIC": { bg: "#E11D48", text: "#FFFFFF" },
  "DJ PARTY": { bg: "#7C5CFC", text: "#FFFFFF" },
  "CLUB NIGHT": { bg: "#2563EB", text: "#FFFFFF" },
  "LIVE BAND": { bg: "#16A34A", text: "#FFFFFF" },
  CLUB: { bg: "#2563EB", text: "#FFFFFF" },
  CLUBS: { bg: "#2563EB", text: "#FFFFFF" },
  FESTIVE: { bg: "#D97706", text: "#FFFFFF" },
};

const DEFAULT_DARK_BADGE: BadgeColors = {
  bg: "#7C5CFC",
  text: "#FFFFFF",
};

export function darkCategoryBadgeColors(category: string): BadgeColors {
  return (
    DARK_CATEGORY_BADGE_COLORS[category.toUpperCase()] ?? DEFAULT_DARK_BADGE
  );
}
