"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (desk job, little movement)" },
  { value: "lightly_active", label: "Lightly active (some walking, light activity)" },
  { value: "moderately_active", label: "Moderately active (on your feet regularly)" },
  { value: "very_active", label: "Very active (physically demanding job)" },
  { value: "extremely_active", label: "Extremely active (manual labour or 2x training)" },
];

const SLEEP_QUALITY_OPTIONS = [
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

const STRESS_LEVELS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

export default function LifestyleStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [occupation, setOccupation] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [dailySteps, setDailySteps] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setOccupation(data.occupation ?? "");
      setActivityLevel(data.activity_level ?? "");
      setDailySteps(data.daily_steps != null ? String(data.daily_steps) : "");
      setSleepHours(data.sleep_hours != null ? String(data.sleep_hours) : "");
      setSleepQuality(data.sleep_quality ?? "");
      setStressLevel(data.stress_level ?? "");
    }
  }, [data]);

  function validate() {
    const next: Record<string, string> = {};
    if (!occupation.trim()) next.occupation = "Please tell us your occupation.";
    if (!activityLevel) next.activityLevel = "Please select your activity level.";
    if (!stressLevel) next.stressLevel = "Please select your typical stress level.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleContinue() {
    if (!validate()) return;
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 4, {
        occupation,
        activity_level: activityLevel,
        daily_steps: dailySteps ? Number(dailySteps) : null,
        sleep_hours: sleepHours ? Number(sleepHours) : null,
        sleep_quality: sleepQuality || null,
        stress_level: stressLevel,
      });
      router.push(`/onboarding/${params.membershipId}/nutrition`);
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
      step={4}
      title="Your lifestyle"
      description="Training and nutrition only work if they fit around your actual life."
      payoff="Sleep, stress and activity outside the gym directly affect how much training you can actually recover from — this is how your coach avoids prescribing more than you can handle."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Occupation"
            required
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            error={errors.occupation}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Activity level"
            required
            options={ACTIVITY_LEVELS}
            placeholder="Select your activity level"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            error={errors.activityLevel}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Average daily steps"
            type="number"
            inputMode="numeric"
            hint="A rough estimate is fine."
            value={dailySteps}
            onChange={(e) => setDailySteps(e.target.value)}
          />
          <Input
            label="Average sleep (hours per night)"
            type="number"
            inputMode="decimal"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
          <Select
            label="Sleep quality"
            options={SLEEP_QUALITY_OPTIONS}
            placeholder="Select"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value)}
          />
          <Select
            label="Typical stress level"
            required
            options={STRESS_LEVELS}
            placeholder="Select"
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value)}
            error={errors.stressLevel}
          />
        </div>

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/training`}
          onContinue={handleContinue}
          loading={saving}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
