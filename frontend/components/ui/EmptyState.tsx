import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-cyan-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-fog-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-fog-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
