import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowBackground } from "@/components/ui/GlowBackground";

const HOW_IT_WORKS_PREVIEW = [
  {
    step: 1,
    title: "Choose your programme",
    copy: "Pick the coaching focus that matches your goal — fat loss, muscle building, recomposition, or performance.",
  },
  {
    step: 2,
    title: "Join",
    copy: "Create your account and complete a secure, recurring payment through Stripe.",
  },
  {
    step: 3,
    title: "Complete your assessment",
    copy: "An 8-step questionnaire covers your goals, training history, lifestyle, nutrition and health.",
  },
  {
    step: 4,
    title: "Receive your programme",
    copy: "Your answers are matched to a coaching programme and built out inside Everfit.",
  },
  {
    step: 5,
    title: "Train inside Everfit",
    copy: "Log sessions, track progress and message your coach from the Everfit app, day to day.",
  },
];

const PROGRAMMES_PREVIEW = [
  {
    slug: "fat-loss",
    name: "Fat Loss",
    copy: "Structured training and a sustainable calorie strategy built to strip fat while holding onto muscle.",
  },
  {
    slug: "muscle-building",
    name: "Muscle Building",
    copy: "Progressive overload programming and a surplus built for size, without the unnecessary fat gain.",
  },
  {
    slug: "body-recomposition",
    name: "Body Recomposition",
    copy: "Build muscle and lose fat at the same time with precision nutrition and training sequencing.",
  },
  {
    slug: "performance-longevity",
    name: "Performance & Longevity",
    copy: "Strength, conditioning and recovery systems for men training for decades, not just a summer.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <GlowBackground variant="mixed" />
        <div className="mx-auto grid max-w-content gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.08] text-fog-100 sm:text-5xl lg:text-[3.4rem]">
              Train smarter. Transform your body. Perform at your best.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-fog-300">
              Personalised online coaching for men who want a real plan, not a generic template —
              training, nutrition and lifestyle systems built around your goals and delivered
              through Everfit, with a coach behind every step.
            </p>
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link href="/pricing">
                <Button size="lg" fullWidth className="sm:w-auto">
                  Start Your Transformation
                </Button>
              </Link>
              <Link href="/programmes">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
                  View Programmes
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-fog-500">
              Recurring coaching packages billed securely through Stripe. Cancel any time from
              your dashboard.
            </p>
          </div>

          <GlassPanel className="relative" hover>
            <p className="text-xs font-medium uppercase tracking-wide text-fog-500">
              Illustrative example
            </p>
            <p className="mt-1 text-sm text-fog-300">
              A sample of what your coaching dashboard tracks over a training block.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <StatTile label="Programme adherence" value="94%" trend="+6% vs last block" />
              <StatTile label="Strength index" value="+18%" trend="Bench, squat, deadlift" />
              <StatTile label="Avg. sleep" value="7.4h" trend="Target: 7–9h" />
              <StatTile label="Body weight" value="−4.2kg" trend="12-week programme" />
            </div>
            <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs text-fog-400">
                <span>Weekly training load</span>
                <span>Example data</span>
              </div>
              <div className="mt-3 flex items-end gap-1.5">
                {[40, 55, 48, 70, 62, 80, 74].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-accentblue-600/60 to-cyan-400/80"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-content">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-fog-100 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-fog-300">
              Five steps from choosing a programme to training inside Everfit with a coach in your
              corner.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS_PREVIEW.map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="font-display text-2xl font-bold text-cyan-400">
                  {String(item.step).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-fog-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-fog-400">{item.copy}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/how-it-works"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
          >
            See the full process
          </Link>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-content">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold text-fog-100 sm:text-4xl">
                Programmes built around one outcome
              </h2>
              <p className="mt-4 text-fog-300">
                Every client is matched to a programme based on their assessment answers — not a
                one-size-fits-all template.
              </p>
            </div>
            <Link href="/programmes" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              View all programmes
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMMES_PREVIEW.map((programme) => (
              <GlassPanel key={programme.slug} hover className="flex flex-col">
                <h3 className="font-display text-lg font-semibold text-fog-100">
                  {programme.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-fog-400">{programme.copy}</p>
                <Link
                  href="/programmes"
                  className="mt-5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Learn more
                </Link>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-content">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold text-fog-100 sm:text-4xl">
                What progress looks like
              </h2>
              <p className="mt-4 text-fog-300">
                Example outcomes showing the kind of change our coaching programmes are designed
                to produce.
              </p>
            </div>
            <Link href="/results" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              View results
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { label: "Client A — Example", stat: "−9.1kg", detail: "16-week fat loss programme" },
              { label: "Client B — Example", stat: "+7.4kg lean mass", detail: "24-week muscle building programme" },
              { label: "Client C — Example", stat: "−6% body fat", detail: "20-week recomposition programme" },
            ].map((item) => (
              <GlassPanel key={item.label} className="text-center">
                <span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-1 text-xs font-medium text-fog-400">
                  Example
                </span>
                <p className="mt-4 font-display text-3xl font-bold text-cyan-300">{item.stat}</p>
                <p className="mt-2 text-sm font-medium text-fog-200">{item.label}</p>
                <p className="mt-1 text-xs text-fog-500">{item.detail}</p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/8 px-5 py-20 sm:px-8 sm:py-28">
        <GlowBackground variant="cyan" className="opacity-70" />
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-bold text-fog-100 sm:text-4xl">
            Your coaching programme is one assessment away.
          </h2>
          <p className="max-w-xl text-fog-300">
            Choose a package, complete your assessment, and get matched to a programme built
            around how you actually train, eat and live.
          </p>
          <Link href="/pricing">
            <Button size="lg">Start Your Transformation</Button>
          </Link>
        </div>
      </section>
    </>
  );
}

function StatTile({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-xs text-fog-500">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-fog-100">{value}</p>
      <p className="mt-1 text-xs text-cyan-400">{trend}</p>
    </div>
  );
}
