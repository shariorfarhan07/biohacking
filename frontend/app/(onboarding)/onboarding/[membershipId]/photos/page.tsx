"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepLayout } from "@/components/onboarding/OnboardingStepLayout";
import { OnboardingStateGate } from "@/components/onboarding/OnboardingStateGate";
import { OnboardingFooterNav } from "@/components/onboarding/OnboardingFooterNav";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { onboardingApi, ApiError } from "@/lib/api-client";

type SlotKey = "front" | "side" | "back";

const SLOTS: { key: SlotKey; label: string; hint: string }[] = [
  { key: "front", label: "Front", hint: "Standing straight, facing the camera." },
  { key: "side", label: "Side", hint: "Standing straight, facing sideways." },
  { key: "back", label: "Back", hint: "Standing straight, back to the camera." },
];

export default function PhotosStepPage({ params }: { params: { membershipId: string } }) {
  const router = useRouter();
  const { data, loading, error, refetch } = useOnboardingState(params.membershipId);

  const [photos, setPhotos] = useState<Record<SlotKey, { file: File; previewUrl: string } | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [alreadyProvided, setAlreadyProvided] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputs = useRef<Record<SlotKey, HTMLInputElement | null>>({
    front: null,
    side: null,
    back: null,
  });

  useEffect(() => {
    if (data) {
      setAlreadyProvided(Boolean(data.progress_photos_provided));
    }
  }, [data]);

  useEffect(() => {
    return () => {
      Object.values(photos).forEach((p) => p && URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelect(slot: SlotKey, file: File | undefined) {
    if (!file) return;
    setPhotos((prev) => {
      const existing = prev[slot];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      return { ...prev, [slot]: { file, previewUrl: URL.createObjectURL(file) } };
    });
  }

  function handleRemove(slot: SlotKey) {
    setPhotos((prev) => {
      const existing = prev[slot];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      return { ...prev, [slot]: null };
    });
  }

  const hasAnyPhoto = Object.values(photos).some(Boolean) || alreadyProvided;

  async function handleContinue() {
    setSubmitError(null);
    setSaving(true);
    try {
      await onboardingApi.saveStep(params.membershipId, 7, {
        progress_photos_provided: hasAnyPhoto,
      });
      router.push(`/onboarding/${params.membershipId}/review`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "We couldn't save this step. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepLayout
      step={7}
      title="Progress photographs"
      description="Optional, but genuinely useful — visual progress often shows up before the scale moves. These are shared securely with your coach only."
    >
      <OnboardingStateGate loading={loading} error={error} onRetry={refetch}>
        {submitError && (
          <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-100">
          Photos are stored securely and only visible to you and your coach. You can skip this
          step entirely and add photos later from your dashboard.
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {SLOTS.map((slot) => {
            const photo = photos[slot.key];
            return (
              <div key={slot.key} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-fog-200">{slot.label}</span>
                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.02]">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.previewUrl}
                      alt={`${slot.label} progress photo preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-fog-500" aria-hidden="true">
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-xs text-fog-500">{slot.hint}</span>
                    </div>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileInputs.current[slot.key] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id={`photo-${slot.key}`}
                  onChange={(e) => handleFileSelect(slot.key, e.target.files?.[0])}
                />
                <div className="flex gap-2">
                  <label
                    htmlFor={`photo-${slot.key}`}
                    className="flex-1 cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-medium text-fog-200 transition-colors hover:border-cyan-400/40 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-400"
                  >
                    {photo ? "Replace" : "Upload"}
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => handleRemove(slot.key)}
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-fog-400 transition-colors hover:border-danger/40 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <OnboardingFooterNav
          backHref={`/onboarding/${params.membershipId}/health`}
          onContinue={handleContinue}
          loading={saving}
          continueLabel={hasAnyPhoto ? "Continue" : "Skip for now"}
        />
      </OnboardingStateGate>
    </OnboardingStepLayout>
  );
}
