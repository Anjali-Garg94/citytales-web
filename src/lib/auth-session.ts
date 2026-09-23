import { cookies } from "next/headers";
import { refreshAuthToken, type AuthUser } from "./auth-api";

/**
 * Session cookies — the browser only ever gets these, never the raw JWTs
 * inline in JS-readable form beyond what's needed. All three are httpOnly so
 * client script can't read or exfiltrate them; `ct_user` exists purely so
 * server code (and the `/api/auth/me` route) can return "who is logged in"
 * without an extra round trip to the backend on every request.
 */
const ACCESS_COOKIE = "ct_access";
const REFRESH_COOKIE = "ct_refresh";
const USER_COOKIE = "ct_user";

const COMMON = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Access tokens are short-lived; keep the cookie modest. Refresh outlives it. */
const ACCESS_MAX_AGE = 60 * 30; // 30 min
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setSession(params: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, params.accessToken, {
    ...COMMON,
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(REFRESH_COOKIE, params.refreshToken, {
    ...COMMON,
    maxAge: REFRESH_MAX_AGE,
  });
  store.set(USER_COOKIE, JSON.stringify(params.user), {
    ...COMMON,
    maxAge: REFRESH_MAX_AGE,
  });
}

/** Updates just the user-identity cookie — used after /auth/signup completes a profile. */
export async function setSessionUser(user: AuthUser): Promise<void> {
  const store = await cookies();
  store.set(USER_COOKIE, JSON.stringify(user), {
    ...COMMON,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(USER_COOKIE);
}

/**
 * Trade refresh cookie for a new access/refresh pair and persist them.
 * Returns the new access token, or null if refresh fails (session cleared).
 */
export async function rotateAccessToken(): Promise<string | null> {
  const [refreshToken, user] = await Promise.all([
    getRefreshToken(),
    getSessionUser(),
  ]);
  if (!refreshToken || !user) {
    await clearSession();
    return null;
  }

  try {
    const auth = await refreshAuthToken(refreshToken);
    const accessToken = auth.acessToken;
    if (!accessToken) {
      await clearSession();
      return null;
    }
    await setSession({
      accessToken,
      refreshToken: auth.refreshToken || refreshToken,
      user: auth.user ?? user,
    });
    return accessToken;
  } catch {
    await clearSession();
    return null;
  }
}

/**
 * Access token for authenticated backend calls:
 * 1. Use existing ct_access if present
 * 2. Otherwise refresh via ct_refresh
 * 3. null → caller should 401 (session gone)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const existing = await getAccessToken();
  if (existing) return existing;
  return rotateAccessToken();
}

/**
 * Fetch a backend URL with Bearer auth.
 * On 401: refresh tokens once, store them, retry the same request.
 * If refresh fails: clear session and return the 401 response.
 */
export async function authedBackendFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  let accessToken = await getValidAccessToken();
  if (!accessToken) {
    return new Response(JSON.stringify({ message: "Not logged in" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const buildHeaders = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  };

  let res = await fetch(url, {
    ...init,
    headers: buildHeaders(accessToken),
    cache: "no-store",
  });

  if (res.status !== 401) return res;

  // Access token rejected — refresh and retry once.
  const refreshed = await rotateAccessToken();
  if (!refreshed) return res;

  res = await fetch(url, {
    ...init,
    headers: buildHeaders(refreshed),
    cache: "no-store",
  });
  return res;
}
