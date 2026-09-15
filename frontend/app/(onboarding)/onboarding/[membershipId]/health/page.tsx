"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { Textarea } from "@/components/ui/Textarea";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const SCREENING_QUESTIONS = [
  {
    key: "chest_pain_or_dizziness",
    question: "Do you ever feel pain, discomfort, or dizziness in your chest during physical activity?",
  },
  {
    key: "doctor_advised_against_exercise",
    question: "Has a doctor ever advised you against exercise, or advised only medically supervised exercise?",
  },
  {
    key: "joint_or_bone_condition",
    question: "Do you have a joint, bone, or muscle condition that could be aggravated by exercise?",
  },
  {
    key: "lose_balance_or_consciousness",
    question: "Do you ever lose your balance because of dizziness, or lose consciousness?",
  },
  {
    key: "heart_condition",
    question: "Has a doctor ever told you that you have a heart condition?",
  },
] as const;

export default function HealthStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [injuries, setInjuries] = useState("");
  const [physicalLimitations, setPhysicalLimitations] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setInjuries(data.injuries ?? "");
      setPhysicalLimitations(data.physical_limitations ?? "");
      const answers = data.health_screening_answers ?? {};
      const normalised: Record<string, boolean> = {};
      SCREENING_QUESTIONS.forEach((q) => {
        normalised[q.key] = Boolean(answers[q.key]);
      });
      setScreeningAnswers(normalised);
    }
  }, [data]);

  function answerQuestion(key: string, value: boolean) {
    setScreeningAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleContinue() {
    const unanswered = SCREENING_QUESTIONS.some((q) => !(q.key in screeningAnswers));
    if (unanswered) {
      setFormError("Please answer every screening question — this never blocks your signup.");
      return;
    }
    setFormError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 6, {
        injuries: injuries || null,
        physical_limitations: physicalLimitations || null,
        health_screening_answers: screeningAnswers,
      });
      router.push(`/onboarding/${params.membershipId}/photos`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "We couldn't save your answers. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepLayout
      step={6}
      title="Health & limitations"
      description="Standard pre-exercise screening questions — this is not a diagnosis, and answering yes never blocks your signup. It simply helps your coach train you safely."
      payoff="Standard pre-exercise screening. Answering yes to any question never blocks your signup — it just flags something for your coach to account for in your programme."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Textarea
            label="Current or past injuries"
            hint="Leave blank if none."
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Physical limitations"
            hint="Leave blank if none."
            value={physicalLimitations}
            onChange={(e) => setPhysicalLimitations(e.target.value)}
            rows={3}
          />
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium text-fog-200">Pre-exercise screening</legend>
          <div className="mt-3 flex flex-col gap-3">
            {SCREENING_QUESTIONS.map((q) => {
              const answer = screeningAnswers[q.key];
              return (
                <div
                  key={q.key}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-fog-200">{q.question}</p>
                  <div className="flex shrink-0 gap-2" role="group" aria-label={q.question}>
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        aria-pressed={answer === option.value}
                        onClick={() => answerQuestion(q.key, option.value)}
                        className={cn(
                          "rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                          answer === option.value
                            ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300"
                            : "border-white/12 bg-transparent text-fog-300 hover:border-white/25"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {formError && (
            <p className="mt-3 text-sm text-danger" role="alert">
              {formError}
            </p>
          )}
        </fieldset>

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/nutrition`}
          onContinue={handleContinue}
          loading={saving}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
