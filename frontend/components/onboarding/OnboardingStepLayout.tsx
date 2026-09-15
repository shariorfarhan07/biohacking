import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { ONBOARDING_STEPS, TOTAL_ONBOARDING_STEPS } from "@/lib/constants";

interface OnboardingStepLayoutProps {
  step: number;
  title: string;
  description?: string;
  /** Short reassurance copy — why this step's answers matter. Shown in a
   * side panel on wide viewports only; omit for steps that already explain
   * themselves inline (e.g. the photos and review steps). */
  payoff?: string;
  children: React.ReactNode;
}

export function OnboardingStepLayout({
  step,
  title,
  description,
  payoff,
  children,
}: OnboardingStepLayoutProps) {
  const current = ONBOARDING_STEPS.find((s) => s.step === step);
  const labels = ONBOARDING_STEPS.map((s) => s.label);

  return (
    <div className="w-full max-w-4xl">
      <ProgressIndicator currentStep={step} totalSteps={TOTAL_ONBOARDING_STEPS} stepLabel={current?.label} labels={labels} />
      <div
        key={step}
        className="fade-rise-in mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]"
        onAnimationEnd={(event) => event.currentTarget.classList.remove("fade-rise-in")}
      >
        <div className="w-full max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-fog-100 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-fog-400">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>

        {payoff && (
          <aside className="hidden lg:block">
            <div className="sticky top-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-semibold text-fog-100">Why we ask</p>
              <p className="mt-2 text-sm leading-relaxed text-fog-400">{payoff}</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
