"use client";

import { X } from "lucide-react";
import { createContext, use, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* ------------------------------------------------------------------ */
/* Overlay host: sheets/dialogs render into the phone screen element, */
/* never across the browser window.                                    */
/* ------------------------------------------------------------------ */

export const OverlayHostContext = createContext<HTMLElement | null>(null);

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  variant = "sheet",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "sheet" | "dialog";
}) {
  const host = use(OverlayHostContext);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open || !host) return;
    const onClose = () => onCloseRef.current();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const content = host.querySelector<HTMLElement>("[data-phone-content]");
    content?.setAttribute("inert", "");
    const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    const node = panel.current;
    node?.addEventListener("keydown", onKey);
    return () => {
      node?.removeEventListener("keydown", onKey);
      content?.removeAttribute("inert");
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, host]);

  if (!open || !host) return null;

  return createPortal(
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className="anim-fade absolute inset-0 cursor-default bg-night-950/70 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={
          variant === "sheet"
            ? "anim-sheet relative max-h-[85%] overflow-y-auto rounded-t-[1.75rem] border-t border-white/10 bg-night-850 px-5 pt-3 pb-6 shadow-[0_-20px_40px_rgba(0,0,0,0.4)] phone-scroll"
            : "anim-fade relative m-auto w-[86%] rounded-[1.5rem] border border-white/10 bg-night-850 p-5 shadow-2xl"
        }
      >
        {variant === "sheet" && <div aria-hidden className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-xl font-semibold text-white">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-haze">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/8 text-moon hover:bg-white/15"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host,
  );
}

/* ------------------------------------------------------------------ */

export function Segmented<T extends string | number>({
  legend,
  options,
  value,
  onChange,
  name,
  format = (v) => String(v),
  hint,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  name: string;
  format?: (v: T) => string;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-moon">{legend}</legend>
      <div className="flex gap-1 rounded-2xl bg-night-950/60 p-1">
        {options.map((opt) => {
          const checked = opt === value;
          return (
            <label
              key={String(opt)}
              className={`relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl px-1 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-aqua ${
                checked ? "bg-gradient-to-b from-glow to-glow-600 text-white shadow-[0_6px_16px_-6px_rgba(106,92,255,0.9)]" : "text-haze hover:text-white"
              }`}
            >
              <input type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(opt)} />
              {format(opt)}
            </label>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-haze">{hint}</p>}
    </fieldset>
  );
}

export function Switch({ checked, onChange, label, describedBy }: { checked: boolean; onChange: (v: boolean) => void; label: string; describedBy?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? "bg-aqua" : "bg-white/15"}`}
    >
      <span
        aria-hidden
        className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : ""}`}
      />
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.5rem] border border-[#4a47c4]/40 bg-gradient-to-b from-night-800/80 to-night-850/80 p-4 ${className}`}>{children}</div>
  );
}

export function IconBubble({ children, tone = "lav" }: { children: ReactNode; tone?: "lav" | "aqua" }) {
  return (
    <span
      aria-hidden
      className={`grid size-11 shrink-0 place-items-center rounded-full ${
        tone === "aqua" ? "bg-aqua/15 text-aqua" : "bg-gradient-to-b from-night-700 to-night-800 text-moon shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
      }`}
    >
      {children}
    </span>
  );
}

export function ScreenHeader({ title, subtitle, headingRef }: { title: string; subtitle: string; headingRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <div className="mb-5 px-1">
      <h1 ref={headingRef} tabIndex={-1} className="font-display text-[1.75rem] font-bold tracking-tight text-white outline-none">
        {title}
      </h1>
      <p className="mt-0.5 text-[0.95rem] text-haze">{subtitle}</p>
    </div>
  );
}

export function PrototypeNote() {
  return (
    <p className="mt-6 mb-2 text-center text-[0.7rem] tracking-wide text-haze/80">Interactive prototype — hardware controls simulated</p>
  );
}

export function SimBadge() {
  return (
    <span className="rounded-full border border-aqua/40 px-2 py-0.5 text-[0.65rem] font-bold tracking-wider text-aqua uppercase">Simulated</span>
  );
}
