import type { Metadata } from "next";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowBackground } from "@/components/ui/GlowBackground";

export const metadata: Metadata = {
  title: "About",
  description: "The coaching team behind Biohacking.",
};

// EDIT ME: replace with your real team members before launch. Each entry is a
// simple typed record — name, credential-style title, short bio, specialty tags.
interface TeamMember {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
}

const TEAM: TeamMember[] = [
  {
    name: "[Coach Name]",
    title: "Head Coach — Strength & Physique",
    bio: "[Replace with a short, real biography: coaching background, years of experience, relevant certifications, and coaching philosophy.]",
    specialties: ["Fat Loss", "Muscle Building", "Strength Training"],
  },
  {
    name: "[Coach Name]",
    title: "Performance Coach",
    bio: "[Replace with a short, real biography covering training background, specialisms, and the type of client this coach works best with.]",
    specialties: ["Performance & Longevity", "Conditioning", "Mobility"],
  },
  {
    name: "[Coach Name]",
    title: "Nutrition Lead",
    bio: "[Replace with a short, real biography covering nutrition coaching background, qualifications, and approach to sustainable nutrition.]",
    specialties: ["Nutrition Strategy", "Body Recomposition", "Habit Coaching"],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <GlowBackground variant="violet" className="opacity-50" />
        <div className="mx-auto max-w-content">
          <h1 className="max-w-2xl font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Built by coaches, not a content team
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-fog-300">
            Biohacking exists to give men a real coaching relationship — backed by proper
            programming and delivered through tools that make day-to-day training easy to follow.
            The profiles below are placeholders: replace them with your actual team before
            launch.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-content">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-fog-400">
            Editable placeholder content — update with real team profiles
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <GlassPanel key={member.name} hover className="flex flex-col">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/8 font-display text-xl font-semibold text-fog-300">
                  {member.name
                    .replace(/[\[\]]/g, "")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-fog-100">
                  {member.name}
                </h2>
                <p className="text-sm text-cyan-300">{member.title}</p>
                <p className="mt-3 flex-1 text-sm text-fog-400">{member.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.specialties.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-fog-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
