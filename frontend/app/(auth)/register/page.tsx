"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { AuthValuePanel } from "@/components/auth/AuthValuePanel";
import { authApi, ApiError } from "@/lib/api-client";
import { useSession } from "@/lib/session-context";

const VALUE_POINTS = [
  "Choose a coaching package next — pricing is upfront, cancel anytime",
  "An onboarding assessment matches you to the right programme automatically",
  "Everfit access is provisioned the moment onboarding is complete",
];

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const EMPTY: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "terms", string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Partial<Record<keyof FormState | "terms", string>> = {};
    if (!form.first_name.trim()) next.first_name = "Please enter your first name.";
    if (!form.last_name.trim()) next.last_name = "Please enter your last name.";
    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Please choose a password.";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (form.confirm_password !== form.password) {
      next.confirm_password = "Passwords do not match.";
    }
    if (!acceptedTerms) {
      next.terms = "You must accept the Terms of Service to continue.";
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
      await authApi.register(form);
      await refresh();
      router.push("/pricing");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "We couldn't create your account right now. Please try again."
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
        headline="Set up your coaching account."
        description="Two minutes to create an account — then choose a package and complete a short onboarding assessment."
        points={VALUE_POINTS}
      />
      <GlassPanel className="w-full max-w-md justify-self-center lg:justify-self-start">
      <h1 className="font-display text-2xl font-bold text-fog-100">Create your account</h1>
      <p className="mt-2 text-sm text-fog-400">
        Set up your account, then choose a coaching package to get started.
      </p>

      {submitError && (
        <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            required
            autoComplete="given-name"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            error={errors.first_name}
          />
          <Input
            label="Last name"
            required
            autoComplete="family-name"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            error={errors.last_name}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
          error={errors.confirm_password}
        />
        <Checkbox
          label={
            <>
              I agree to the{" "}
              <Link href="/legal/terms" className="text-cyan-300 hover:text-cyan-200">
                Terms of Service
              </Link>
            </>
          }
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          error={errors.terms}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fog-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
          Log in
        </Link>
      </p>
      </GlassPanel>
    </div>
  );
}
