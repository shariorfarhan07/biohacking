import type { Metadata } from "next";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "Results",
  description: "Example outcomes illustrating what our coaching programmes are designed to produce.",
};

interface ExampleResult {
  label: string;
  programme: string;
  duration: string;
  headline: string;
  before: string;
  after: string;
  stats: { label: string; value: string }[];
}

const EXAMPLE_RESULTS: ExampleResult[] = [
  {
    label: "Client A — Example",
    programme: "Fat Loss",
    duration: "16-week programme",
    headline: "Illustrative example: a structured cut with strength maintained",
    before:
      "Started the programme with inconsistent training, no calorie tracking, and difficulty staying consistent with a plan for more than a few weeks at a time.",
    after:
      "Followed a structured resistance training split four days a week with a calorie target that flexed around adherence, plus weekly coach check-ins.",
    stats: [
      { label: "Body weight change", value: "−9.1kg (illustrative)" },
      { label: "Strength", value: "Maintained across all lifts" },
      { label: "Programme length", value: "16 weeks" },
    ],
  },
  {
    label: "Client B — Example",
    programme: "Muscle Building",
    duration: "24-week programme",
    headline: "Illustrative example: progressive overload over two blocks",
    before:
      "Training with a generic online programme, plateaued on major lifts, and eating inconsistently with no clear surplus target.",
    after:
      "Moved to a periodised progressive overload programme across two 12-week blocks with a defined calorie surplus and protein target, adjusted monthly.",
    stats: [
      { label: "Lean mass change", value: "+7.4kg (illustrative)" },
      { label: "Compound lift totals", value: "+22% (illustrative)" },
      { label: "Programme length", value: "24 weeks" },
    ],
  },
  {
    label: "Client C — Example",
    programme: "Body Recomposition",
    duration: "20-week programme",
    headline: "Illustrative example: building muscle while leaning out",
    before:
      "Wanted to look leaner and more muscular but was unsure whether to prioritise a cut or a bulk, and had stalled trying to do both without a plan.",
    after:
      "Followed a recomposition programme with training-day nutrient cycling and a structured strength programme, tracked with monthly measurements.",
    stats: [
      { label: "Body fat change", value: "−6% (illustrative)" },
      { label: "Waist measurement", value: "−7cm (illustrative)" },
      { label: "Programme length", value: "20 weeks" },
    ],
  },
];

export default function ResultsPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="cyan" className="opacity-50" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            What our coaching is designed to produce
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-fog-300">
            The examples below are illustrative, not verified client testimonials. They describe
            the kind of change our programmes are structured to deliver — names and figures are
            fictional placeholders, clearly labelled as examples.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.72 0z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Every entry on this page is an example, not a real client record.
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-content flex-col gap-6">
          {EXAMPLE_RESULTS.map((result) => (
            <GlassPanel key={result.label}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold text-fog-100">
                    {result.label}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-1 text-xs font-medium text-fog-400">
                    Example
                  </span>
                </div>
                <span className="text-sm text-fog-400">
                  {result.programme} &middot; {result.duration}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-fog-100">
                {result.headline}
              </h2>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-fog-500">
                    Before
                  </h3>
                  <p className="mt-2 text-sm text-fog-300">{result.before}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-fog-500">
                    After
                  </h3>
                  <p className="mt-2 text-sm text-fog-300">{result.after}</p>
                </div>
                <div className="flex flex-row gap-4 lg:flex-col lg:gap-3">
                  {result.stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <p className="text-xs text-fog-500">{stat.label}</p>
                      <p className="mt-1 font-display text-base font-semibold text-cyan-300">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-content flex-col items-center gap-5 text-center">
          <p className="max-w-md text-fog-300">
            Ready to start building your own results? Choose a programme and begin your
            assessment.
          </p>
          <Link href="/pricing">
            <Button size="lg">Start Your Transformation</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
