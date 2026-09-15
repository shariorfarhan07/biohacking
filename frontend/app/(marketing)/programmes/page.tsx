import type { Metadata } from "next";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Fat Loss, Muscle Building, Body Recomposition, Performance & Longevity, and Advanced Performance Support coaching programmes.",
};

interface Programme {
  slug: string;
  name: string;
  description: string;
  whoFor: string;
  benefits: string[];
  included: string[];
}

const PROGRAMMES: Programme[] = [
  {
    slug: "fat-loss",
    name: "Fat Loss",
    description:
      "A structured cut built around a sustainable calorie deficit, resistance training to protect lean mass, and weekly check-ins so the plan adjusts as you change.",
    whoFor:
      "Men carrying more body fat than they want, who've tried crash diets or generic fat-loss plans before and need a system that actually holds up over months, not weeks.",
    benefits: [
      "Preserve muscle while losing fat through a resistance-first training split",
      "A calorie and macro target that adjusts as your weight and adherence change",
      "Weekly coach check-ins to catch plateaus before they stall progress",
      "Realistic guidance for eating out, travel, and social occasions",
    ],
    included: [
      "Custom training programme delivered in Everfit",
      "Personalised nutrition targets with regular adjustments",
      "Direct messaging with your coach",
      "Progress tracking (weight, photos, measurements)",
    ],
  },
  {
    slug: "muscle-building",
    name: "Muscle Building",
    description:
      "A progressive overload programme paired with a calorie surplus sized to build size and strength without the unnecessary fat gain that comes with a 'dirty bulk'.",
    whoFor:
      "Men who want to add visible muscle and strength, whether you're newer to structured training or have plateaued on a programme you outgrew.",
    benefits: [
      "Progressive overload programming tracked and adjusted week to week",
      "A calorie surplus sized to your recovery and body composition goals",
      "Exercise selection and volume matched to your training experience",
      "Deload and recovery planning built into the programme, not left to chance",
    ],
    included: [
      "Custom training programme delivered in Everfit",
      "Personalised nutrition and calorie targets",
      "Direct messaging with your coach",
      "Strength and physique progress tracking",
    ],
  },
  {
    slug: "body-recomposition",
    name: "Body Recomposition",
    description:
      "Build muscle and lose fat in the same block using a training and nutrition sequence designed for exactly that trade-off — most useful for intermediate lifters with some muscle already in place.",
    whoFor:
      "Men who don't want to choose between 'bulk' and 'cut' — who want to look leaner and more muscular over the same period, with nutrition timed around training.",
    benefits: [
      "Nutrition and training sequenced together, not treated as separate problems",
      "Calorie and macro cycling aligned to training days",
      "Realistic pacing — recomposition is slower than a pure cut or pure bulk, and we plan for that",
      "Monthly measurement check-ins to confirm the trade-off is working",
    ],
    included: [
      "Custom training programme delivered in Everfit",
      "Cycled nutrition targets aligned to your training split",
      "Direct messaging with your coach",
      "Body composition tracking over time",
    ],
  },
  {
    slug: "performance-longevity",
    name: "Performance & Longevity",
    description:
      "Strength, conditioning, mobility and recovery built for men training for the next decade rather than the next photo — with joint health and work capacity treated as first-class goals.",
    whoFor:
      "Men in their 30s, 40s and beyond who want to stay strong, mobile and capable, and who care as much about how training feels in ten years as how it looks now.",
    benefits: [
      "Strength work programmed around joint health, not just numbers on the bar",
      "Conditioning built for real-world stamina and cardiovascular health",
      "Mobility and recovery protocols integrated into the weekly plan",
      "Training load managed around sleep, stress and life outside the gym",
    ],
    included: [
      "Custom training programme delivered in Everfit",
      "Nutrition targets built for performance and recovery",
      "Direct messaging with your coach",
      "Ongoing programme adjustments as your capacity changes",
    ],
  },
  {
    slug: "advanced-performance-support",
    name: "Advanced Performance Support",
    description:
      "For men already training and eating with discipline who want their coach thinking about the systems around performance — training load, nutrition periodisation, sleep and recovery — at a more advanced level.",
    whoFor:
      "Experienced trainees who've exhausted the basics and want closer, more technical coaching on the training and lifestyle side of performance. This is not a medical service.",
    benefits: [
      "More technical periodisation across training blocks",
      "Closer monitoring of recovery markers (sleep, stress, training load)",
      "Advanced nutrition strategy, including nutrient timing and cycling",
      "Priority coach communication for faster plan adjustments",
    ],
    included: [
      "Custom advanced training programme delivered in Everfit",
      "Advanced nutrition periodisation",
      "Priority messaging with your coach",
      "Clear scope: no medication, dosing, or medical advice — see our full disclaimer",
    ],
  },
];

export default function ProgrammesPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="mixed" className="opacity-60" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Coaching programmes built for a specific outcome
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fog-300">
            Every client is matched to one of these programmes based on their onboarding
            assessment. Each one is a complete system, not a generic template.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-content flex-col gap-6">
          {PROGRAMMES.map((programme) => (
            <GlassPanel key={programme.slug} id={programme.slug} className="scroll-mt-24">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-fog-100">
                    {programme.name}
                  </h2>
                  <p className="mt-3 text-sm text-fog-300">{programme.description}</p>
                  <p className="mt-4 text-sm text-fog-400">
                    <span className="font-medium text-fog-200">Who it's for: </span>
                    {programme.whoFor}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/pricing">
                      <Button>Choose This Programme</Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="secondary">See pricing</Button>
                    </Link>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-fog-100">Key benefits</h3>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {programme.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm text-fog-300">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                            aria-hidden="true"
                          />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-fog-100">What's included</h3>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {programme.included.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-fog-300">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accentblue-600"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </>
  );
}
