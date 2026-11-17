"use client";

import { Link2, Link2Off, Moon, SlidersHorizontal, Smartphone, Waves } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/site/Wordmark";
import { trackOncePerSession } from "@/lib/track";
import { AppStateProvider, useApp } from "./AppState";
import type { Tab } from "./model";
import { DeviceScreen } from "./screens/Device";
import { RoutineScreen } from "./screens/Routine";
import { SoundsScreen } from "./screens/Sounds";
import { TonightScreen } from "./screens/Tonight";
import { OverlayHostContext } from "./ui";

/** The whole prototype: a realistic phone with the app running inside its screen. */
export function PrototypeApp() {
  const [screenEl, setScreenEl] = useState<HTMLDivElement | null>(null);
  const tracked = useRef(false);
  const markDemoStart = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackOncePerSession("app_demo_start");
  };

  return (
    <PhoneFrame screenRef={setScreenEl} onInteract={markDemoStart}>
      <OverlayHostContext value={screenEl}>
        <AppStateProvider>
          <AppShell />
        </AppStateProvider>
      </OverlayHostContext>
    </PhoneFrame>
  );
}

function PhoneFrame({ children, screenRef, onInteract }: { children: ReactNode; screenRef: (el: HTMLDivElement | null) => void; onInteract: () => void }) {
  return (
    <div
      className="relative mx-auto h-[calc(100dvh-7.25rem)] min-h-[34rem] w-[calc(100vw-1rem)] max-w-[26.25rem] sm:h-[min(55rem,calc(100dvh-10.5rem))] sm:min-h-[38rem] sm:w-[clamp(24.375rem,calc((100dvh-10.5rem)*0.47),26.25rem)]"
      onPointerDownCapture={onInteract}
      onKeyDownCapture={onInteract}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute top-[18%] -left-[3px] hidden h-10 w-[3px] rounded-l bg-[#3b3a55] sm:block" />
      <span aria-hidden className="absolute top-[26%] -left-[3px] hidden h-16 w-[3px] rounded-l bg-[#3b3a55] sm:block" />
      <span aria-hidden className="absolute top-[24%] -right-[3px] hidden h-20 w-[3px] rounded-r bg-[#3b3a55] sm:block" />
      <div className="h-full rounded-[2.5rem] bg-gradient-to-b from-[#3a3952] via-[#1d1c2e] to-[#33324a] p-[5px] shadow-[0_40px_80px_-30px_rgba(40,30,160,0.65),0_0_0_1px_rgba(255,255,255,0.08)_inset] sm:rounded-[3.4rem] sm:p-3">
        <div
          ref={screenRef}
          className="theme-night relative isolate h-full overflow-hidden rounded-[2.2rem] bg-night-900 text-white sm:rounded-[2.75rem]"
          aria-label="SleepPillow app prototype"
          role="region"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; Icon: typeof Moon }[] = [
  { id: "tonight", label: "Tonight", Icon: Moon },
  { id: "routine", label: "Routine", Icon: SlidersHorizontal },
  { id: "sounds", label: "Sounds", Icon: Waves },
  { id: "device", label: "Device", Icon: Smartphone },
];

function AppShell() {
  const app = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevTab = useRef(app.tab);

  // On every in-app navigation: back to the top, and move focus to the new screen's heading.
  useEffect(() => {
    if (prevTab.current === app.tab) return; // initial mount (also safe under Strict Mode double effects)
    prevTab.current = app.tab;
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [app.tab]);

  const connected = app.connection === "connected";

  return (
    <div data-phone-content className="flex h-full flex-col bg-[radial-gradient(ellipse_at_50%_0%,#24227e_0%,transparent_60%)]">
      <StatusBar />

      <header className="flex shrink-0 items-center justify-between px-5 pt-2 pb-3 sm:pt-1">
        <Wordmark tone="night" className="text-[1.55rem]" />
        <button
          type="button"
          onClick={() => app.goTo("device")}
          aria-label={`Pillow ${connected ? "connected" : app.connection === "connecting" ? "connecting" : "not connected"} (simulated). Open device settings`}
          className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
            connected ? "border-aqua/80 text-aqua" : "border-white/20 text-haze"
          }`}
        >
          {connected ? <Link2 className="size-3.5" aria-hidden /> : <Link2Off className="size-3.5" aria-hidden />}
          {connected ? "Pillow connected" : app.connection === "connecting" ? "Connecting…" : "Not connected"}
        </button>
      </header>

      <div ref={scrollRef} className="phone-scroll relative flex-1 overflow-y-auto px-4 pb-4">
        {app.tab === "tonight" && <TonightScreen headingRef={headingRef} />}
        {app.tab === "routine" && <RoutineScreen headingRef={headingRef} />}
        {app.tab === "sounds" && <SoundsScreen headingRef={headingRef} />}
        {app.tab === "device" && <DeviceScreen headingRef={headingRef} />}
      </div>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-4 bottom-[5.5rem] z-30 flex justify-center">
        {app.toast && (
          <p key={app.toast.id} className="anim-toast rounded-full border border-aqua/30 bg-night-950/95 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xl">
            {app.toast.message}
          </p>
        )}
      </div>

      <nav aria-label="App" className="shrink-0 border-t border-white/10 bg-night-950/80 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:pb-5">
        <ul className="grid grid-cols-4">
          {TABS.map(({ id, label, Icon }) => {
            const current = app.tab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => app.goTo(id)}
                  aria-current={current ? "page" : undefined}
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.72rem] font-semibold transition-colors ${
                    current ? "text-white" : "text-haze hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${
                      current ? "bg-gradient-to-b from-glow to-glow-600 shadow-[0_6px_16px_-4px_rgba(106,92,255,0.9)]" : ""
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clock only exists on the client
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div aria-hidden className="relative hidden h-11 shrink-0 items-center justify-between px-8 pt-1 text-[0.8rem] font-semibold text-white sm:flex">
      <span className="w-12 tabular-nums">{time}</span>
      <span className="absolute top-2 left-1/2 h-7 w-[6.5rem] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[1.1rem] fill-white">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-3 w-4 fill-white">
          <path d="M8 12 5.4 9a3.7 3.7 0 0 1 5.2 0Zm-4-4.3L2.5 6.2a7.8 7.8 0 0 1 11 0L12 7.7a5.8 5.8 0 0 0-8 0ZM1.3 5 0 3.6a11.4 11.4 0 0 1 16 0L14.7 5A9.5 9.5 0 0 0 1.3 5Z" />
        </svg>
        <span className="relative h-3 w-6 rounded-[4px] border border-white/60 p-[1.5px]">
          <span className="block h-full w-3/4 rounded-[2px] bg-white" />
        </span>
      </span>
    </div>
  );
}
