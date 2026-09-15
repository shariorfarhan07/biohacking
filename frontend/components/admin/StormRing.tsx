"use client";

/*
 * The circular progress ring — the console's signature moment, echoing
 * Framer's own Core Web Vitals / Experience Score rings. The stroke sweeps
 * in once on mount or a real value change; see .storm-ring-arc in
 * storm.css for the reduced-motion guard.
 */

import { useEffect, useRef, useState } from "react";

const TONE_VAR: Record<"ok" | "signal" | "pending" | "accent", string> = {
  ok: "var(--ok)",
  signal: "var(--signal)",
  pending: "var(--pending)",
  accent: "var(--accent)",
};

export function StormRing({
  value,
  size = 72,
  strokeWidth = 6,
  tone = "ok",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: "ok" | "signal" | "pending" | "accent";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const [display, setDisplay] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplay(clamped));
    mounted.current = true;
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          className="storm-ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONE_VAR[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="tnum absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">
        {clamped}%
      </span>
    </div>
  );
}
