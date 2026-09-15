import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  labels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabel,
  labels,
}: ProgressIndicatorProps) {
  const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div role="group" aria-label="Onboarding progress" className="w-full">
      <div className="mb-2.5 flex items-center justify-between text-sm">
        <span className="font-medium text-fog-200">
          Step {currentStep} of {totalSteps}
        </span>
        {stepLabel && <span className="text-fog-400">{stepLabel}</span>}
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accentblue-600 to-cyan-400 transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      {labels && (
        <ol className="mt-3 hidden justify-between text-xs text-fog-500 sm:flex">
          {labels.map((label, idx) => (
            <li
              key={label}
              className={cn(
                idx + 1 <= currentStep ? "text-cyan-300" : "text-fog-500",
                "flex-1 text-center first:text-left last:text-right"
              )}
            >
              {label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
