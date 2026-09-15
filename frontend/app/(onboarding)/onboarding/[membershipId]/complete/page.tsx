"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { everfitApi, ApiError } from "@/lib/api-client";
import type { EverfitStatusResponse } from "@/lib/types";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 120000;

export default function OnboardingCompletePage() {
  const [status, setStatus] = useState<EverfitStatusResponse | null>(null);
  const [phase, setPhase] = useState<"loading" | "pending" | "activated" | "failed" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      if (cancelled) return;
      try {
        const result = await everfitApi.status();
        if (cancelled) return;
        setStatus(result);

        if (result.status === "activated") {
          setPhase("activated");
          return;
        }
        if (result.status === "failed") {
          setPhase("failed");
          return;
        }

        setPhase("pending");
        if (Date.now() - startedAt > MAX_POLL_MS) {
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setPhase("error");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "loading" || phase === "pending") {
    return (
      <GlassPanel className="w-full max-w-md text-center">
        <div
          className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"
          aria-hidden="true"
        />
        <h1 className="mt-5 font-display text-xl font-bold text-fog-100">
          Setting up your coaching account
        </h1>
        <p className="mt-3 text-sm text-fog-300">
          Your payment was successful. We are preparing your coaching account inside Everfit —
          this usually takes a minute or two.
        </p>
      </GlassPanel>
    );
  }

  if (phase === "failed" || phase === "error") {
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
          We couldn't complete your coaching account setup
        </h1>
        <p className="mt-3 text-sm text-fog-300">
          Our team has been notified and will resolve this shortly — no action is needed from
          you. You can check your dashboard for updates, or contact us if you'd like to know
          more.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost">Contact us</Button>
          </Link>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      className="fade-rise-in w-full max-w-md text-center"
      onAnimationEnd={(event) => event.currentTarget.classList.remove("fade-rise-in")}
    >
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-success/20 blur-xl"
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <h1 className="mt-5 font-display text-xl font-bold text-fog-100">
        Your coaching account is ready
      </h1>
      {status?.programme_name && (
        <p className="mt-2 inline-flex items-center rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300">
          {status.programme_name}
        </p>
      )}
      <p className="mt-4 text-sm text-fog-300">
        Your programme has been built and your Everfit account is active. Open Everfit to see
        your first session and start logging your training.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-fog-300">
        <p className="font-medium text-fog-100">Getting started in Everfit</p>
        <ul className="mt-2 flex flex-col gap-1.5 pl-4">
          <li className="list-disc">Download the Everfit app, or open it in your browser</li>
          <li className="list-disc">Log in using the email address you registered with</li>
          <li className="list-disc">Turn on notifications so you don't miss coach messages</li>
        </ul>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <a
            href="https://apps.apple.com/us/app/everfit-train-smart/id1438926364"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-3.5 py-2 text-fog-100 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.365 1.43c0 1.14-.415 2.207-1.244 3.02-.86.86-2.135 1.487-3.185 1.4-.135-1.11.42-2.27 1.23-3.06.83-.81 2.25-1.4 3.2-1.36zM20.8 17.1c-.54 1.24-.8 1.79-1.5 2.88-.97 1.51-2.34 3.4-4.05 3.42-1.52.02-1.9-.99-3.96-.98-2.05.01-2.47 1-4 .98-1.7-.02-3-1.72-3.97-3.23-2.72-4.2-3.01-9.13-1.33-11.76 1.19-1.87 3.07-2.96 4.83-2.96 1.8 0 2.92 1 4.4 1 1.44 0 2.3-1 4.4-1 1.57 0 3.24.86 4.42 2.34-3.89 2.13-3.26 7.7.76 9.31z" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block text-[10px] uppercase tracking-wide text-fog-400">Download on the</span>
              <span className="block text-sm font-medium">App Store</span>
            </span>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.everfit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-3.5 py-2 text-fog-100 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4.5 3.5v17c0 .4.44.66.79.46l14.14-8.5a.53.53 0 000-.92L5.3 3.04a.53.53 0 00-.8.46z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block text-[10px] uppercase tracking-wide text-fog-400">Get it on</span>
              <span className="block text-sm font-medium">Google Play</span>
            </span>
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {status?.access_url && (
          <a href={status.access_url} target="_blank" rel="noopener noreferrer">
            <Button>Open Everfit</Button>
          </a>
        )}
        <Link href="/dashboard">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>
    </GlassPanel>
  );
}
