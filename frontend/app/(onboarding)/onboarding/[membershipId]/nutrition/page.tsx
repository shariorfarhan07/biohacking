"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";

const FOOD_PREFERENCES = [
  "Omnivore",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Kosher",
];

const MEALS_PER_DAY = [1, 2, 3, 4, 5, 6].map((n) => ({
  value: String(n),
  label: n === 6 ? "6+" : String(n),
}));

const COOKING_ABILITY = [
  { value: "beginner", label: "Beginner — keep it simple" },
  { value: "intermediate", label: "Intermediate — comfortable cooking" },
  { value: "advanced", label: "Advanced — happy to cook anything" },
];

const FOOD_BUDGET = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function NutritionStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [calorieIntake, setCalorieIntake] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [intolerances, setIntolerances] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [cookingAbility, setCookingAbility] = useState("");
  const [foodBudget, setFoodBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setCalorieIntake(data.current_calorie_intake != null ? String(data.current_calorie_intake) : "");
      setPreferences(data.food_preferences ?? []);
      setAllergies(data.allergies ?? "");
      setIntolerances(data.intolerances ?? "");
      setMealsPerDay(data.meals_per_day != null ? String(data.meals_per_day) : "");
      setCookingAbility(data.cooking_ability ?? "");
      setFoodBudget(data.food_budget ?? "");
    }
  }, [data]);

  function togglePreference(pref: string) {
    setPreferences((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!mealsPerDay) next.mealsPerDay = "Please select how many meals you typically eat.";
    if (!cookingAbility) next.cookingAbility = "Please select your cooking ability.";
    if (!foodBudget) next.foodBudget = "Please select your food budget.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleContinue() {
    if (!validate()) return;
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 5, {
        current_calorie_intake: calorieIntake ? Number(calorieIntake) : null,
        food_preferences: preferences,
        allergies: allergies || null,
        intolerances: intolerances || null,
        meals_per_day: Number(mealsPerDay),
        cooking_ability: cookingAbility,
        food_budget: foodBudget,
      });
      router.push(`/onboarding/${params.membershipId}/health`);
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
      step={5}
      title="Your nutrition"
      description="This shapes your calorie and food plan — there are no wrong answers here."
      payoff="These answers become your starting calorie and macro targets — answered honestly rather than aspirationally, so the plan actually fits your life."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <Input
          label="Current daily calorie intake (if known)"
          type="number"
          inputMode="numeric"
          hint="Leave blank if you don't track calories."
          value={calorieIntake}
          onChange={(e) => setCalorieIntake(e.target.value)}
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-fog-200">Food preferences</legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {FOOD_PREFERENCES.map((pref) => (
              <Checkbox
                key={pref}
                label={pref}
                checked={preferences.includes(pref)}
                onChange={() => togglePreference(pref)}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            label="Allergies"
            hint="Leave blank if none."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
          <Input
            label="Intolerances"
            hint="Leave blank if none."
            value={intolerances}
            onChange={(e) => setIntolerances(e.target.value)}
          />
          <Select
            label="Meals per day"
            required
            options={MEALS_PER_DAY}
            placeholder="Select"
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(e.target.value)}
            error={errors.mealsPerDay}
          />
          <Select
            label="Cooking ability"
            required
            options={COOKING_ABILITY}
            placeholder="Select"
            value={cookingAbility}
            onChange={(e) => setCookingAbility(e.target.value)}
            error={errors.cookingAbility}
          />
          <Select
            label="Food budget"
            required
            options={FOOD_BUDGET}
            placeholder="Select"
            value={foodBudget}
            onChange={(e) => setFoodBudget(e.target.value)}
            error={errors.foodBudget}
          />
        </div>

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/lifestyle`}
          onContinue={handleContinue}
          loading={saving}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
