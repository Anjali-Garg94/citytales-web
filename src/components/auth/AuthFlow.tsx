"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth, type SessionUser } from "./AuthContext";
import { ChevronLeftIcon } from "@/components/Icons";

type Step = "phone" | "otp";

const RESEND_SECONDS = 30;
const MAX_RESENDS = 3;

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.replace(/\D/g, "").slice(0, 6).padEnd(6, " ").split("");

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value.replace(/\D/g, "").slice(0, 6)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="absolute inset-0 z-10 cursor-text text-[16px] opacity-0"
        aria-label="6-digit OTP"
      />
      <div
        className="flex justify-between gap-2"
        onClick={() => inputRef.current?.focus()}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            className={`flex h-12 w-10 items-center justify-center rounded-xl border text-[18px] font-semibold lg:h-14 lg:w-12 ${
              value.length === i
                ? "border-accent"
                : "border-line"
            } bg-white text-ink`}
          >
            {d.trim() ? d : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Single login flow: phone → OTP → in.
 * verify-otp registers unknown numbers on the spot (Ludhiana, empty name),
 * so there is no separate sign-up or profile step.
 */
export default function AuthFlow({
  redirectTo = "/",
}: {
  /** Where to land after a successful login — already sanitised by the page. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const { setUser } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function submitPhone(isResend = false) {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (isResend && resendCount >= MAX_RESENDS) {
      setError("You have reached the maximum number of OTP resend attempts.");
      return;
    }
    setPhone(digits);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Could not send code");
        return;
      }
      if (isResend) setResendCount((c) => c + 1);
      setOtp("");
      setStep("otp");
      setResendIn(RESEND_SECONDS);
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp() {
    setError("");
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    const digits = phone.replace(/\D/g, "").slice(-10);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, otp: otp.replace(/\D/g, "") }),
      });
      const data = (await res.json()) as { user?: SessionUser; message?: string };
      if (!res.ok || !data.user) {
        setError(data.message || "Incorrect code");
        return;
      }
      setUser(data.user);
      router.replace(redirectTo);
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  function backToPhone() {
    setError("");
    setStep("phone");
    setOtp("");
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col px-5 py-10 lg:py-16">
      {step === "otp" ? (
        <button
          type="button"
          onClick={backToPhone}
          aria-label="Back"
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      ) : null}

      <h1 className="font-serif text-[28px] leading-[1.15] font-semibold text-ink lg:text-[34px]">
        Log in
      </h1>

      {step === "phone" ? (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-[14px] text-ink-soft">
            We&apos;ll text you a one-time code. New here? Your account is created
            automatically.
          </p>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink">
              Phone number <span className="text-[#C23B3B]">*</span>
            </label>
            <div className="flex overflow-hidden rounded-full border border-line bg-white">
              <span className="flex items-center border-r border-line px-3.5 text-[14px] font-semibold text-ink">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                onKeyDown={(e) => e.key === "Enter" && void submitPhone()}
                className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-[16px] text-ink outline-none lg:text-[14px]"
              />
            </div>
          </div>

          {error ? <p className="text-[12.5px] text-[#C23B3B]">{error}</p> : null}

          <button
            type="button"
            disabled={busy || phone.length !== 10}
            onClick={() => void submitPhone()}
            className="cta-pill mt-1 self-center"
          >
            {busy ? "Sending…" : "Send OTP"}
          </button>

          <p className="mt-1 text-center text-[11.5px] leading-[1.5] text-ink-soft">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-semibold text-accent-deep no-underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-accent-deep no-underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      ) : null}

      {step === "otp" ? (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <p className="text-[15px] font-semibold text-ink">OTP verification</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              Enter the 6-digit OTP we sent to{" "}
              <span className="font-semibold text-ink">+91 {phone}</span>
            </p>
          </div>

          <OtpBoxes value={otp} onChange={setOtp} disabled={busy} />

          {error ? <p className="text-[12.5px] text-[#C23B3B]">{error}</p> : null}

          <button
            type="button"
            disabled={busy || otp.replace(/\D/g, "").length !== 6}
            onClick={() => void submitOtp()}
            className="cta-pill cta-pill--block"
          >
            {busy ? "Verifying…" : "Continue"}
          </button>

          <button
            type="button"
            disabled={resendIn > 0 || busy || resendCount >= MAX_RESENDS}
            onClick={() => void submitPhone(true)}
            className="text-[12.5px] font-semibold text-accent-deep disabled:text-ink-soft"
          >
            {resendCount >= MAX_RESENDS
              ? "Resend limit reached"
              : resendIn > 0
                ? `Resend OTP in ${resendIn}s`
                : "Resend OTP"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
