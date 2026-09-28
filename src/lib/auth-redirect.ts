/** Same-site paths only — `?next=//evil.com` or absolute URLs fall back. */
export function safeNextPath(value: string | undefined | null, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export function loginHref(next: string): string {
  return next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
}
