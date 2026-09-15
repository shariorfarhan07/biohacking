"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { RadioCard } from "@/components/ui/RadioCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";

const GOAL_OPTIONS = [
  { value: "fat_loss", title: "Fat loss", description: "Reduce body fat while holding onto muscle." },
  { value: "muscle_building", title: "Muscle building", description: "Build size and strength over time." },
  { value: "recomposition", title: "Body recomposition", description: "Build muscle and lose fat together." },
  { value: "performance", title: "Performance", description: "Get stronger, fitter and more capable." },
  { value: "general_health", title: "General health", description: "Build a sustainable, healthy routine." },
];

const BODY_COMPOSITION_OPTIONS = [
  { value: "", label: "No specific preference" },
  { value: "lean_athletic", label: "Lean and athletic" },
  { value: "muscular_defined", label: "Muscular and defined" },
  { value: "bigger_stronger", label: "Bigger and stronger overall" },
  { value: "toned_maintain", label: "Toned, focused on maintenance" },
];

export default function GoalsStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [goal, setGoal] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [bodyCompositionGoal, setBodyCompositionGoal] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setGoal(data.goal ?? "");
      setTargetWeight(data.target_weight_kg != null ? String(data.target_weight_kg) : "");
      setBodyCompositionGoal(data.body_composition_goal ?? "");
    }
  }, [data]);

  async function handleContinue() {
    if (!goal) {
      setFormError("Please select your primary goal to continue.");
      return;
    }
    setFormError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 1, {
        goal,
        target_weight_kg: targetWeight ? Number(targetWeight) : null,
        body_composition_goal: bodyCompositionGoal || null,
      });
      router.push(`/onboarding/${params.membershipId}/personal`);
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
      step={1}
      title="What's your primary goal?"
      description="This shapes the coaching programme you're matched with. You can always discuss adjustments with your coach later."
      payoff="Your primary goal is the single biggest input into programme selection — it sets the entire training and nutrition direction before anything else is considered."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-fog-200">
            Primary goal <span className="text-cyan-400">*</span>
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {GOAL_OPTIONS.map((option) => (
              <RadioCard
                key={option.value}
                name="goal"
                value={option.value}
                checked={goal === option.value}
                onChange={setGoal}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
          {formError && (
            <p className="mt-2 text-xs text-danger" role="alert">
              {formError}
            </p>
          )}
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            label="Target weight (kg)"
            type="number"
            inputMode="decimal"
            min={30}
            max={250}
            hint="Optional — leave blank if you're not sure."
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
          />
          <Select
            label="Desired body composition"
            options={BODY_COMPOSITION_OPTIONS.filter((o) => o.value !== "")}
            placeholder="No specific preference"
            value={bodyCompositionGoal}
            onChange={(e) => setBodyCompositionGoal(e.target.value)}
          />
        </div>

        <OnboardingFooterNav onContinue={handleContinue} loading={saving} />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
