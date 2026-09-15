"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { AuthValuePanel } from "@/components/auth/AuthValuePanel";
import { authApi, ApiError } from "@/lib/api-client";
import { useSession } from "@/lib/session-context";

const VALUE_POINTS = [
  "A training and nutrition programme matched to your goals, not a generic template",
  "Ongoing coach support inside Everfit — messaging, check-ins, and adjustments",
  "Progress tracked over time, with your coach able to see the full picture",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Please enter your email.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await authApi.login({ email, password, remember_me: rememberMe });
      await refresh();
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/dashboard") ? next : "/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.status === 401
            ? "That email and password combination doesn't match our records."
            : err.message
          : "We couldn't sign you in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fade-rise-in grid w-full max-w-4xl items-center gap-8 lg:grid-cols-2"
      onAnimationEnd={(event) => event.currentTarget.classList.remove("fade-rise-in")}
    >
      <AuthValuePanel
        headline="Welcome back."
        description="Your programme, your coach, and your progress are exactly where you left them."
        points={VALUE_POINTS}
      />
      <GlassPanel className="w-full max-w-md justify-self-center lg:justify-self-start">
      <h1 className="font-display text-2xl font-bold text-fog-100">Log in</h1>
      <p className="mt-2 text-sm text-fog-400">Welcome back. Access your dashboard and coaching.</p>

      {submitError && (
        <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link href="/forgot-password" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fog-400">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
          Create one
        </Link>
      </p>
      </GlassPanel>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
