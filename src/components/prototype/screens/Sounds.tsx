"use client";

import { Check, Pause, Play, Volume1, Volume2 } from "lucide-react";
import { soundEngine } from "../audio";
import { useApp } from "../AppState";
import { SOUNDS, type SoundId } from "../model";
import { Card, PrototypeNote, ScreenHeader } from "../ui";

export function SoundsScreen({ headingRef }: { headingRef: React.Ref<HTMLHeadingElement> }) {
  const app = useApp();
  const { prefs, playing } = app;
  const volumePct = Math.round(prefs.volume * 100);

  return (
    <div>
      <ScreenHeader title="Sounds" subtitle="Choose a soundscape for tonight." headingRef={headingRef} />

      {!soundEngine.supported && (
        <p className="mb-4 rounded-2xl bg-amber-300/10 p-3 text-sm text-amber-100">This browser can&apos;t play generated audio.</p>
      )}

      <div role="radiogroup" aria-label="Soundscape for tonight" className="space-y-3">
        {SOUNDS.map((s) => {
          const selected = prefs.sound === s.id;
          const isPlaying = playing === s.id;
          return (
            <div
              key={s.id}
              className={`relative h-32 overflow-hidden rounded-[1.5rem] border-2 transition-colors ${
                selected ? "border-aqua shadow-[0_0_24px_-6px_rgba(143,242,218,0.6)]" : "border-[#4a47c4]/50"
              }`}
            >
              <SoundArt id={s.id} />
              {/* Whole card selects the sound; the play button sits above it. */}
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  if (selected) return;
                  app.updatePrefs({ sound: s.id });
                  if (playing && playing !== s.id) app.playSound(s.id);
                  app.showToast(`${s.long} selected for tonight`);
                }}
                className="absolute inset-0 flex flex-col justify-end rounded-[1.4rem] p-4 pl-[4.75rem] text-left"
              >
                <span className="font-display text-2xl font-semibold text-white drop-shadow">{s.name}</span>
                <span className="text-sm text-moon">{selected ? "Selected for tonight" : s.blurb}</span>
              </button>
              <button
                type="button"
                onClick={() => (isPlaying ? app.stopSound() : app.playSound(s.id))}
                aria-label={isPlaying ? `Pause ${s.name} preview` : `Play ${s.name} preview`}
                className="absolute bottom-4 left-4 grid size-12 place-items-center rounded-full border-2 border-white/80 bg-night-900/40 text-white backdrop-blur hover:bg-night-900/70"
              >
                {isPlaying ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 translate-x-px fill-current" aria-hidden />}
              </button>
              {isPlaying && (
                <span aria-hidden className="absolute top-4 left-4 flex h-5 items-end gap-0.5">
                  {[0, 0.2, 0.4, 0.1].map((d, i) => (
                    <span key={i} className="anim-eq w-1 rounded-full bg-aqua" style={{ height: "100%", animationDelay: `${d}s` }} />
                  ))}
                </span>
              )}
              {selected && (
                <span aria-hidden className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-aqua text-night-900">
                  <Check className="size-5" strokeWidth={3} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Card className="mt-4">
        <label htmlFor="volume" className="flex items-center justify-between text-sm font-semibold text-moon">
          Volume <span className="text-white tabular-nums">{volumePct}%</span>
        </label>
        <div className="mt-3 flex items-center gap-3">
          <Volume1 className="size-5 text-haze" aria-hidden />
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumePct}
            onChange={(e) => app.updatePrefs({ volume: Number(e.target.value) / 100 })}
            aria-valuetext={`${volumePct} percent`}
            className="night-range flex-1"
            style={{ "--fill": `${volumePct}%` } as React.CSSProperties}
          />
          <Volume2 className="size-5 text-haze" aria-hidden />
        </div>
      </Card>

      <p className="mt-4 px-2 text-center text-xs text-haze">
        Sounds are generated live in your browser and only play after you press play. Starting one stops any other.
      </p>
      <PrototypeNote />
    </div>
  );
}

function SoundArt({ id }: { id: SoundId }) {
  if (id === "ocean") {
    return (
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#2a2783] via-[#3b3aa6] to-[#141256]">
        <span className="absolute top-[30%] left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-moon/70 blur-[3px]" />
        <span className="absolute top-[18%] left-1/2 size-8 -translate-x-1/2 rounded-full bg-moon/80 blur-[2px]" />
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full">
          <path d="M0 20 Q50 5 100 20 T200 20 T300 20 T400 20 V80 H0Z" fill="#1c1a6a" />
          <path d="M0 40 Q50 25 100 40 T200 40 T300 40 T400 40 V80 H0Z" fill="#121050" />
          <path d="M150 22 h100" stroke="#cfcaff" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>
    );
  }
  if (id === "rain") {
    return (
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#1d2a6e] via-[#2c2f87] to-[#171556]">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-px rounded-full bg-gradient-to-b from-transparent to-white/60"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 70}%`, height: `${14 + ((i * 7) % 20)}px` }}
          />
        ))}
        <span className="absolute bottom-3 left-[30%] size-6 rounded-full bg-[#ffb36b]/40 blur-md" />
        <span className="absolute right-[18%] bottom-5 size-8 rounded-full bg-[#ffb36b]/30 blur-md" />
      </div>
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#3a3496] via-[#4a44ae] to-[#211e6e]">
      <span className="absolute top-[20%] right-[28%] h-6 w-20 rounded-full bg-white/25 blur-sm" />
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/5 w-full">
        <path d="M0 50 Q100 30 200 46 T400 40 V80 H0Z" fill="#1d1a62" />
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 220 + i * 7;
          return <path key={i} d={`M${x} 80 Q${x + 4} 50 ${x + 14 + (i % 3) * 4} ${22 + (i % 5) * 6}`} stroke="#141250" strokeWidth="2" fill="none" />;
        })}
      </svg>
    </div>
  );
}
