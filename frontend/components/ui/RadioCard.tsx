import { useId } from "react";
import { cn } from "@/lib/utils";

interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  disabled,
}: RadioCardProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 rounded-xl border p-5 transition-all duration-200 ease-out motion-reduce:transition-none",
        checked
          ? "border-cyan-400/70 bg-cyan-400/[0.08] shadow-glow-cyan"
          : "border-white/12 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="absolute right-5 top-5 h-5 w-5 cursor-pointer accent-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      />
      {icon && <div className="text-cyan-400">{icon}</div>}
      <span className="pr-8 font-display text-base font-semibold text-fog-100">{title}</span>
      {description && <span className="text-sm text-fog-300">{description}</span>}
    </label>
  );
}
