import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface OnboardingStateGateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export function OnboardingStateGate({ loading, error, onRetry, children }: OnboardingStateGateProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load this step"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}
