import Link from "next/link";
import { SessionProvider } from "@/lib/session-context";
import { ToastProvider } from "@/components/ui/Toast";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { SITE_NAME } from "@/lib/constants";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="relative min-h-screen overflow-hidden px-5 py-10 sm:px-8">
          <GlowBackground variant="blue" className="opacity-30" />
          <header className="mx-auto w-full max-w-content">
            <Link href="/" className="font-display text-lg font-bold text-fog-100">
              {SITE_NAME}
            </Link>
          </header>
          <main className="mx-auto flex max-w-content flex-col items-center py-10">{children}</main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
