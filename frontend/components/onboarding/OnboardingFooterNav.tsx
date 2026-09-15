"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface OnboardingFooterNavProps {
  backHref?: string;
  onContinue: () => void;
  continueLabel?: string;
  loading?: boolean;
  continueDisabled?: boolean;
}

export function OnboardingFooterNav({
  backHref,
  onContinue,
  continueLabel = "Continue",
  loading,
  continueDisabled,
}: OnboardingFooterNavProps) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/8 pt-6">
      {backHref ? (
        <Link href={backHref}>
          <Button type="button" variant="ghost">
            Back
          </Button>
        </Link>
      ) : (
        <span />
      )}
      <Button type="button" onClick={onContinue} loading={loading} disabled={continueDisabled}>
        {continueLabel}
      </Button>
    </div>
  );
}
