import type { Metadata } from "next";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { PricingBrowser } from "@/components/marketing/PricingBrowser";
import { serverFetch } from "@/lib/server-api";
import type { Package } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Coaching packages and pricing — monthly, 3-month, 6-month and 12-month billing.",
};

export default async function PricingPage() {
  let packages: Package[] | null = null;
  let errorMessage: string | null = null;

  try {
    packages = await serverFetch<Package[]>("/packages");
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "We couldn't load pricing right now.";
  }

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <GlowBackground variant="mixed" className="opacity-50" />
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Coaching packages
          </h1>
          <p className="mt-5 text-lg text-fog-300">
            Every package includes a personalised programme, ongoing coach support inside Everfit,
            and the same onboarding assessment. Choose the billing interval that suits you.
          </p>
        </div>

        <div className="mt-14">
          <PricingBrowser initialPackages={packages} initialErrorMessage={errorMessage} />
        </div>
      </div>
    </section>
  );
}
