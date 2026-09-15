import type { Metadata } from "next";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "How It Works",
  description: "The five steps from choosing a coaching programme to training inside Everfit.",
};

const STEPS = [
  {
    step: 1,
    title: "Choose your programme",
    who: "On this website",
    copy: "Browse Fat Loss, Muscle Building, Body Recomposition, Performance & Longevity, or Advanced Performance Support and pick the billing interval that suits you — monthly, 3-month, 6-month or 12-month.",
  },
  {
    step: 2,
    title: "Join",
    who: "On this website, via Stripe",
    copy: "Create your account and complete a secure recurring payment through Stripe. Your subscription starts immediately and your membership is created.",
  },
  {
    step: 3,
    title: "Complete your assessment",
    who: "On this website",
    copy: "Work through an 8-step onboarding questionnaire covering your goals, personal stats, training background, lifestyle, nutrition, and health screening. You can save progress and resume at any time.",
  },
  {
    step: 4,
    title: "Receive your personalised programme",
    who: "Behind the scenes, by your coaching team",
    copy: "Your assessment answers are reviewed against our programme assignment rules and, where needed, by a coach directly. Your account is then provisioned inside Everfit with the programme that matches your goals.",
  },
  {
    step: 5,
    title: "Continue your coaching inside Everfit",
    who: "Inside the Everfit app",
    copy: "From here on, your day-to-day training lives in Everfit: workout logging, progress tracking, check-ins and messaging your coach. Your dashboard on this website stays the place for billing and account management.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="blue" className="opacity-60" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            How coaching with us actually works
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fog-300">
            Five stages, from picking a programme to training day-to-day inside Everfit — with a
            clear line between what happens on this website and what happens once you're
            coaching.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-content">
          <ol className="flex flex-col gap-5">
            {STEPS.map((item) => (
              <li key={item.step}>
                <GlassPanel className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                  <div className="flex shrink-0 items-center gap-4 sm:w-48 sm:flex-col sm:items-start">
                    <span className="font-display text-3xl font-bold text-cyan-400">
                      {String(item.step).padStart(2, "0")}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-xs font-medium text-fog-300">
                      {item.who}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-fog-100">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-fog-300">{item.copy}</p>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col items-center gap-5 text-center">
            <p className="max-w-md text-fog-300">
              Ready to get started? Choose your programme and begin your assessment today.
            </p>
            <Link href="/pricing">
              <Button size="lg">Start Your Transformation</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
