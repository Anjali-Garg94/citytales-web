/** Same-site paths only — `?next=//evil.com` or absolute URLs fall back. */
export function safeNextPath(value: string | undefined | null, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export function authHref(mode: "login" | "signup", next: string): string {
  const base = mode === "signup" ? "/signup" : "/login";
  return next === "/" ? base : `${base}?next=${encodeURIComponent(next)}`;
}
