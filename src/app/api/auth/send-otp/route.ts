import { NextResponse, type NextRequest } from "next/server";
import {
  normalizeAuthPhone,
  sendOtp,
} from "@/lib/auth-api";
import { rateLimit } from "@/lib/rate-limit";

/** Accept bare 10-digit, +91…, or app-style +91-… */
function isPlausiblePhone(phone: unknown): phone is string {
  if (typeof phone !== "string") return false;
  const cleaned = phone.trim().replace(/[\s()-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(cleaned);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const rawPhone = (body as { phone?: unknown } | null)?.phone;
  if (!isPlausiblePhone(rawPhone)) {
    return NextResponse.json({ message: "Enter a valid phone number" }, { status: 400 });
  }

  const phone = normalizeAuthPhone(rawPhone);
  if (!/^\+91-\d{10}$/.test(phone)) {
    return NextResponse.json(
      { message: "Enter a valid 10-digit mobile number" },
      { status: 400 },
    );
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

    if (result.status === "FAILED") {
      return NextResponse.json(
        { message: "Could not send the code — try again" },
        { status: 502 },
      );
    }

    // Never forward `message` — the backend may echo the OTP in it.
    return NextResponse.json({
      status: result.status,
      phone,
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 502;
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ message }, { status });
  }
}
