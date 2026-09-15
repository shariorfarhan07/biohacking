import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

export default function CheckoutCanceledPage() {
  return (
    <GlassPanel className="w-full max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-fog-300">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-5 font-display text-xl font-bold text-fog-100">Checkout canceled</h1>
      <p className="mt-3 text-sm text-fog-300">
        No charge was made and your card was not billed. You can return to pricing whenever
        you're ready to start.
      </p>
      <Link href="/pricing" className="mt-6 inline-block">
        <Button>Back to pricing</Button>
      </Link>
    </GlassPanel>
  );
}
