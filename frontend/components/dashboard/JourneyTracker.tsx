import { cn } from "@/lib/utils";

export type JourneyStageState = "done" | "current" | "error" | "upcoming";

export interface JourneyStage {
  label: string;
  detail: string;
  state: JourneyStageState;
}

export function JourneyTracker({ stages }: { stages: JourneyStage[] }) {
  const doneCount = stages.filter((s) => s.state === "done").length;
  const fillPercent =
    stages.length > 1 ? Math.min(100, (doneCount / (stages.length - 1)) * 100) : 0;

  return (
    <ol aria-label="Your coaching journey" className="relative flex items-start">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[13px] h-px bg-white/10"
        style={{ marginInline: `${100 / stages.length / 2}%` }}
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-[13px] h-px bg-gradient-to-r from-accentblue-600 to-cyan-400 transition-all duration-500 ease-out motion-reduce:transition-none"
        style={{
          marginInlineStart: `${100 / stages.length / 2}%`,
          width: `calc(${fillPercent}% * ${(stages.length - 1) / stages.length})`,
        }}
      />
      {stages.map((stage) => (
        <li
          key={stage.label}
          aria-current={stage.state === "current" ? "step" : undefined}
          className="relative flex flex-1 flex-col items-center gap-2.5 text-center"
        >
          <StageNode state={stage.state} />
          <div>
            <p
              className={cn(
                "text-xs font-medium",
                stage.state === "upcoming" ? "text-fog-500" : "text-fog-200"
              )}
            >
              {stage.label}
            </p>
            <p className="mt-0.5 text-[11px] text-fog-500">{stage.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StageNode({ state }: { state: JourneyStageState }) {
  if (state === "done") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-obsidian-950">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400 bg-obsidian-900">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-cyan-400/25 animate-ping motion-reduce:animate-none"
        />
        <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-danger bg-danger/10 text-danger">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="h-7 w-7 shrink-0 rounded-full border-2 border-white/15 bg-obsidian-900"
    />
  );
}
