"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";

const FALLBACK_CITY_ID =
  process.env.NEXT_PUBLIC_CITY_ID ?? "69ddfd45f46c8343ca62b4b7";

/**
 * Bookmark toggle for event cards. Logged-out users are sent to login;
 * logged-in users hit POST /api/user/saved-events (proxies the backend save API).
 */
export function useSaveEvent(eventId: string, cityId?: string | null) {
  const { user, openAuthModal } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSave = useCallback(
    async (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (saving) return;

      if (!user) {
        window.alert("Please log in or sign up to save events.");
        openAuthModal("login");
        return;
      }

      const next = !saved;
      setSaved(next);
      setSaving(true);
      try {
        const res = await fetch("/api/user/saved-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            cityId: user.cityId || cityId || FALLBACK_CITY_ID,
            save: next,
          }),
        });
        if (!res.ok) {
          setSaved(!next);
          window.alert("Could not update saved events.");
        }
      } catch {
        setSaved(!next);
        window.alert("Could not update saved events.");
      } finally {
        setSaving(false);
      }
    },
    [user, saved, saving, eventId, cityId, openAuthModal],
  );

  return { saved, saving, toggleSave };
}
