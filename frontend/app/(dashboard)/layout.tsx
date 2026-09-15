import { SessionProvider } from "@/lib/session-context";
import { ToastProvider } from "@/components/ui/Toast";
import { DashboardAuthGate } from "@/components/layout/DashboardAuthGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <DashboardAuthGate>{children}</DashboardAuthGate>
      </ToastProvider>
    </SessionProvider>
  );
}
