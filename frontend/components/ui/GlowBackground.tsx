import { cn } from "@/lib/utils";

interface GlowBackgroundProps {
  variant?: "cyan" | "violet" | "blue" | "mixed";
  className?: string;
}

export function GlowBackground({ variant = "mixed", className }: GlowBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {(variant === "cyan" || variant === "mixed") && (
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[120px]" />
      )}
      {(variant === "blue" || variant === "mixed") && (
        <div className="absolute top-1/3 right-0 h-[28rem] w-[28rem] translate-x-1/3 rounded-full bg-accentblue-600/20 blur-[120px]" />
      )}
      {(variant === "violet" || variant === "mixed") && (
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-violet-500/10 blur-[120px]" />
      )}
    </div>
  );
}
