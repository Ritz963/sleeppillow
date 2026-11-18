import Link from "next/link";
import { ArrowRight, AudioWaveform, BarChart3, BedDouble, Leaf, Lock, MoonStar, Smartphone } from "lucide-react";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { Cloud, CloudBank } from "@/components/site/Clouds";
import { JoinCta } from "@/components/site/JoinCta";
import { HeroPillow } from "@/components/site/pillow3d/HeroPillow";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { TrackVisit } from "@/components/site/TrackVisit";
import { MoonMark } from "@/components/site/Wordmark";

const STEPS = [
  { n: 1, title: "Set your bedtime", text: "Choose a time and how long to wind down.", Icon: Smartphone, tone: "mint" },
  { n: 2, title: "Rest your head", text: "Put the phone down and settle in.", Icon: BedDouble, tone: "lav" },
  { n: 3, title: "Let your routine begin", text: "Cooling, sound, and gentle haptics take over.", Icon: MoonStar, tone: "mint" },
] as const;

const FEATURES = [
  { title: "Comfort first", text: "Cooling built into your routine for a restful wind-down.", Icon: Leaf, tone: "mint" },
  { title: "Gentle guidance", text: "A calming mix of sound, feel, and cooling.", Icon: AudioWaveform, tone: "lav" },
  { title: "Keeps you focused", text: "Optional app blocking to reduce late-night distractions.", Icon: Lock, tone: "mint" },
  { title: "Personalized for you", text: "A routine that fits your life and your bedtime.", Icon: BarChart3, tone: "lav" },
] as const;

const toneClass = (tone: "mint" | "lav") => (tone === "mint" ? "bg-mint-200 text-ink" : "bg-lav-200 text-iris");

export default function Home() {
  return (
    <>
      <TrackVisit event="landing_visit" />
      <SiteNav />
      <main id="main" className="relative overflow-x-clip">
        {/* ---------- Hero ---------- */}
        <section className="relative px-4 pt-8 pb-10 sm:px-6 lg:pt-12">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(ellipse_at_70%_20%,#e2ddfb_0%,transparent_60%),radial-gradient(ellipse_at_0%_60%,#ece9fd_0%,transparent_55%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-4">
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <p className="rounded-full bg-lav-200/80 px-5 py-2 text-xs font-bold tracking-[0.22em] text-ink uppercase sm:text-sm">
                  A softer end to your day
                </p>
                <MoonMark className="-mt-5 hidden w-20 sm:block" />
              </div>
              <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,4.1rem)] leading-[1.02] font-bold tracking-[-0.035em] text-ink">
                <span className="sm:whitespace-nowrap">From screen time</span>{" "}
                <span className="sm:whitespace-nowrap">
                  to <span className="bg-gradient-to-r from-iris to-iris-400 bg-clip-text text-transparent">dream time.</span>
                </span>
              </h1>
              <p style={{ animationDelay: "120ms" }} className="anim-rise mt-5 max-w-md font-display text-xl leading-snug text-ink-soft sm:text-2xl">
                Your bedtime routine, brought together in one pillow.
              </p>
              <div style={{ animationDelay: "240ms" }} className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row">
                <JoinCta />
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-full border-2 border-lav-300 bg-white/70 px-7 py-4 text-[1.05rem] font-semibold text-ink transition duration-300 ease-out hover:-translate-y-0.5 hover:border-iris hover:text-iris"
                >
                  Try the app
                </Link>
              </div>
              <p style={{ animationDelay: "360ms" }} className="anim-rise mt-5 text-sm text-ink-soft">A student product concept, currently in development.</p>
            </div>
            <HeroPillow className="relative lg:-mr-10" />
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" aria-labelledby="how-title" className="relative px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 id="how-title" className="mb-4 text-center font-display text-sm font-bold tracking-[0.2em] text-ink-soft uppercase">
              How it works
            </h2>
            <Reveal>
              <ol className="grid gap-3 rounded-[2rem] border border-white bg-white/70 p-4 shadow-[0_20px_50px_-30px_rgba(58,44,242,0.35)] backdrop-blur sm:p-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-4">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="contents">
                    <div className="flex items-center gap-3">
                      <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${toneClass(s.tone)}`}>
                        {s.n}
                      </span>
                      <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-lav-100 text-ink">
                        <s.Icon className="size-6" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-ink">
                          <span className="sr-only">Step {s.n}: </span>
                          {s.title}
                        </h3>
                        <p className="text-sm text-ink-soft">{s.text}</p>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <ArrowRight aria-hidden className="mx-auto size-6 rotate-90 text-mint-400 md:rotate-0" />
                    )}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" aria-labelledby="features-title" className="relative px-4 py-16 sm:px-6">
          <Cloud className="anim-drift absolute top-10 -left-16 w-56 opacity-70" />
          <div className="relative mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 id="features-title" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Everything your wind-down needs, in one pillow
              </h2>
              <p className="mt-3 text-ink-soft">Fewer apps and fewer decisions at the end of the day.</p>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <Reveal as="li" key={f.title} delay={i * 110}>
                  <div className="group h-full rounded-[1.75rem] border border-lav-200 bg-white/80 p-6 shadow-[0_20px_40px_-30px_rgba(58,44,242,0.4)] transition duration-500 ease-out hover:-translate-y-1.5 hover:border-lav-300 hover:shadow-[0_30px_50px_-28px_rgba(58,44,242,0.55)]">
                    <span
                      aria-hidden
                      className={`grid size-16 place-items-center rounded-full transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${toneClass(f.tone)}`}
                    >
                      <f.Icon className="size-7" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold text-ink">{f.title}</h3>
                    <p className="mt-1.5 text-ink-soft">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Our story ---------- */}
        <section id="our-story" aria-labelledby="story-title" className="relative px-4 pb-16 sm:px-6">
          <Reveal className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] bg-gradient-to-br from-lav-200 via-lav-100 to-white p-6 sm:p-10 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-iris uppercase">Our story</p>
              <h2 id="story-title" className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Built by students who scroll too late, too.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                We&apos;re a student team exploring a better transition from scrolling to sleep. Instead of another app competing for attention,
                SleepPillow brings the wind-down into the pillow itself, so putting the phone away feels like the start of something calm.
              </p>
            </div>
            <dl className="space-y-3 rounded-[1.5rem] border border-white bg-white/80 p-6">
              {[
                ["Status", "Concept in development"],
                ["Built for", "Students and early-career professionals"],
                ["What we're testing", "Whether this routine helps you put the phone down"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-lav-200 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs font-bold tracking-wider text-ink-soft uppercase">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* ---------- Waitlist ---------- */}
        <section id="waitlist" aria-labelledby="waitlist-title" className="relative px-4 pt-4 pb-24 sm:px-6">
          <Reveal className="relative mx-auto max-w-2xl rounded-[2rem] border border-white bg-white/85 p-6 shadow-[0_30px_60px_-30px_rgba(58,44,242,0.45)] backdrop-blur sm:p-10">
            <MoonMark className="absolute -top-8 right-8 w-16" />
            <div className="mb-6 text-center">
              <h2 id="waitlist-title" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Join the waitlist
              </h2>
              <p className="mt-2 text-ink-soft">Hear first when we start testing SleepPillow.</p>
            </div>
            <WaitlistForm />
          </Reveal>
          <p className="relative mt-6 text-center text-ink-soft">
            Curious about the price?{" "}
            <Link href="/reserve" className="rounded font-semibold text-iris underline-offset-4 hover:underline">
              See it and reserve a spot
            </Link>
          </p>
          <CloudBank className="absolute inset-x-0 bottom-0 h-28 w-full" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
