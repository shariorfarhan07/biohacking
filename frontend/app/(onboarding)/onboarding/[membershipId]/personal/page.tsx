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

const BODY_FAT_RANGES = [
  { value: "under_10", label: "Under 10%" },
  { value: "10_15", label: "10–15%" },
  { value: "15_20", label: "15–20%" },
  { value: "20_25", label: "20–25%" },
  { value: "25_30", label: "25–30%" },
  { value: "over_30", label: "Over 30%" },
  { value: "not_sure", label: "Not sure" },
];

export default function PersonalStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatRange, setBodyFatRange] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setAge(data.age != null ? String(data.age) : "");
      setHeightCm(data.height_cm != null ? String(data.height_cm) : "");
      setWeightKg(data.weight_kg != null ? String(data.weight_kg) : "");
      setBodyFatRange(data.body_fat_range ?? "");
    }
  }, [data]);

  function validate() {
    const next: Record<string, string> = {};
    if (!age || Number(age) < 16 || Number(age) > 90) next.age = "Enter an age between 16 and 90.";
    if (!heightCm || Number(heightCm) < 100 || Number(heightCm) > 250)
      next.heightCm = "Enter a height between 100 and 250cm.";
    if (!weightKg || Number(weightKg) < 30 || Number(weightKg) > 250)
      next.weightKg = "Enter a weight between 30 and 250kg.";
    if (!bodyFatRange) next.bodyFatRange = "Please select an estimated body-fat range.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleContinue() {
    if (!validate()) return;
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 2, {
        age: Number(age),
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        body_fat_range: bodyFatRange,
      });
      router.push(`/onboarding/${params.membershipId}/training`);
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
      step={2}
      title="Tell us about you"
      description="A few basic stats so your programme is calibrated correctly from day one."
      payoff="Age, height, weight and body-fat range calibrate your calorie targets and training volume — getting these roughly right makes everything downstream more accurate."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Age"
            type="number"
            required
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            error={errors.age}
          />
          <Select
            label="Estimated body-fat range"
            required
            options={BODY_FAT_RANGES}
            placeholder="Select a range"
            value={bodyFatRange}
            onChange={(e) => setBodyFatRange(e.target.value)}
            error={errors.bodyFatRange}
          />
          <Input
            label="Height (cm)"
            type="number"
            required
            inputMode="decimal"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            error={errors.heightCm}
          />
          <Input
            label="Weight (kg)"
            type="number"
            required
            inputMode="decimal"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            error={errors.weightKg}
          />
        </div>

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/goals`}
          onContinue={handleContinue}
          loading={saving}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
