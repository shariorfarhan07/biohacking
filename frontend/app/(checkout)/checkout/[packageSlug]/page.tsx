"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { packagesApi, authApi, checkoutApi, ApiError } from "@/lib/api-client";
import { useSession } from "@/lib/session-context";
import { formatPrice } from "@/lib/utils";
import { BILLING_INTERVAL_LABELS } from "@/lib/constants";
import { saveMembershipId } from "@/lib/local-membership";
import type { Package } from "@/lib/types";

const DEV_BYPASS_ENABLED = process.env.NODE_ENV !== "production";

interface RegisterFields {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const EMPTY_REGISTER: RegisterFields = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function CheckoutPackagePage({ params }: { params: { packageSlug: string } }) {
  const router = useRouter();
  const { customer, loading: sessionLoading, refresh } = useSession();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [registerFields, setRegisterFields] = useState<RegisterFields>(EMPTY_REGISTER);
  const [registerErrors, setRegisterErrors] = useState<Partial<RegisterFields>>({});
  const [discountCode, setDiscountCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [devBypassing, setDevBypassing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await packagesApi.get(params.packageSlug);
        if (!cancelled) setPkg(data);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.status === 404
                ? "We couldn't find that coaching package."
                : err.message
              : "We couldn't load this package right now."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.packageSlug]);

  function validateRegister(): boolean {
    if (customer) return true;
    const next: Partial<RegisterFields> = {};
    if (!registerFields.first_name.trim()) next.first_name = "Required.";
    if (!registerFields.last_name.trim()) next.last_name = "Required.";
    if (!registerFields.email.trim()) {
      next.email = "Required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerFields.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!registerFields.password || registerFields.password.length < 8) {
      next.password = "At least 8 characters.";
    }
    if (registerFields.confirm_password !== registerFields.password) {
      next.confirm_password = "Passwords do not match.";
    }
    setRegisterErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCompletePurchase() {
    if (!pkg) return;
    if (!validateRegister()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!customer) {
        await authApi.register(registerFields);
        await refresh();
      }
      const { checkout_url } = await checkoutApi.createSession({
        package_id: pkg.id,
        discount_code: discountCode.trim() || undefined,
      });
      window.location.href = checkout_url;
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "We couldn't start checkout right now. Please try again."
      );
      setSubmitting(false);
    }
  }

  async function handleDevBypass() {
    if (!pkg) return;
    if (!validateRegister()) return;

    setDevBypassing(true);
    setSubmitError(null);
    try {
      if (!customer) {
        await authApi.register(registerFields);
        await refresh();
      }
      const { membership_id } = await checkoutApi.createDevSession({
        package_id: pkg.id,
        discount_code: discountCode.trim() || undefined,
      });
      saveMembershipId(membership_id);
      router.push(`/onboarding/${membership_id}/goals`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "We couldn't skip payment right now. Please try again."
      );
      setDevBypassing(false);
    }
  }

  if (loading || sessionLoading) {
    return (
      <div className="w-full max-w-lg">
        <Skeleton className="h-8 w-2/3" />
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-4 h-10 w-1/3" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (loadError || !pkg) {
    return (
      <div className="w-full max-w-lg">
        <ErrorState
          title="Package unavailable"
          description={loadError ?? "This package could not be loaded."}
          onRetry={() => router.refresh()}
        />
        <div className="mt-6 text-center">
          <Link href="/pricing" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
            Back to pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-3xl gap-6 lg:grid-cols-[1fr_1.2fr]">
      <GlassPanel className="h-fit">
        <p className="text-xs font-medium uppercase tracking-wide text-fog-500">Your package</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-fog-100">{pkg.name}</h1>
        <p className="mt-2 text-sm text-fog-300">{pkg.description}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-fog-100">
            {formatPrice(pkg.price_cents, pkg.currency)}
          </span>
          <span className="text-sm text-fog-400">
            / {BILLING_INTERVAL_LABELS[pkg.billing_interval] ?? pkg.billing_interval}
          </span>
        </div>
        <ul className="mt-6 flex flex-col gap-2.5">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-fog-300">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.415l-7.005 7.005a1 1 0 01-1.414 0L4.296 9.72a1 1 0 111.414-1.414l3.283 3.282 6.297-6.297a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <Link href="/pricing" className="mt-6 inline-block text-sm text-fog-400 hover:text-fog-200">
          Choose a different package
        </Link>
      </GlassPanel>

      <GlassPanel>
        {submitError && (
          <div role="alert" className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        {!customer && (
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-fog-100">Create your account</h2>
            <p className="mt-1 text-sm text-fog-400">
              You'll use these details to log in and manage your coaching afterward.
            </p>
            <div className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  required
                  value={registerFields.first_name}
                  onChange={(e) => setRegisterFields((f) => ({ ...f, first_name: e.target.value }))}
                  error={registerErrors.first_name}
                />
                <Input
                  label="Last name"
                  required
                  value={registerFields.last_name}
                  onChange={(e) => setRegisterFields((f) => ({ ...f, last_name: e.target.value }))}
                  error={registerErrors.last_name}
                />
              </div>
              <Input
                label="Email"
                type="email"
                required
                value={registerFields.email}
                onChange={(e) => setRegisterFields((f) => ({ ...f, email: e.target.value }))}
                error={registerErrors.email}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  required
                  hint="At least 8 characters."
                  value={registerFields.password}
                  onChange={(e) => setRegisterFields((f) => ({ ...f, password: e.target.value }))}
                  error={registerErrors.password}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  required
                  value={registerFields.confirm_password}
                  onChange={(e) =>
                    setRegisterFields((f) => ({ ...f, confirm_password: e.target.value }))
                  }
                  error={registerErrors.confirm_password}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-fog-500">
              Already have an account?{" "}
              <Link href={`/login?next=/checkout/${pkg.slug}`} className="text-cyan-300 hover:text-cyan-200">
                Log in first
              </Link>
            </p>
          </div>
        )}

        <div>
          <h2 className="font-display text-lg font-semibold text-fog-100">Discount code</h2>
          <div className="mt-3">
            <Input
              label="Discount code (optional)"
              placeholder="e.g. WELCOME10"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-6">
          <div className="flex items-center justify-between text-sm text-fog-400">
            <span>Total due today</span>
            <span className="font-display text-lg font-semibold text-fog-100">
              {formatPrice(pkg.price_cents, pkg.currency)}
            </span>
          </div>
          <Button
            fullWidth
            size="lg"
            className="mt-5"
            loading={submitting}
            disabled={devBypassing}
            onClick={handleCompletePurchase}
          >
            Complete Purchase
          </Button>
          <p className="mt-4 text-center text-xs text-fog-500">
            You'll be redirected to Stripe's secure checkout to complete payment.
          </p>

          {DEV_BYPASS_ENABLED && (
            <div className="mt-6 rounded-xl border border-dashed border-warning/30 bg-warning/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-warning">Dev only</p>
              <p className="mt-1 text-xs text-fog-400">
                Skip Stripe and drop straight into onboarding, as if payment had already succeeded.
                Never available in production.
              </p>
              <Button
                fullWidth
                variant="secondary"
                size="sm"
                className="mt-3"
                loading={devBypassing}
                disabled={submitting}
                onClick={handleDevBypass}
              >
                Skip payment (dev)
              </Button>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
