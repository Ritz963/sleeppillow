"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  optional?: boolean;
};

export function TextField({ id, label, hint, error, optional, ref, ...input }: TextFieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="text-xs font-medium text-ink-soft">Optional</span> : <span className="sr-only">(required)</span>}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-ink shadow-sm transition-colors outline-none placeholder:text-[#8a88ad] focus-visible:border-iris focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-iris-400/40 ${
          error ? "border-[#c02646]" : "border-lav-300 hover:border-lav-400"
        }`}
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#b01f3d]">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

export function SubmitButton({ submitting, children, submittingLabel }: { submitting: boolean; children: ReactNode; submittingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      aria-disabled={submitting}
      className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-iris px-7 text-base font-semibold text-white shadow-[0_12px_24px_-10px_rgba(58,44,242,0.75)] transition-colors hover:bg-iris-600 disabled:cursor-wait disabled:opacity-80"
    >
      {submitting ? (
        <>
          <Loader2 className="anim-spin size-5" aria-hidden />
          {submittingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Off-screen honeypot field; humans never see or fill it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function DevStorageNote() {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-[#c99a2e] bg-[#fff8e6] px-3 py-2 text-left text-xs text-[#6b4d05]">
      <strong>Development storage:</strong> saved to <code>.data/sleeppillow-dev.json</code>. Set <code>DATABASE_URL</code> before launch
      (see README).
    </p>
  );
}

export function StatusBanner({ tone, title, children }: { tone: "warn" | "error"; title: string; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error" ? "border-[#f0b8c4] bg-[#fff1f4] text-[#7d1229]" : "border-lav-300 bg-lav-100 text-ink"
      }`}
    >
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  );
}
