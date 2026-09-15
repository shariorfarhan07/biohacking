import Link from "next/link";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <GlowBackground variant="cyan" className="opacity-60" />
      <p className="font-display text-sm font-semibold text-cyan-400">404</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-bold sm:text-5xl">
        This page stepped out of the programme.
      </h1>
      <p className="mt-4 max-w-md text-fog-300">
        The page you're looking for doesn't exist, moved, or was never part of the plan. Let's
        get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button variant="primary">Back to home</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="secondary">View pricing</Button>
        </Link>
      </div>
    </main>
  );
}
