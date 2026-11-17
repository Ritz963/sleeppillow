"use client";

import { ArrowRight } from "lucide-react";

/** Scrolls to the waitlist form and moves keyboard focus into it. */
export function JoinCta({ className = "" }: { className?: string }) {
  return (
    <a
      href="#waitlist"
      onClick={() => {
        const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
        setTimeout(() => document.getElementById("wl-email")?.focus({ preventScroll: true }), delay);
      }}
      className={`group inline-flex items-center justify-center gap-3 rounded-full bg-iris px-7 py-4 text-[1.05rem] font-semibold text-white shadow-[0_16px_30px_-12px_rgba(58,44,242,0.8)] transition-colors hover:bg-iris-600 ${className}`}
    >
      Join the waitlist
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}
