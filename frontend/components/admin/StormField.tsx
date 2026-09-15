"use client";

/*
 * Form controls for the console. Bordered, rounded fields on white — the
 * same soft chrome as the buttons and cards, not an underline ledger.
 */

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { StormIcon } from "./StormIcon";

function FieldFrame({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="storm-legend font-medium text-rain">
          {label}
          {required && <span className="ml-1 text-signal">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="storm-micro text-quiet">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="storm-micro flex items-center gap-1.5 font-medium text-signal">
          <StormIcon name="alert" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full bg-paper border border-mist rounded-md px-3 py-2 text-sm text-ink shadow-storm-xs " +
  "placeholder:text-quiet transition duration-150 ease-out motion-reduce:transition-none " +
  "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft " +
  "focus-visible:outline-none disabled:bg-paper-lift disabled:text-quiet disabled:shadow-none";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const StormInput = forwardRef<HTMLInputElement, InputProps>(function StormInput(
  { label, hint, error, required, id, className, ...props },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL, error && "border-signal focus:border-signal focus:ring-signal-soft", className)}
        {...props}
      />
    </FieldFrame>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const StormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function StormTextarea(
  { label, hint, error, required, id, className, rows = 3, ...props },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL, "resize-y leading-relaxed", error && "border-signal focus:border-signal focus:ring-signal-soft", className)}
        {...props}
      />
    </FieldFrame>
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const StormSelect = forwardRef<HTMLSelectElement, SelectProps>(function StormSelect(
  { label, hint, error, required, id, className, options, placeholder, ...props },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            CONTROL,
            "appearance-none pr-8",
            error && "border-signal focus:border-signal focus:ring-signal-soft",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-quiet">
          <StormIcon name="down" size={15} />
        </span>
      </div>
    </FieldFrame>
  );
});

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
}

export const StormCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(function StormCheckbox(
  { label, hint, id, className, ...props },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2.5">
        <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            aria-describedby={hint ? `${fieldId}-hint` : undefined}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border border-mist bg-paper cursor-pointer",
              "transition duration-150 ease-out motion-reduce:transition-none active:scale-90",
              "checked:border-accent checked:bg-accent disabled:cursor-not-allowed disabled:border-mist disabled:bg-paper-lift",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              className
            )}
            {...props}
          />
          <span className="storm-check-in pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
            <StormIcon name="check" size={11} />
          </span>
        </span>
        <label htmlFor={fieldId} className="text-sm leading-snug text-ink">
          {label}
        </label>
      </div>
      {hint && (
        <p id={`${fieldId}-hint`} className="storm-micro ml-[26px] text-quiet">
          {hint}
        </p>
      )}
    </div>
  );
});
