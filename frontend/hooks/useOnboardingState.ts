"use client";

import { useCallback, useEffect, useState } from "react";
import { onboardingApi, ApiError } from "@/lib/api-client";
import { saveMembershipId } from "@/lib/local-membership";
import type { OnboardingState } from "@/lib/types";

export function useOnboardingState(membershipId: string) {
  const [data, setData] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveMembershipId(membershipId);
  }, [membershipId]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onboardingApi.get(membershipId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't load your onboarding progress. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [membershipId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
