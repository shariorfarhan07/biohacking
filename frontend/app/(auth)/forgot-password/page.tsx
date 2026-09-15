"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.requestPasswordReset({ email });
    } catch {
      // Intentionally ignored: we always show the neutral success state below,
      // regardless of whether the email exists or the request failed, so we
      // never reveal account existence.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-fog-100">Check your email</h1>
        <p className="mt-3 text-sm text-fog-300">
          If an account exists for <span className="text-fog-100">{email}</span>, we've sent a
          link to reset your password. It should arrive within a few minutes.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Back to log in
        </Link>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="w-full max-w-md">
      <h1 className="font-display text-2xl font-bold text-fog-100">Forgot your password?</h1>
      <p className="mt-2 text-sm text-fog-400">
        Enter the email associated with your account and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fog-400">
        Remembered it after all?{" "}
        <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
          Log in
        </Link>
      </p>
    </GlassPanel>
  );
}
