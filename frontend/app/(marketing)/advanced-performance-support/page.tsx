import type { Metadata } from "next";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "Advanced Performance Support",
  description:
    "Coaching support for men optimizing performance at an advanced level — training, nutrition and lifestyle systems, with a clear medical boundary.",
};

export default function AdvancedPerformanceSupportPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-10 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="violet" className="opacity-40" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Advanced Performance Support
          </h1>

          <div
            role="alert"
            className="mt-8 rounded-2xl border border-warning/40 bg-warning/[0.08] p-6 sm:p-7"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.72 0z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-fog-100">
                  This is a coaching service, not a medical service
                </h2>
                <p className="mt-2 text-sm text-fog-200">
                  Advanced Performance Support does not prescribe medication. It does not
                  recommend or adjust doses of steroids, TRT, or peptides. It does not diagnose
                  medical conditions. Any individual medical decision — including anything related
                  to hormones, medication, or a diagnosed condition — must go through an
                  appropriately qualified, independent medical professional. Nothing on this page
                  or provided through this programme should be treated as medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-content">
          <GlassPanel className="max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-fog-100">
              What Advanced Performance Support covers
            </h2>
            <p className="mt-4 text-sm text-fog-300">
              Advanced Performance Support is built for men who are already training and eating
              with discipline and want a coach thinking about the systems around performance in
              more depth — how training load, nutrition, sleep and recovery interact, and how to
              structure them for someone training at an advanced level.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-fog-100">What's included</h3>
                <ul className="mt-3 flex flex-col gap-2.5 text-sm text-fog-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    Advanced training periodisation across multi-month blocks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    Nutrition periodisation, including nutrient timing and cycling
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    Recovery and lifestyle monitoring (sleep, stress, training load)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    Priority coach messaging for faster plan adjustments
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fog-100">What's never included</h3>
                <ul className="mt-3 flex flex-col gap-2.5 text-sm text-fog-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    Medication prescriptions of any kind
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    Dosing advice for steroids, TRT, or peptides
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    Diagnosis of any medical condition
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    Any substitute for advice from a qualified doctor
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-8 text-sm text-fog-400">
              If you're already working with a doctor on hormone therapy or another medical
              protocol, your coach can work alongside that from a training and nutrition
              perspective — but all medical decisions remain between you and your medical
              provider.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing">
                <Button>Choose This Programme</Button>
              </Link>
              <Link href="/faq">
                <Button variant="secondary">Read the FAQ</Button>
              </Link>
            </div>
          </GlassPanel>
        </div>
      </section>
    </>
  );
}
