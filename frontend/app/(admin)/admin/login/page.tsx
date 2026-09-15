"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StormButton } from "@/components/admin/StormButton";
import { StormInput } from "@/components/admin/StormField";
import { StormIcon } from "@/components/admin/StormIcon";
import { adminAuthApi, ApiError } from "@/lib/api-client";
import { useAdminSession } from "@/lib/session-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Enter the email on your operator account.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await adminAuthApi.login({ email, password });
      await refresh();
      router.push("/admin");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.status === 401
            ? "That email and password don't match an operator account."
            : err.message
          : "We couldn't sign you in. The connection may be down."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-lift px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-mist bg-paper p-8 shadow-storm-md">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            B
          </span>
          <h1 className="storm-title mt-4">Biohacking Admin</h1>
          <p className="storm-prose mt-1.5 text-rain">
            Operator access to the customer pipeline. Customer accounts sign in on the main site.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
          <StormInput
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <StormInput
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {submitError && (
            <p
              role="alert"
              className="storm-data flex items-start gap-2 rounded-lg bg-signal-soft p-3 text-signal"
            >
              <span className="mt-px shrink-0">
                <StormIcon name="alert" size={14} />
              </span>
              {submitError}
            </p>
          )}

          <StormButton type="submit" loading={loading} className="mt-1 w-full">
            Sign in
          </StormButton>
        </form>
      </div>
      <p className="storm-micro mt-6 text-center text-quiet">Biohacking operations. Access is logged.</p>
    </div>
  );
}
