"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { RadioCard } from "@/components/ui/RadioCard";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS = [
  { value: "beginner", title: "Beginner", description: "New to structured training, or under a year." },
  { value: "intermediate", title: "Intermediate", description: "1–3 years of consistent training." },
  { value: "advanced", title: "Advanced", description: "3+ years of consistent, structured training." },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} days` }));

const SESSION_DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "75", label: "75 minutes" },
  { value: "90", label: "90+ minutes" },
];

const EQUIPMENT_OPTIONS = [
  "Dumbbells",
  "Barbell & plates",
  "Resistance bands",
  "Pull-up bar",
  "Bench",
  "Kettlebells",
  "Cardio machine",
  "No equipment",
];

export default function TrainingStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [experience, setExperience] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setExperience(data.training_experience ?? "");
      setDaysPerWeek(data.training_days_per_week != null ? String(data.training_days_per_week) : "");
      setPreferredDays(data.preferred_training_days ?? []);
      setLocation(data.training_location ?? "");
      setEquipment(data.equipment ?? []);
      setSessionDuration(
        data.session_duration_minutes != null ? String(data.session_duration_minutes) : ""
      );
    }
  }, [data]);

  function toggleDay(day: string) {
    setPreferredDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function toggleEquipment(item: string) {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

  async function handleContinue() {
    if (!experience || !daysPerWeek || !location || !sessionDuration) {
      setFormError("Please complete all required fields to continue.");
      return;
    }
    setFormError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 3, {
        training_experience: experience,
        training_days_per_week: Number(daysPerWeek),
        preferred_training_days: preferredDays,
        training_location: location,
        equipment: location === "home" ? equipment : [],
        session_duration_minutes: Number(sessionDuration),
      });
      router.push(`/onboarding/${params.membershipId}/lifestyle`);
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
      step={3}
      title="Your training setup"
      description="This determines the structure, equipment and split your programme is built around."
      payoff="Your experience, location and equipment decide the actual exercises, split and progression scheme your coach builds — not just the theme of the programme."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-fog-200">
            Training experience <span className="text-cyan-400">*</span>
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <RadioCard
                key={option.value}
                name="experience"
                value={option.value}
                checked={experience === option.value}
                onChange={setExperience}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-fog-200">
            Where do you train? <span className="text-cyan-400">*</span>
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <RadioCard
              name="location"
              value="gym"
              checked={location === "gym"}
              onChange={setLocation}
              title="Gym"
              description="Access to a commercial or home gym with full equipment."
            />
            <RadioCard
              name="location"
              value="home"
              checked={location === "home"}
              onChange={setLocation}
              title="Home"
              description="Training at home with limited or no equipment."
            />
          </div>
        </fieldset>

        {location === "home" && (
          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-fog-200">Equipment available</legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <Checkbox
                  key={item}
                  label={item}
                  checked={equipment.includes(item)}
                  onChange={() => toggleEquipment(item)}
                />
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Select
            label="Training days per week"
            required
            options={DAYS_PER_WEEK_OPTIONS}
            placeholder="Select"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
          />
          <Select
            label="Preferred session duration"
            required
            options={SESSION_DURATION_OPTIONS}
            placeholder="Select"
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
          />
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-fog-200">Preferred training days</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = preferredDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                    active
                      ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300"
                      : "border-white/12 bg-white/[0.03] text-fog-300 hover:border-white/25"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </fieldset>

        {formError && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {formError}
          </p>
        )}

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/personal`}
          onContinue={handleContinue}
          loading={saving}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
