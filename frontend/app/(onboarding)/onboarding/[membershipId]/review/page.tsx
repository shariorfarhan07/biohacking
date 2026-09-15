"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type { OnboardingState } from "@/lib/types";

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-sm text-fog-400">{label}</span>
      <span className="text-sm font-medium text-fog-100 sm:text-right">{value || "—"}</span>
    </div>
  );
}

function SectionCard({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-fog-100">{title}</h2>
        <Link href={editHref} className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Edit
        </Link>
      </div>
      <div className="mt-3 divide-y divide-white/8">{children}</div>
    </GlassPanel>
  );
}

function formatList(list?: string[]): string {
  return list && list.length > 0 ? list.join(", ") : "—";
}

export default function ReviewStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const base = `/onboarding/${params.membershipId}`;

  async function handleComplete() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onboardingApi.complete(params.membershipId);
      router.push(`${base}/complete`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "We couldn't complete your onboarding right now. Please try again."
      );
      setSubmitting(false);
    }
  }

  function renderContent(d: OnboardingState) {
    const screeningEntries = Object.entries(d.health_screening_answers ?? {});
    return (
      <div className="flex flex-col gap-5">
        {submitError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <SectionCard title="Goals" editHref={`${base}/goals`}>
          <SummaryRow label="Primary goal" value={d.goal ? titleCase(d.goal) : undefined} />
          <SummaryRow label="Target weight" value={d.target_weight_kg ? `${d.target_weight_kg} kg` : undefined} />
          <SummaryRow
            label="Desired body composition"
            value={d.body_composition_goal ? titleCase(d.body_composition_goal) : "No specific preference"}
          />
        </SectionCard>

        <SectionCard title="Personal" editHref={`${base}/personal`}>
          <SummaryRow label="Age" value={d.age} />
          <SummaryRow label="Height" value={d.height_cm ? `${d.height_cm} cm` : undefined} />
          <SummaryRow label="Weight" value={d.weight_kg ? `${d.weight_kg} kg` : undefined} />
          <SummaryRow
            label="Estimated body-fat range"
            value={d.body_fat_range ? titleCase(d.body_fat_range) : undefined}
          />
        </SectionCard>

        <SectionCard title="Training" editHref={`${base}/training`}>
          <SummaryRow
            label="Experience"
            value={d.training_experience ? titleCase(d.training_experience) : undefined}
          />
          <SummaryRow label="Days per week" value={d.training_days_per_week} />
          <SummaryRow label="Preferred days" value={formatList(d.preferred_training_days)} />
          <SummaryRow
            label="Location"
            value={d.training_location ? titleCase(d.training_location) : undefined}
          />
          {d.training_location === "home" && (
            <SummaryRow label="Equipment" value={formatList(d.equipment)} />
          )}
          <SummaryRow
            label="Session duration"
            value={d.session_duration_minutes ? `${d.session_duration_minutes} minutes` : undefined}
          />
        </SectionCard>

        <SectionCard title="Lifestyle" editHref={`${base}/lifestyle`}>
          <SummaryRow label="Occupation" value={d.occupation} />
          <SummaryRow label="Activity level" value={d.activity_level ? titleCase(d.activity_level) : undefined} />
          <SummaryRow label="Daily steps" value={d.daily_steps} />
          <SummaryRow label="Sleep" value={d.sleep_hours ? `${d.sleep_hours} hours` : undefined} />
          <SummaryRow label="Stress level" value={d.stress_level ? titleCase(d.stress_level) : undefined} />
        </SectionCard>

        <SectionCard title="Nutrition" editHref={`${base}/nutrition`}>
          <SummaryRow
            label="Current calorie intake"
            value={d.current_calorie_intake ? `${d.current_calorie_intake} kcal` : "Not tracked"}
          />
          <SummaryRow label="Food preferences" value={formatList(d.food_preferences)} />
          <SummaryRow label="Allergies" value={d.allergies || "None"} />
          <SummaryRow label="Intolerances" value={d.intolerances || "None"} />
          <SummaryRow label="Meals per day" value={d.meals_per_day} />
          <SummaryRow label="Cooking ability" value={d.cooking_ability ? titleCase(d.cooking_ability) : undefined} />
          <SummaryRow label="Food budget" value={d.food_budget ? titleCase(d.food_budget) : undefined} />
        </SectionCard>

        <SectionCard title="Health & limitations" editHref={`${base}/health`}>
          <SummaryRow label="Injuries" value={d.injuries || "None reported"} />
          <SummaryRow label="Physical limitations" value={d.physical_limitations || "None reported"} />
          {screeningEntries.map(([key, value]) => (
            <SummaryRow key={key} label={titleCase(key)} value={value ? "Yes" : "No"} />
          ))}
        </SectionCard>

        <SectionCard title="Progress photographs" editHref={`${base}/photos`}>
          <SummaryRow
            label="Photos provided"
            value={d.progress_photos_provided ? "Yes" : "Not provided yet"}
          />
        </SectionCard>

        <GlassPanel className="text-center">
          <h2 className="font-display text-lg font-semibold text-fog-100">Ready to submit?</h2>
          <p className="mt-2 text-sm text-fog-400">
            Once submitted, your coaching account will be provisioned based on these answers. You
            can still update most details later from your dashboard.
          </p>
          <Button size="lg" className="mt-5" loading={submitting} onClick={handleComplete}>
            Complete Onboarding
          </Button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <OnboardingStepLayout
      step={8}
      title="Review your answers"
      description="Take a moment to check everything looks right before we build your programme."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {data && renderContent(data)}
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
