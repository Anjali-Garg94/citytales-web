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
import { loginHref } from "@/lib/auth-redirect";

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
  /** Navigate to /login, returning to the current page afterwards. */
  openAuthModal: () => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const openAuthModal = useCallback(() => {
    router.push(loginHref(window.location.pathname + window.location.search));
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      openAuthModal,
      refreshUser,
      logout,
      setUser,
    }),
    [user, loading, openAuthModal, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
