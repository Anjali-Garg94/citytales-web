"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/lib/api";

/** Mirrors AuthUser from auth-api.ts — kept separate so client code never imports a server-only module. */
export type SessionUser = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  cityId: string | null;
  status: "FIRST_TIME" | "ACTIVE" | string;
  type: string;
  verifiedBy: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  /** True until the initial /api/auth/me check resolves. */
  loading: boolean;
  /**
   * Navigate to /login or /signup (replaces the old modal).
   * Kept name-stable for call sites that already use openAuthModal("login").
   */
  openAuthModal: (mode?: "login" | "signup") => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  /** Server-loaded at layout render — the sign-up city picker never needs its own client fetch or retry banner. */
  cities: City[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  cities,
}: {
  children: ReactNode;
  cities: City[];
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = (await res.json()) as { user: SessionUser | null };
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const openAuthModal = useCallback(
    (mode: "login" | "signup" = "login") => {
      router.push(mode === "signup" ? "/signup" : "/login");
    },
    [router],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      openAuthModal,
      refreshUser,
      logout,
      setUser,
      cities,
    }),
    [user, loading, openAuthModal, refreshUser, logout, cities],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
