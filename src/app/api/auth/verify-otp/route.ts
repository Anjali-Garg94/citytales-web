import { NextResponse, type NextRequest } from "next/server";
import { validateOtp } from "@/lib/auth-api";
import { setSession } from "@/lib/auth-session";
import { CITY_ID } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

function isPlausiblePhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^\+?[0-9]{7,15}$/.test(phone.trim());
}

function isPlausibleOtp(otp: unknown): otp is string {
  return typeof otp === "string" && /^[0-9]{4,8}$/.test(otp.trim());
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { phone, otp } = (body as { phone?: unknown; otp?: unknown } | null) ?? {};
  if (!isPlausiblePhone(phone)) {
    return NextResponse.json({ message: "Enter a valid phone number" }, { status: 400 });
  }
  if (!isPlausibleOtp(otp)) {
    return NextResponse.json({ message: "Enter the 6-digit code" }, { status: 400 });
  }

  // 8 verify attempts per phone per 10 minutes — generous for fat-fingered
  // codes, still bounds brute-forcing a 6-digit OTP.
  const limit = rateLimit(`verify-otp:${phone}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts — try again shortly" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    );
  }

  try {
    // cityId/userName only seed a brand-new FIRST_TIME record — the profile
    // step (complete-profile) is what sets these properly, so a placeholder
    // here is fine and is ignored entirely for a returning user.
    const auth = await validateOtp({
      phone,
      otp,
      cityId: CITY_ID,
      userName: "New User",
    });

    await setSession({
      accessToken: auth.acessToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
    });

    return NextResponse.json({ user: auth.user });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 502;
    const message = error instanceof Error ? error.message : "Could not verify code";
    return NextResponse.json({ message }, { status });
  }
}
