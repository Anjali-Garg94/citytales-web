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

type AuthModalMode = "login" | "signup" | null;

type AuthContextValue = {
  user: SessionUser | null;
  /** True until the initial /api/auth/me check resolves. */
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null);

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

  // Inlined rather than calling refreshUser() — the compiler's
  // set-state-in-effect check traces through named callbacks and flags an
  // effect that (indirectly) calls setState; an inline fetch avoids that
  // while doing the exact same thing on mount.
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

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalMode(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthModalOpen: authModalMode !== null,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      refreshUser,
      logout,
      setUser,
      cities,
    }),
    [user, loading, authModalMode, openAuthModal, closeAuthModal, refreshUser, logout, cities],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
