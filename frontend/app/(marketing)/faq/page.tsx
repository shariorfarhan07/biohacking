import type { Metadata } from "next";
import Link from "next/link";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about coaching, onboarding, Everfit, billing and more.",
};

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: "Coaching",
    items: [
      {
        question: "How does the coaching actually work?",
        answer:
          "After you join, you complete an onboarding assessment. Based on your answers, you're matched to a coaching programme built by our coaching team and delivered through Everfit — the app you'll use day to day for your training, tracking and messaging your coach.",
      },
      {
        question: "How does programme selection work?",
        answer:
          "You choose a coaching package on this website (Fat Loss, Muscle Building, Body Recomposition, Performance & Longevity, or Advanced Performance Support), then your onboarding answers determine the specific programme variant you're assigned inside Everfit. A coach can also manually adjust your programme if needed.",
      },
      {
        question: "What is Everfit and why do you use it?",
        answer:
          "Everfit is a dedicated coaching app used to deliver your training programme, track your workouts and progress, and message your coach. We use it because it's purpose-built for coaching relationships, rather than building a weaker version of the same thing ourselves.",
      },
    ],
  },
  {
    title: "Getting started",
    items: [
      {
        question: "What does onboarding involve?",
        answer:
          "An 8-step questionnaire covering your goals, personal stats, training background and preferences, lifestyle, nutrition, and a short health screening. It typically takes 10–15 minutes, and you can save your progress and come back to finish it later.",
      },
      {
        question: "What if I don't have progress photos ready?",
        answer:
          "Progress photos are optional during onboarding. You can add them later from your dashboard — they're not required to complete onboarding or start your programme, but they do help your coach track visual progress over time.",
      },
    ],
  },
  {
    title: "Payment & billing",
    items: [
      {
        question: "How does payment and billing work?",
        answer:
          "Payment is processed securely through Stripe when you join. Your coaching package renews automatically based on the billing interval you choose (monthly, 3-month, 6-month or 12-month) until you cancel.",
      },
      {
        question: "What is your cancellation policy?",
        answer:
          "You can cancel your subscription at any time from the Billing section of your dashboard, which opens Stripe's secure billing portal. Cancelling stops future renewals; it does not automatically refund the current billing period. Contact us if you believe you're owed a refund and our team will review it.",
      },
    ],
  },
  {
    title: "Day-to-day coaching",
    items: [
      {
        question: "How does communication with my coach work day-to-day?",
        answer:
          "Once your account is active in Everfit, you message your coach directly inside the app. Response times and check-in cadence depend on your programme, but ongoing communication about training, nutrition and adjustments happens in Everfit, not on this website.",
      },
      {
        question: "Can I train at home instead of a gym?",
        answer:
          "Yes. During onboarding you tell us whether you train at a gym or at home, along with any equipment you have available, and your programme is built around that.",
      },
      {
        question: "Can I train in a commercial gym?",
        answer:
          "Yes — most of our programmes are built around standard gym equipment. If you have access to specific equipment or machines you'd like used, you can note that in onboarding or tell your coach directly.",
      },
    ],
  },
  {
    title: "Advanced Performance Support",
    items: [
      {
        question: "What is Advanced Performance Support, and what isn't it?",
        answer: (
          <>
            Advanced Performance Support is coaching for experienced trainees who want more
            technical training, nutrition and recovery coaching. It never includes medication or
            dosing advice of any kind. We do not prescribe medication, recommend or adjust doses
            of steroids, TRT, or peptides, or diagnose medical conditions. Any individual medical
            decision must go through an appropriately qualified, independent medical professional.
            Read the full{" "}
            <Link href="/advanced-performance-support" className="text-cyan-300 hover:text-cyan-200">
              Advanced Performance Support
            </Link>{" "}
            page for details.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="blue" className="opacity-50" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fog-300">
            Everything you need to know about coaching, onboarding, Everfit, and billing. Can't
            find your answer? <Link href="/contact" className="text-cyan-300 hover:text-cyan-200">Get in touch</Link>.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-semibold text-fog-100">{section.title}</h2>
              <div className="mt-4 flex flex-col gap-3">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 open:bg-white/[0.05]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fog-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                      {item.question}
                      <svg
                        className="h-4 w-4 shrink-0 text-fog-400 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>
                    <p className="mt-3 text-sm text-fog-300">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
