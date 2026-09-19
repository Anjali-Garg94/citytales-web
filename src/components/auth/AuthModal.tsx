"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon } from "../Icons";
import { useAuth, type SessionUser } from "./AuthContext";

type Step = "phone" | "otp" | "profile";

const RESEND_SECONDS = 30;

/**
 * Gates mounting on isAuthModalOpen rather than early-returning null inside
 * the panel — that way every open is a fresh mount of AuthModalPanel, so its
 * useState calls start from the right values with no reset effect needed.
 */
export default function AuthModal() {
  const { isAuthModalOpen, authModalMode } = useAuth();
  if (!isAuthModalOpen || !authModalMode) return null;
  return <AuthModalPanel key={authModalMode} mode={authModalMode} />;
}

function AuthModalPanel({ mode }: { mode: "login" | "signup" }) {
  const { closeAuthModal, setUser, refreshUser, cities } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  // Cities are server-loaded (see layout.tsx) and already in context by the
  // time this mounts — no client fetch or "loading cities…" state needed.
  const [cityId, setCityId] = useState(() => cities[0]?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Resend-OTP countdown — a timer subscription, not derived state.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const title = mode === "signup" ? "Sign up" : "Log in";

  async function submitPhone() {
    setError("");
    if (!/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      setError("Enter a valid phone number");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = (await res.json()) as { status?: string; message?: string };
      if (!res.ok) {
        setError(data.message || "Could not send code");
        return;
      }
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
    if (!/^[0-9]{4,8}$/.test(otp.trim())) {
      setError("Enter the code you received");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });
      const data = (await res.json()) as { user?: SessionUser; message?: string };
      if (!res.ok || !data.user) {
        setError(data.message || "Incorrect code");
        return;
      }
      if (data.user.status === "FIRST_TIME") {
        setName(data.user.name ?? "");
        setStep("profile");
      } else {
        setUser(data.user);
        closeAuthModal();
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  async function submitProfile() {
    setError("");
    if (name.trim().length < 2) {
      setError("Enter your name");
      return;
    }
    if (!cityId) {
      setError("Choose a city");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), cityId }),
      });
      const data = (await res.json()) as { user?: SessionUser; message?: string };
      if (!res.ok || !data.user) {
        setError(data.message || "Could not save your profile");
        return;
      }
      setUser(data.user);
      void refreshUser();
      closeAuthModal();
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={closeAuthModal}
        className="fixed inset-0 bg-ink/40"
      />

      <div className="relative w-full max-w-[380px] rounded-2xl bg-bg p-6 shadow-[0_24px_60px_-12px_rgba(30,26,22,0.35)]">
        <button
          type="button"
          aria-label="Close"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <h2 className="font-serif text-[20px] font-bold text-ink">{title}</h2>

        {step === "phone" && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[13px] text-ink-soft">
              We&apos;ll text you a one-time code — no password to remember.
            </p>
            <input
              type="tel"
              inputMode="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPhone()}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            {error && <p className="text-[12.5px] text-[#C23B3B]">{error}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={submitPhone}
              className="rounded-full bg-accent px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send code"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[13px] text-ink-soft">
              Enter the code sent to <span className="font-semibold text-ink">{phone}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitOtp()}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-center text-[16px] tracking-[0.3em] text-ink outline-none focus:border-accent"
            />
            {error && <p className="text-[12.5px] text-[#C23B3B]">{error}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={submitOtp}
              className="rounded-full bg-accent px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={submitPhone}
              className="text-[12.5px] font-semibold text-accent-deep disabled:text-ink-soft"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        )}

        {step === "profile" && (
          <div className="mt-5 flex flex-col gap-3">
            <div>
              <p className="text-[15px] font-semibold text-ink">Almost there!</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Just a few details to personalize your experience.
              </p>
            </div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            />
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {error && <p className="text-[12.5px] text-[#C23B3B]">{error}</p>}
            <p className="text-[11.5px] leading-[1.5] text-ink-soft">
              By continuing, you agree to our{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-accent-deep">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-accent-deep">
                Privacy Policy
              </Link>
              .
            </p>
            <button
              type="button"
              disabled={busy || !name.trim() || !cityId}
              onClick={submitProfile}
              className="rounded-full bg-accent px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
