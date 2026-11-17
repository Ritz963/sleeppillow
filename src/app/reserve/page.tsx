import type { Metadata } from "next";
import { Check, Info } from "lucide-react";
import { RESERVATION_PRICE, formatPrice } from "@/config/pricing";
import { ReserveForm } from "@/components/forms/ReserveForm";
import { CloudBank } from "@/components/site/Clouds";
import { CALLOUTS, CalloutIcon, PillowScene } from "@/components/site/PillowScene";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { TrackVisit } from "@/components/site/TrackVisit";

export const metadata: Metadata = {
  title: "Reserve your spot",
  description: "Reserve a nonbinding spot for SleepPillow at the proposed price. No payment collected.",
};

export default function ReservePage() {
  const showPlaceholderFlag = RESERVATION_PRICE.isPlaceholder && process.env.NODE_ENV !== "production";
  return (
    <>
      <TrackVisit event="reserve_visit" />
      <SiteNav />
      <main id="main" className="relative overflow-x-clip px-4 pt-8 pb-24 sm:px-6 lg:pt-12">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_20%_10%,#e2ddfb_0%,transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="inline-block rounded-full bg-lav-200/80 px-5 py-2 text-xs font-bold tracking-[0.22em] text-ink uppercase sm:text-sm">
              Nonbinding reservation
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,5.5vw,3.75rem)] leading-[1.04] font-bold tracking-[-0.03em] text-ink">
              Reserve your <span className="bg-gradient-to-r from-iris to-iris-400 bg-clip-text text-transparent">SleepPillow</span>.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-soft">
              One pillow for your whole wind-down: cooling, calming wave audio, gentle haptics, and optional app blocking, all set from one app.
            </p>
            <PillowScene callouts={false} className="mx-auto mt-4 max-w-xl" />
            <ul className="mt-2 grid grid-cols-2 gap-3" aria-label="What's included">
              {CALLOUTS.map((c) => (
                <li key={c.label} className="flex items-center gap-3 rounded-2xl border border-white bg-white/70 p-2 pr-3">
                  <CalloutIcon Icon={c.Icon} tone={c.tone} />
                  <span className="text-sm font-semibold text-ink sm:text-base">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5 lg:sticky lg:top-28">
            <section aria-labelledby="price-title" className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1870] via-[#2a22b8] to-iris p-7 text-white shadow-[0_30px_60px_-25px_rgba(58,44,242,0.7)]">
              <div aria-hidden className="absolute -top-16 -right-10 size-56 rounded-full bg-[radial-gradient(circle,rgba(143,242,218,0.35),transparent_65%)]" />
              <h2 id="price-title" className="text-sm font-bold tracking-[0.18em] text-moon uppercase">
                Proposed price
              </h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold tracking-tight" data-testid="proposed-price">
                  {formatPrice()}
                </span>
                <span className="text-lg font-semibold text-moon">{RESERVATION_PRICE.currency}</span>
              </p>
              <ul className="mt-5 space-y-2 text-[0.95rem]">
                {["Nonbinding: you're not committed to buy", "No payment collected today", "Product still in development"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-aqua" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              {showPlaceholderFlag && (
                <p className="mt-5 flex gap-2 rounded-xl bg-[#fff3cd] px-3 py-2 text-xs font-semibold text-[#5c4300]">
                  <Info className="size-4 shrink-0" aria-hidden />
                  Development placeholder price. Set it in src/config/pricing.ts before launch.
                </p>
              )}
            </section>

            <section aria-labelledby="form-title" className="rounded-[2rem] border border-white bg-white/85 p-6 shadow-[0_30px_60px_-35px_rgba(58,44,242,0.45)] backdrop-blur sm:p-8">
              <h2 id="form-title" className="mb-1 font-display text-2xl font-bold text-ink">
                Hold your spot
              </h2>
              <p className="mb-5 text-sm text-ink-soft">
                A reservation tells us you&apos;d consider buying at this price. It&apos;s separate from the waitlist.
              </p>
              <ReserveForm />
            </section>
          </div>
        </div>
        <CloudBank className="absolute inset-x-0 bottom-0 h-24 w-full" />
      </main>
      <SiteFooter />
    </>
  );
}
