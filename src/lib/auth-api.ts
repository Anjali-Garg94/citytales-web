/**
 * Thin server-side client for the CityTales Auth API.
 *
 * Only ever imported from Route Handlers under src/app/api/auth/** — never
 * from a client component. The backend has no CORS headers for browser
 * fetches (confirmed against the live API), and even if it did, the raw
 * access/refresh tokens should never reach client JS — see auth-session.ts
 * for how the browser only ever gets an httpOnly session cookie.
 *
 * There is no password anywhere in this model: a phone number + a 6-digit
 * OTP gets you a JWT pair. A brand-new number is auto-created as
 * FIRST_TIME (already logged in, profile incomplete); /auth/signup fills in
 * name/city and flips it to ACTIVE. Sign-up is login plus one extra step,
 * not a separate flow.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://139.59.80.51:8080";

export type AuthUser = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  cityId: string | null;
  status: "FIRST_TIME" | "ACTIVE" | string;
  type: string;
  verifiedBy: string;
};

export type AuthResponse = {
  user: AuthUser;
  /**
   * Sic — the backend's DTO field is spelled with one "c". This is a typo in
   * their code, and therefore in the JSON on the wire. Do not "fix" it here;
   * matching the real field name is what makes this actually read the token.
   */
  acessToken: string;
  refreshToken: string;
};

type SendOtpResponse = { status: "DELIVERED" | "FAILED"; message: string };

async function post<T>(
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // The backend returns HTML on some errors — surface that rather than
    // crashing on JSON.parse.
    throw new Error(`Non-JSON response from ${path}: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data as T;
}

/**
 * POST /auth/sendOtp — returns HTTP 200 even when it fails to send; the
 * `status` field is the only thing that says whether an SMS actually went
 * out. Never forward `message` to the client — it may embed the OTP.
 */
export function sendOtp(phone: string): Promise<SendOtpResponse> {
  return post<SendOtpResponse>("/auth/sendOtp", { phone });
}

/**
 * Normalize phone to the same shape the mobile app sends:
 * `+91-XXXXXXXXXX` (hyphen after country code). The SMS gateway on this
 * backend is keyed to that format — bare `+91XXXXXXXXXX` skips real delivery
 * and only echos the OTP in the JSON message.
 */
export function normalizeAuthPhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s()]/g, "");
  // Already app-shaped: +91-10digits
  if (/^\+91-\d{10}$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  // 91XXXXXXXXXX (12 digits) or bare 10-digit Indian mobile
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+91-${digits.slice(2)}`;
  }
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91-${digits}`;
  }
  // Other E.164 — keep + and digits, no forced hyphen
  if (trimmed.startsWith("+") && digits.length >= 8) {
    return `+${digits}`;
  }
  return trimmed;
}

/**
 * POST /auth/validateOtp — cityId/userName only matter for a brand-new
 * phone number (they seed the auto-created user record); they're ignored
 * for an existing user, so it's fine to send a default every time.
 */
export function validateOtp(params: {
  phone: string;
  otp: string;
  cityId: string;
  userName: string;
}): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/validateOtp", {
    phone: params.phone,
    oneTimePassword: params.otp,
    cityId: params.cityId,
    userName: params.userName,
  });
}

/**
 * POST /auth/signup — completes a FIRST_TIME user's profile, flipping them
 * to ACTIVE. Requires the Authorization: Bearer <accessToken> header from
 * that same user's validateOtp response (confirmed empirically — a bare
 * unauthenticated call 401s with an empty body); it also trusts whatever
 * `id` is in the body, so callers MUST pass an id read from our own session
 * cookie, never one taken from client input — see auth-session.ts.
 */
export function completeSignup(
  profile: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cityId: string;
    dateOfBirth?: string;
    gender?: string;
  },
  accessToken: string,
): Promise<AuthUser> {
  return post<AuthUser>("/auth/signup", profile, accessToken);
}

/** POST /auth/refreshToken — trades a refresh token for a fresh pair. */
export function refreshAuthToken(refreshToken: string): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/refreshToken", { refreshToken });
}
