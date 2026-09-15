"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { checkoutApi, ApiError } from "@/lib/api-client";
import { saveMembershipId } from "@/lib/local-membership";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 60000;

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<"missing" | "polling" | "timeout" | "error" | "ready">(
    sessionId ? "polling" : "missing"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollKey, setPollKey] = useState(0);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    startedAt.current = Date.now();

    async function poll() {
      if (cancelled) return;
      try {
        const result = await checkoutApi.getStatus(sessionId as string);
        if (cancelled) return;

        if (result.status !== "pending_payment") {
          setState("ready");
          saveMembershipId(result.membership_id);
          router.push(`/onboarding/${result.membership_id}/goals`);
          return;
        }

        if (Date.now() - startedAt.current > MAX_POLL_MS) {
          setState("timeout");
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err instanceof ApiError ? err.message : "We couldn't confirm your payment status."
        );
        setState("error");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router, pollKey]);

  if (state === "missing") {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <h1 className="font-display text-xl font-bold text-fog-100">Missing checkout session</h1>
        <p className="mt-3 text-sm text-fog-300">
          We couldn't find a checkout session to confirm. If you just completed a payment, check
          your email for confirmation, or return to pricing to try again.
        </p>
        <Link href="/pricing" className="mt-6 inline-block">
          <Button variant="secondary">Back to pricing</Button>
        </Link>
      </GlassPanel>
    );
  }

  if (state === "error") {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.72 0z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-fog-100">
          We couldn't confirm your payment
        </h1>
        <p className="mt-3 text-sm text-fog-300">
          {errorMessage} If money has left your account, don't worry — our team will follow up by
          email, or you can contact us directly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/contact">
            <Button variant="secondary">Contact us</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost">Back to pricing</Button>
          </Link>
        </div>
      </GlassPanel>
    );
  }

  if (state === "timeout") {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 6v6l4 2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-fog-100">Still processing</h1>
        <p className="mt-3 text-sm text-fog-300">
          Your payment is still being confirmed. This can occasionally take a few minutes — we'll
          email you as soon as it's done and your onboarding is ready to begin.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              setState("polling");
              setPollKey((k) => k + 1);
            }}
          >
            Check again
          </Button>
          <Link href="/">
            <Button variant="ghost">Return home</Button>
          </Link>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="w-full max-w-md text-center">
      <div
        className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"
        aria-hidden="true"
      />
      <h1 className="mt-5 font-display text-xl font-bold text-fog-100">Confirming your payment…</h1>
      <p className="mt-3 text-sm text-fog-300">
        This usually takes just a few seconds. Please don't close this page.
      </p>
    </GlassPanel>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
