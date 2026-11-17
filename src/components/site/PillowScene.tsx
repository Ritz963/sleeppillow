import Image from "next/image";
import { AudioWaveform, Lock, Snowflake, Waves } from "lucide-react";
import type { ComponentType } from "react";
import pillowImage from "@/assets/pillow.webp";

/** Product visual: the floating 3D pillow render, with feature callouts on wider screens. */

type Callout = {
  label: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: "mint" | "lav";
  icon: [number, number]; // icon-circle centre, % of the image
  dot: [number, number]; // point on the pillow, % of the image
};

// Positions keep the chips clear of the artwork's own sound waves and moon.
export const CALLOUTS: Callout[] = [
  { label: "Cooling", Icon: Snowflake, tone: "mint", icon: [44, 12], dot: [60, 40] },
  { label: "Wave audio", Icon: Waves, tone: "lav", icon: [5, 7], dot: [38, 37] },
  { label: "Gentle haptics", Icon: AudioWaveform, tone: "lav", icon: [5, 87], dot: [27, 62] },
  { label: "App lock", Icon: Lock, tone: "mint", icon: [57, 93], dot: [66, 67] },
];

const W = pillowImage.width;
const H = pillowImage.height;

export function CalloutIcon({ Icon, tone, size = "md" }: Pick<Callout, "Icon" | "tone"> & { size?: "md" | "lg" }) {
  const dims = size === "lg" ? "size-14" : "size-12";
  return (
    <span
      className={`grid ${dims} shrink-0 place-items-center rounded-full ring-4 ring-white/70 ${
        tone === "mint" ? "bg-mint-200 text-ink" : "bg-lav-200 text-iris"
      }`}
    >
      <Icon className="size-6" aria-hidden />
    </span>
  );
}

// Feather all four edges so the render's own background melts into the page.
const EDGE_FADE =
  "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 16%, #000 88%, transparent)";

export function PillowScene({ callouts = true, preload = false, className = "" }: { callouts?: boolean; preload?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <Image
          src={pillowImage}
          alt="The SleepPillow concept: a soft white pillow floating above its shadow, with sound waves and a crescent moon"
          preload={preload}
          sizes="(min-width: 1024px) 620px, 100vw"
          className="absolute inset-0 size-full object-cover"
          style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
        />

        {callouts && (
          <div className="absolute inset-0 hidden sm:block">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden="true">
              {CALLOUTS.map((c) => (
                <line
                  key={c.label}
                  x1={(c.icon[0] / 100) * W}
                  y1={(c.icon[1] / 100) * H}
                  x2={(c.dot[0] / 100) * W}
                  y2={(c.dot[1] / 100) * H}
                  stroke="#11103f"
                  strokeOpacity="0.5"
                  strokeWidth="2.5"
                  strokeDasharray="8 7"
                />
              ))}
            </svg>
            {CALLOUTS.map((c) => (
              <span key={c.label}>
                <span
                  aria-hidden="true"
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-iris shadow-[0_0_0_4px_rgba(58,44,242,0.18)]"
                  style={{ left: `${c.dot[0]}%`, top: `${c.dot[1]}%` }}
                />
                <span
                  className="absolute flex -translate-y-1/2 items-center gap-2.5 rounded-full border border-white/90 bg-white/60 py-1 pr-5 pl-0 shadow-[0_10px_30px_-12px_rgba(17,16,63,0.35)] backdrop-blur-md"
                  style={{ left: `calc(${c.icon[0]}% - 1.5rem)`, top: `${c.icon[1]}%` }}
                >
                  <CalloutIcon Icon={c.Icon} tone={c.tone} />
                  <span className="text-[0.95rem] font-semibold whitespace-nowrap text-ink">{c.label}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {callouts && (
        <ul className="mt-2 grid grid-cols-2 gap-2.5 sm:hidden" aria-label="Pillow features">
          {CALLOUTS.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 rounded-full border border-white bg-white/70 p-1 pr-3">
              <CalloutIcon Icon={c.Icon} tone={c.tone} />
              <span className="text-sm font-semibold text-ink">{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
