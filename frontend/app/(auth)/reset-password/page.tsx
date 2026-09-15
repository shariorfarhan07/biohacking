"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi, ApiError } from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const next: { password?: string; confirm?: string } = {};
    if (!password) {
      next.password = "Please choose a new password.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (confirmPassword !== password) {
      next.confirm = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await authApi.confirmPasswordReset({ token, new_password: password });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "We couldn't reset your password right now. Please try again or request a new link."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <h1 className="font-display text-xl font-bold text-fog-100">Invalid reset link</h1>
        <p className="mt-3 text-sm text-fog-300">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          Request a new link
        </Link>
      </GlassPanel>
    );
  }

  if (success) {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-fog-100">Password reset</h1>
        <p className="mt-3 text-sm text-fog-300">
          Your password has been updated. You can now log in with your new password.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Log in</Button>
        </Link>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="w-full max-w-md">
      <h1 className="font-display text-2xl font-bold text-fog-100">Choose a new password</h1>
      <p className="mt-2 text-sm text-fog-400">Enter and confirm your new password below.</p>

      {submitError && (
        <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <Input
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirm}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Reset password
        </Button>
      </form>
    </GlassPanel>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
