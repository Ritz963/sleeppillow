"use client";

import { AudioWaveform, BedDouble, Check, ChevronDown, Lock, Pause, Play, Snowflake, Square, Volume2, VolumeX, Waves } from "lucide-react";
import { useState, type ReactNode } from "react";
import { MoonMark } from "@/components/site/Wordmark";
import { useApp } from "../AppState";
import {
  COOLING_COPY,
  COOLING_LEVELS,
  EXAMPLE_APPS,
  HAPTIC_COPY,
  HAPTIC_LEVELS,
  SOUNDS,
  formatClock,
  formatTimer,
  soundName,
  type Cooling,
  type Haptics,
  type SoundId,
} from "../model";
import { Card, IconBubble, PrototypeNote, Sheet, SimBadge, Switch } from "../ui";

type Picker = "cooling" | "sound" | "haptics" | null;

export function TonightScreen({ headingRef }: { headingRef: React.Ref<HTMLHeadingElement> }) {
  const app = useApp();
  const { prefs, session, remainingMs } = app;
  const [picker, setPicker] = useState<Picker>(null);
  const active = session.status === "running" || session.status === "paused";
  const total = session.status === "idle" ? prefs.duration * 60_000 : session.durationMs;
  const progress = total ? 1 - remainingMs / total : 0;

  return (
    <div>
      {/* ---------- Timer hero ---------- */}
      <section
        aria-label="Wind-down"
        className="relative overflow-hidden rounded-[1.75rem] border border-[#4a47c4]/50 bg-gradient-to-b from-[#24228a] via-night-800 to-night-900 px-5 pt-6 pb-6 text-center shadow-[0_20px_50px_-20px_rgba(106,92,255,0.6)]"
      >
        <NightBackdrop />
        <div className="relative">
          {session.status === "complete" ? (
            <Complete headingRef={headingRef} />
          ) : (
            <>
              <MoonMark tone="night" className="mx-auto w-16" />
              <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-[2rem] leading-tight font-bold tracking-tight text-white outline-none">
                Your day can wait.
              </h1>
              <p className="mt-1 text-lg text-moon">
                {session.status === "running" ? "Winding down. Breathe slowly." : session.status === "paused" ? "Paused. Pick up when you're ready." : "Your wind-down is ready."}
              </p>
              <p
                className="mt-4 font-display text-[4.5rem] leading-none font-semibold tracking-tight text-moon tabular-nums drop-shadow-[0_0_24px_rgba(169,160,255,0.45)]"
                data-testid="timer"
              >
                <span className="sr-only">Time remaining: </span>
                {formatTimer(remainingMs)}
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">Wind-down timer</p>
              <div
                className="mx-auto mt-3 h-1.5 w-3/4 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Wind-down progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-glow to-aqua transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
              </div>
              <SessionControls />
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {{ idle: "", running: "Wind-down running.", paused: "Wind-down paused.", complete: "Wind-down complete." }[session.status]}
        </p>
      </section>

      {active && <LiveStatus />}

      {/* ---------- Tonight's settings ---------- */}
      <section aria-labelledby="tonight-settings" className="mt-4">
        <Card>
          <h2 id="tonight-settings" className="px-1 font-display text-xl font-bold text-white">
            Tonight&apos;s settings
          </h2>
          <ul className="mt-2 divide-y divide-white/10">
            <SettingRow
              icon={<BedDouble className="size-5" />}
              label="Bedtime"
              value={`${formatClock(prefs.bedtime)} · ${prefs.duration} min`}
              onClick={() => app.goTo("routine")}
              actionLabel="Adjust bedtime in Routine"
            />
            <SettingRow icon={<Snowflake className="size-5" />} label="Cooling" value={prefs.cooling} onClick={() => setPicker("cooling")} chevron />
            <SettingRow icon={<Waves className="size-5" />} label="Wave audio" value={soundName(prefs.sound, true)} onClick={() => setPicker("sound")} chevron />
            <SettingRow icon={<AudioWaveform className="size-5" />} label="Haptics" value={prefs.haptics} onClick={() => setPicker("haptics")} chevron />
            <li className="flex items-center gap-3 py-3">
              <IconBubble>
                <Lock className="size-5" />
              </IconBubble>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">App lock</p>
                <p id="applock-desc" className="truncate text-sm text-haze">
                  {prefs.appLock ? `${prefs.blockedApps.length} example apps · paired phone` : "Off"}
                </p>
              </div>
              <Switch
                checked={prefs.appLock}
                label="App lock"
                describedBy="applock-desc"
                onChange={(v) => {
                  app.updatePrefs({ appLock: v });
                  app.showToast(v ? "App lock on (simulated)" : "App lock off");
                }}
              />
            </li>
          </ul>
        </Card>
      </section>

      <button
        type="button"
        onClick={() => app.goTo("routine")}
        className="mx-auto mt-4 block rounded-full px-4 py-2 font-semibold text-moon underline underline-offset-4 hover:text-white"
      >
        Adjust routine
      </button>

      <PrototypeNote />

      <OptionSheet
        open={picker === "cooling"}
        title="Cooling"
        options={COOLING_LEVELS.map((c) => ({ value: c, label: c, hint: COOLING_COPY[c] }))}
        value={prefs.cooling}
        onClose={() => setPicker(null)}
        onSelect={(v) => {
          app.updatePrefs({ cooling: v as Cooling });
          app.showToast(`Cooling set to ${v}`);
        }}
      />
      <OptionSheet
        open={picker === "haptics"}
        title="Haptics"
        options={HAPTIC_LEVELS.map((h) => ({ value: h, label: h, hint: HAPTIC_COPY[h] }))}
        value={prefs.haptics}
        onClose={() => setPicker(null)}
        onSelect={(v) => {
          app.updatePrefs({ haptics: v as Haptics });
          app.showToast(`Haptics set to ${v}`);
        }}
      />
      <OptionSheet
        open={picker === "sound"}
        title="Wave audio"
        options={SOUNDS.map((s) => ({ value: s.id, label: s.long, hint: s.blurb }))}
        value={prefs.sound}
        onClose={() => setPicker(null)}
        onSelect={(v) => {
          app.updatePrefs({ sound: v as SoundId });
          if (app.playing) app.playSound(v as SoundId);
          app.showToast(`${soundName(v as SoundId, true)} selected`);
        }}
      />
    </div>
  );
}

function SessionControls() {
  const app = useApp();
  const { session } = app;
  const primary =
    "inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-b from-glow to-glow-600 px-7 text-lg font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_12px_30px_-8px_rgba(106,92,255,0.95)] transition-transform hover:brightness-110 active:scale-[0.98]";
  const secondary =
    "inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 font-semibold text-moon hover:bg-white/10";

  if (session.status === "idle") {
    return (
      <div className="mt-6">
        <button type="button" onClick={app.begin} className={`${primary} w-full`}>
          <span className="grid size-8 place-items-center rounded-full bg-white/90 text-glow-600">
            <Play className="size-4 translate-x-px fill-current" aria-hidden />
          </span>
          Begin wind-down
        </button>
      </div>
    );
  }
  return (
    <div className="mt-6 flex gap-3">
      {session.status === "running" ? (
        <button type="button" onClick={app.pause} className={`${primary} flex-1`}>
          <Pause className="size-5 fill-current" aria-hidden /> Pause
        </button>
      ) : (
        <button type="button" onClick={app.resume} className={`${primary} flex-1`}>
          <Play className="size-5 fill-current" aria-hidden /> Resume
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          app.end();
          app.showToast("Session ended");
        }}
        className={secondary}
      >
        <Square className="size-4 fill-current" aria-hidden /> End
      </button>
    </div>
  );
}

function Complete({ headingRef }: { headingRef: React.Ref<HTMLHeadingElement> }) {
  const app = useApp();
  return (
    <div className="py-4">
      <div className="relative mx-auto grid size-28 place-items-center">
        <span aria-hidden className="anim-breathe absolute inset-0 rounded-full bg-glow/30 blur-md" />
        <MoonMark tone="night" className="relative w-20" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[2rem] leading-tight font-bold text-white outline-none">
        Wind-down complete.
      </h1>
      <p className="mt-2 text-moon">Time to sleep. Your phone can rest too.</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={app.dismissComplete}
          className="h-13 flex-1 rounded-full bg-gradient-to-b from-glow to-glow-600 font-semibold text-white shadow-[0_12px_30px_-8px_rgba(106,92,255,0.95)]"
        >
          Done
        </button>
        <button type="button" onClick={app.begin} className="h-13 flex-1 rounded-full border border-white/20 bg-white/5 font-semibold text-moon hover:bg-white/10">
          Start again
        </button>
      </div>
    </div>
  );
}

function LiveStatus() {
  const app = useApp();
  const { prefs, session, connection, playing } = app;
  const running = session.status === "running";
  const connected = connection === "connected";
  const elapsed = session.status === "idle" || session.status === "complete" ? 0 : session.durationMs - app.remainingMs;
  const coolingRamp = Math.min(1, elapsed / 120_000);
  const blocked = EXAMPLE_APPS.filter((a) => prefs.blockedApps.includes(a.id));
  const soundOn = playing === prefs.sound;

  return (
    <section aria-labelledby="live-title" className="mt-4">
      <Card>
        <div className="flex items-center justify-between px-1">
          <h2 id="live-title" className="font-display text-lg font-bold text-white">
            Your pillow right now
          </h2>
          <SimBadge />
        </div>

        {!connected && (
          <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
            Pillow not connected, so cooling and haptics are off. Sound still plays from this device.{" "}
            <button type="button" onClick={() => app.goTo("device")} className="font-semibold text-white underline underline-offset-2">
              Connect pillow
            </button>
          </div>
        )}

        <ul className="mt-3 space-y-3">
          <LiveRow icon={<Waves className="size-5" />} title={soundName(prefs.sound, true)} detail={soundOn ? "Playing on this device" : "Sound paused"}>
            <button
              type="button"
              onClick={() => (soundOn ? app.stopSound() : app.playSound(prefs.sound))}
              aria-label={soundOn ? "Mute soundscape" : "Play soundscape"}
              className="grid size-10 place-items-center rounded-full bg-white/10 text-moon hover:bg-white/20"
            >
              {soundOn ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
            </button>
          </LiveRow>

          <LiveRow
            icon={<Snowflake className="size-5" />}
            title={`Cooling · ${prefs.cooling}`}
            detail={!connected ? "Unavailable" : prefs.cooling === "Off" ? "Off tonight" : coolingRamp < 1 ? "Easing the surface cooler" : "Holding steady"}
          >
            {connected && prefs.cooling !== "Off" && (
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10" aria-hidden>
                <span className="block h-full rounded-full bg-aqua" style={{ width: `${Math.max(8, coolingRamp * 100)}%` }} />
              </span>
            )}
          </LiveRow>

          <LiveRow
            icon={<AudioWaveform className="size-5" />}
            title={`Haptics · ${prefs.haptics}`}
            detail={!connected ? "Unavailable" : prefs.haptics === "Off" ? "Off tonight" : running ? "Breathe with each pulse" : "Paused"}
          >
            {connected && prefs.haptics !== "Off" && (
              <span className="relative grid size-10 place-items-center" aria-hidden>
                {running && <span className={`anim-breathe absolute inset-0 rounded-full ${prefs.haptics === "Medium" ? "bg-aqua/50" : "bg-aqua/30"}`} />}
                <span className="relative size-3 rounded-full bg-aqua" />
              </span>
            )}
          </LiveRow>

          <LiveRow
            icon={<Lock className="size-5" />}
            title="App lock"
            detail={prefs.appLock ? `${blocked.length} example apps paused` : "Off tonight"}
          >
            {prefs.appLock && (
              <span className="flex -space-x-2" aria-hidden>
                {blocked.slice(0, 3).map((a) => (
                  <span key={a.id} className={`grid size-7 place-items-center rounded-lg bg-gradient-to-br ${a.color} opacity-50 ring-2 ring-night-850 grayscale-[40%]`}>
                    <a.Icon className="size-3.5 text-white" />
                  </span>
                ))}
              </span>
            )}
          </LiveRow>
        </ul>
      </Card>
    </section>
  );
}

function LiveRow({ icon, title, detail, children }: { icon: ReactNode; title: string; detail: string; children?: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <IconBubble tone="aqua">{icon}</IconBubble>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{title}</p>
        <p className="truncate text-sm text-haze">{detail}</p>
      </div>
      {children}
    </li>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onClick,
  chevron,
  actionLabel,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  chevron?: boolean;
  actionLabel?: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={actionLabel ?? `${label}: ${value}. Change`}
        aria-haspopup={chevron ? "dialog" : undefined}
        className="flex w-full items-center gap-3 rounded-xl py-3 text-left hover:bg-white/5"
      >
        <IconBubble>{icon}</IconBubble>
        <span className="flex-1 font-semibold text-white">{label}</span>
        <span className="text-[0.95rem] text-moon">{value}</span>
        <ChevronDown className={`size-5 text-moon ${chevron ? "" : "-rotate-90"}`} aria-hidden />
      </button>
    </li>
  );
}

function OptionSheet({
  open,
  title,
  options,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: { value: string; label: string; hint: string }[];
  value: string;
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} description="Applies to tonight and your saved routine.">
      <div role="radiogroup" aria-label={title} className="space-y-2">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              data-autofocus={checked ? "" : undefined}
              onClick={() => {
                onSelect(o.value);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                checked ? "border-aqua/70 bg-aqua/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="flex-1">
                <span className="block font-semibold text-white">{o.label}</span>
                <span className="block text-sm text-haze">{o.hint}</span>
              </span>
              {checked && (
                <span className="grid size-7 place-items-center rounded-full bg-aqua text-night-900">
                  <Check className="size-4" aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function NightBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {[
        [12, 14], [84, 10], [72, 30], [20, 42], [90, 52], [8, 66], [60, 6],
      ].map(([x, y], i) => (
        <span key={i} className="anim-twinkle absolute size-1 rounded-full bg-white/80" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.5}s` }} />
      ))}
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 top-[34%] h-24 w-full opacity-60">
        <path d="M-10 70c40-30 80-34 110-14 20-30 70-38 96-8 30-20 70-12 84 14H-10Z" fill="#2c2a8f" />
        <path d="M250 60c26-24 70-26 90-4 20-12 50-8 70 10v20H250Z" fill="#2c2a8f" />
      </svg>
      <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[42%] w-[200%] anim-wave">
        <path d="M0 70 Q100 20 200 70 T400 70 T600 70 T800 70 V200 H0Z" fill="#3a37a8" opacity="0.45" />
        <path d="M0 120 Q100 70 200 110 T400 110 T600 110 T800 110 V200 H0Z" fill="#26247e" opacity="0.7" />
      </svg>
    </div>
  );
}
