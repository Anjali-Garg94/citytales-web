import { NextResponse, type NextRequest } from "next/server";
import { sendOtp } from "@/lib/auth-api";
import { rateLimit } from "@/lib/rate-limit";

/** E.164-ish: keep it loose, the backend is the real validator. */
function isPlausiblePhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^\+?[0-9]{7,15}$/.test(phone.trim());
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const phone = (body as { phone?: unknown } | null)?.phone;
  if (!isPlausiblePhone(phone)) {
    return NextResponse.json({ message: "Enter a valid phone number" }, { status: 400 });
  }

  // 5 OTP requests per phone per 10 minutes — enough for real retries, not
  // enough to be useful as an SMS-bombing vector.
  const limit = rateLimit(`send-otp:${phone}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts — try again shortly" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    );
  }

  try {
    const result = await sendOtp(phone);
    // Never forward `message` — the dev backend echoes the OTP in it.
    return NextResponse.json({ status: result.status });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 502;
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ message }, { status });
  }
}
