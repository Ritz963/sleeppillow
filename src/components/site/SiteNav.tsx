"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/app", label: "Try the app" },
  { href: "/reserve", label: "Reserve" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[1.75rem] border border-white/80 bg-white/75 py-2.5 pr-2.5 pl-5 shadow-[0_8px_30px_-12px_rgba(58,44,242,0.18)] backdrop-blur-xl sm:pl-7"
      >
        <Link href="/" className="rounded-lg text-[1.6rem] leading-none sm:text-[1.85rem]" aria-label="SleepPillow home">
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const current = l.href === pathname;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors hover:bg-lav-100 hover:text-iris ${
                    current ? "text-iris" : "text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#waitlist"
            aria-label="Join the waitlist"
            className="rounded-full bg-iris px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,44,242,0.7)] transition-colors hover:bg-iris-600 sm:px-6 sm:text-[0.95rem]"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Join the waitlist</span>
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-lav-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="anim-fade mx-auto mt-2 max-w-6xl rounded-3xl border border-white bg-white/95 p-2 shadow-xl backdrop-blur-xl md:hidden"
        >
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={l.href === pathname ? "page" : undefined}
                  className="block rounded-2xl px-4 py-3 font-semibold text-ink hover:bg-lav-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
