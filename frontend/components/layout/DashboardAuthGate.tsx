"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { DashboardShell } from "./DashboardShell";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [loading, customer, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian-950 px-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
