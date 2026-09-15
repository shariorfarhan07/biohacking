"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminSession } from "@/lib/session-context";
import { AdminShell } from "./AdminShell";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginRoute && !loading && !admin) {
      router.replace("/admin/login");
    }
  }, [isLoginRoute, loading, admin, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <p className="storm-legend text-rain" role="status" aria-live="polite">
          Loading…
        </p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
