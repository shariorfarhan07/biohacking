import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  as?: "div" | "section" | "article";
}

export function GlassPanel({
  className,
  hover = false,
  padded = true,
  as: Component = "div",
  children,
  ...props
}: GlassPanelProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] shadow-panel backdrop-blur-md",
        hover &&
          "transition-all duration-300 ease-out hover:border-cyan-400/30 hover:shadow-glow-cyan motion-reduce:transition-none",
        padded && "p-6 sm:p-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
