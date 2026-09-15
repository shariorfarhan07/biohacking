import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 text-sm text-fog-200">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-invalid={!!error}
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/25 bg-white/[0.03] text-cyan-400",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
              "accent-cyan-400",
              className
            )}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && (
          <p className="pl-8 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
