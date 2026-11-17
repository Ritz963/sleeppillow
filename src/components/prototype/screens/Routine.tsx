"use client";

import { Check, Clock, Lock, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useApp } from "../AppState";
import {
  COOLING_COPY,
  COOLING_LEVELS,
  DURATIONS,
  EXAMPLE_APPS,
  HAPTIC_COPY,
  HAPTIC_LEVELS,
  formatClock,
  subtractMinutes,
  type Routine,
} from "../model";
import { Card, PrototypeNote, ScreenHeader, Segmented, Sheet, Switch } from "../ui";

const ROUTINE_KEYS: (keyof Routine)[] = ["bedtime", "duration", "cooling", "haptics", "appLock", "blockedApps"];

export function RoutineScreen({ headingRef }: { headingRef: React.Ref<HTMLHeadingElement> }) {
  const app = useApp();
  const saved = app.prefs;
  const [draft, setDraft] = useState<Routine>(() => pick(saved));
  const [bedtimeOpen, setBedtimeOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(pick(saved));
  const set = (patch: Partial<Routine>) => {
    setJustSaved(false);
    setDraft((d) => ({ ...d, ...patch }));
  };

  function save() {
    app.updatePrefs(draft);
    setJustSaved(true);
    app.showToast("Routine saved · Tonight is updated");
  }

  return (
    <div>
      <ScreenHeader title="Routine" subtitle="Shape how tonight winds down." headingRef={headingRef} />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-12 place-items-center rounded-full bg-aqua/15 text-aqua">
              <Clock className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-moon">Bedtime</p>
              <p className="font-display text-3xl font-semibold text-white" data-testid="bedtime-value">
                {formatClock(draft.bedtime)}
              </p>
              <p className="text-xs text-haze">Wind-down starts {formatClock(subtractMinutes(draft.bedtime, draft.duration))}</p>
            </div>
            <button
              type="button"
              onClick={() => setBedtimeOpen(true)}
              aria-haspopup="dialog"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Change<span className="sr-only"> bedtime</span>
            </button>
          </div>
        </Card>

        <Card>
          <Segmented
            legend="Wind-down length"
            name="duration"
            options={DURATIONS}
            value={draft.duration}
            onChange={(duration) => set({ duration })}
            format={(d) => `${d} min`}
          />
        </Card>

        <Card>
          <Segmented legend="Cooling" name="cooling" options={COOLING_LEVELS} value={draft.cooling} onChange={(cooling) => set({ cooling })} hint={COOLING_COPY[draft.cooling]} />
        </Card>

        <Card>
          <Segmented legend="Haptics" name="haptics" options={HAPTIC_LEVELS} value={draft.haptics} onChange={(haptics) => set({ haptics })} hint={HAPTIC_COPY[draft.haptics]} />
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-11 place-items-center rounded-full bg-gradient-to-b from-night-700 to-night-800 text-moon">
              <Lock className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-white">App blocking</p>
              <p id="block-desc" className="text-sm text-haze">
                Pause distracting apps during wind-down
              </p>
            </div>
            <Switch checked={draft.appLock} onChange={(appLock) => set({ appLock })} label="App blocking" describedBy="block-desc" />
          </div>
          {draft.appLock && (
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-semibold text-moon">Apps to block (examples)</legend>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_APPS.map((a) => {
                  const checked = draft.blockedApps.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-2xl border p-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-aqua ${
                        checked ? "border-aqua/60 bg-aqua/10 text-white" : "border-white/10 bg-white/5 text-haze"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) =>
                          set({ blockedApps: e.target.checked ? [...draft.blockedApps, a.id] : draft.blockedApps.filter((id) => id !== a.id) })
                        }
                      />
                      <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.color}`}>
                        <a.Icon className="size-4 text-white" />
                      </span>
                      <span className="flex-1 leading-tight">{a.name}</span>
                      {checked && <Check className="size-4 text-aqua" aria-hidden />}
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-haze">
                In the real product, blocking would run on your paired phone. This browser demo can&apos;t block other apps.
              </p>
            </fieldset>
          )}
        </Card>
      </div>

      {/* Save bar, pinned to the bottom of the scroll area */}
      <div className={`${dirty ? "sticky" : "relative"} bottom-0 z-10 -mx-4 mt-4 bg-gradient-to-t from-night-900 via-night-900/95 to-transparent px-4 pt-6 pb-3`}>
        {dirty && <p className="mb-2 text-center text-xs font-semibold text-amber-200">Unsaved changes</p>}
        <div className="flex gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => setDraft(pick(saved))}
              className="h-13 rounded-full border border-white/20 px-5 font-semibold text-moon hover:bg-white/10"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-glow to-glow-600 font-semibold text-white shadow-[0_12px_30px_-8px_rgba(106,92,255,0.95)] disabled:from-white/10 disabled:to-white/10 disabled:text-moon disabled:shadow-none"
          >
            {!dirty && justSaved ? (
              <>
                <Check className="size-5" aria-hidden /> Routine saved
              </>
            ) : !dirty ? (
              "No changes to save"
            ) : (
              "Save routine"
            )}
          </button>
        </div>
      </div>

      <PrototypeNote />

      <BedtimeSheet open={bedtimeOpen} value={draft.bedtime} onClose={() => setBedtimeOpen(false)} onChange={(bedtime) => set({ bedtime })} />
    </div>
  );
}

function pick(p: Routine): Routine {
  return Object.fromEntries(ROUTINE_KEYS.map((k) => [k, p[k]])) as unknown as Routine;
}

const PRESETS = ["22:00", "22:30", "23:00", "23:30"];

function BedtimeSheet({ open, value, onClose, onChange }: { open: boolean; value: string; onClose: () => void; onChange: (v: string) => void }) {
  const [h, m] = value.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const pm = h >= 12;
  const setTime = (hours: number, minutes: number) => {
    const total = (((hours * 60 + minutes) % 1440) + 1440) % 1440;
    onChange(`${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`);
  };
  const stepper = "grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20";

  return (
    <Sheet open={open} onClose={onClose} title="Bedtime" description="When do you want to be asleep?">
      <div className="flex items-center justify-center gap-4" role="group" aria-label="Bedtime">
        <div className="flex flex-col items-center gap-2">
          <button type="button" className={stepper} aria-label="Later by one hour" onClick={() => setTime(h + 1, m)}>
            <Plus className="size-5" aria-hidden />
          </button>
          <span className="font-display text-5xl font-semibold text-white tabular-nums" aria-hidden>
            {h12}
          </span>
          <button type="button" className={stepper} aria-label="Earlier by one hour" onClick={() => setTime(h - 1, m)}>
            <Minus className="size-5" aria-hidden />
          </button>
        </div>
        <span className="font-display text-5xl text-moon" aria-hidden>
          :
        </span>
        <div className="flex flex-col items-center gap-2">
          <button type="button" className={stepper} aria-label="Later by 5 minutes" onClick={() => setTime(h, m + 5)}>
            <Plus className="size-5" aria-hidden />
          </button>
          <span className="font-display text-5xl font-semibold text-white tabular-nums" aria-hidden>
            {String(m).padStart(2, "0")}
          </span>
          <button type="button" className={stepper} aria-label="Earlier by 5 minutes" onClick={() => setTime(h, m - 5)}>
            <Minus className="size-5" aria-hidden />
          </button>
        </div>
        <div className="ml-2 flex flex-col gap-2" role="radiogroup" aria-label="AM or PM">
          {(["AM", "PM"] as const).map((p) => {
            const checked = (p === "PM") === pm;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => !checked && setTime(h + (p === "PM" ? 12 : -12), m)}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${checked ? "bg-glow text-white" : "bg-white/5 text-haze hover:text-white"}`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-moon" aria-live="polite">
        Bedtime: {formatClock(value)}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={p === value}
            className={`rounded-xl py-2 text-xs font-semibold ${p === value ? "bg-aqua text-night-900" : "bg-white/5 text-moon hover:bg-white/10"}`}
          >
            {formatClock(p)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 h-12 w-full rounded-full bg-gradient-to-b from-glow to-glow-600 font-semibold text-white"
      >
        Done
      </button>
      <p className="mt-2 text-center text-xs text-haze">Remember to save your routine.</p>
    </Sheet>
  );
}
