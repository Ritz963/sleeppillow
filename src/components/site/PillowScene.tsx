import { AudioWaveform, Lock, Snowflake, Waves } from "lucide-react";
import type { ComponentType } from "react";

/** Product illustration: an original vector pillow in a dusk bedroom scene. */

type Callout = {
  label: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: "mint" | "lav";
  icon: [number, number]; // icon-circle centre, % of scene
  dot: [number, number]; // point on the pillow, % of scene
};

export const CALLOUTS: Callout[] = [
  { label: "Cooling", Icon: Snowflake, tone: "mint", icon: [14, 21], dot: [33.75, 51.5] },
  { label: "Wave audio", Icon: Waves, tone: "lav", icon: [65, 19], dot: [63.75, 49.6] },
  { label: "Gentle haptics", Icon: AudioWaveform, tone: "lav", icon: [8, 85], dot: [30, 64] },
  { label: "App lock", Icon: Lock, tone: "mint", icon: [66, 87], dot: [68, 63] },
];

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

export function PillowScene({ callouts = true, className = "" }: { callouts?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className="relative aspect-[16/11] w-full">
        {/* Backdrop, faded into the page at the edges */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: "radial-gradient(ellipse 50% 50% at 55% 50%, #000 62%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 55% 50%, #000 62%, transparent 100%)",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#e3dff8] via-[#ece9fb] to-[#f4f2fd]" />
          {/* lamp glow */}
          <div className="absolute top-[4%] left-[2%] size-[44%] rounded-full bg-[radial-gradient(circle,rgba(255,214,160,0.75)_0%,rgba(255,214,160,0.25)_40%,transparent_70%)]" />
          {/* window with night sky */}
          <div className="absolute top-0 right-[5%] h-[42%] w-[38%] overflow-hidden rounded-b-2xl bg-gradient-to-b from-[#1b1960] via-[#2b2985] to-[#5552b5]">
            {[
              [12, 18], [30, 10], [48, 30], [22, 46], [64, 16], [86, 40], [40, 60], [70, 55], [56, 8],
            ].map(([x, y], i) => (
              <span
                key={i}
                className="anim-twinkle absolute size-[3px] rounded-full bg-white"
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.4}s` }}
              />
            ))}
            <span className="absolute top-[14%] right-[16%] aspect-square w-[14%] rounded-full shadow-[inset_-9px_5px_0_0_#f2f0ff]" />
            <span className="absolute top-0 left-1/2 h-full w-[3%] -translate-x-1/2 bg-[#d9d5f4]" />
            <span className="absolute bottom-0 left-[-6%] h-[26%] w-[48%] rounded-[50%_50%_0_0] bg-[#14124a]" />
            <span className="absolute right-[-8%] bottom-0 h-[34%] w-[40%] rounded-[50%_50%_0_0] bg-[#17155a]" />
          </div>
          <div className="absolute top-0 right-[40%] h-[46%] w-[6%] bg-gradient-to-r from-[#d8d3f3] to-[#c7c0ec] opacity-90" />
          <div className="absolute top-0 right-[1%] h-[46%] w-[6%] bg-gradient-to-r from-[#c7c0ec] to-[#d8d3f3] opacity-90" />
          {/* headboard */}
          <div className="absolute top-[26%] right-[-6%] left-[26%] h-[30%] rounded-t-[2.5rem] bg-gradient-to-b from-[#cdc8ea] to-[#bab4de] shadow-[inset_0_6px_14px_rgba(255,255,255,0.45)]" />
          {/* background pillows */}
          <div className="absolute top-[36%] right-[-2%] h-[18%] w-[30%] rounded-[45%] bg-gradient-to-b from-white to-[#e4e0f7] blur-[1px]" />
          {/* bed + duvet */}
          <div className="absolute right-[-10%] bottom-0 left-[-10%] h-[56%] rounded-t-[50%_30%] bg-gradient-to-b from-[#f9f8ff] to-[#e3dff6]" />
          <div className="absolute right-[6%] bottom-[8%] left-[4%] h-[10%] rounded-[50%] bg-white/60 blur-md" />
        </div>

        {/* Pillow */}
        <div className="absolute top-[26%] left-[10%] w-[80%]">
          <PillowSvg />
        </div>


        {callouts && (
          <div className="absolute inset-0 hidden sm:block">
            <svg viewBox="0 0 160 110" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
              {CALLOUTS.map((c) => (
                <g key={c.label}>
                  <line
                    x1={c.icon[0] * 1.6}
                    y1={c.icon[1] * 1.1}
                    x2={c.dot[0] * 1.6}
                    y2={c.dot[1] * 1.1}
                    stroke="#11103f"
                    strokeOpacity="0.55"
                    strokeWidth="0.35"
                    strokeDasharray="1.2 1"
                  />
                </g>
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
                  className="absolute flex -translate-y-1/2 items-center gap-2.5 rounded-full border border-white/90 bg-white/55 py-1 pr-5 pl-0 shadow-[0_10px_30px_-12px_rgba(17,16,63,0.35)] backdrop-blur-md"
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

function PillowSvg() {
  // Classic pillow silhouette: pinched corners, gently concave sides, puffy centre.
  const shape = "M60,70 C220,94 430,86 585,58 C572,130 580,200 622,266 C430,246 210,252 22,282 C46,210 40,140 60,70 Z";
  return (
    <svg viewBox="0 0 640 360" className="w-full drop-shadow-[0_24px_30px_rgba(40,32,140,0.2)]" role="img" aria-label="Illustration of the SleepPillow concept pillow">
      <defs>
        <linearGradient id="pl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaff" />
          <stop offset="0.55" stopColor="#f1effc" />
          <stop offset="1" stopColor="#d6d0f3" />
        </linearGradient>
        <pattern id="pl-stripes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-70)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#b7afe6" strokeWidth="1" />
        </pattern>
        <clipPath id="pl-clip">
          <path d={shape} />
        </clipPath>
        <filter id="pl-blur-lg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="pl-blur-sm">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <ellipse cx="320" cy="292" rx="300" ry="22" fill="#2a2290" opacity="0.2" filter="url(#pl-blur-sm)" />
      <path d={shape} fill="url(#pl-body)" />
      <g clipPath="url(#pl-clip)">
        <rect width="640" height="360" fill="url(#pl-stripes)" opacity="0.22" />
        <path d={shape} fill="none" stroke="#6f64cf" strokeWidth="80" opacity="0.3" filter="url(#pl-blur-lg)" />
        <ellipse cx="315" cy="165" rx="215" ry="62" fill="#fff" opacity="0.95" filter="url(#pl-blur-lg)" />
        {/* soft creases running in from the corners */}
        <g fill="none" stroke="#a79ee0" strokeWidth="2" strokeLinecap="round" opacity="0.45">
          <path d="M66,82 C100,104 122,118 150,126" />
          <path d="M578,70 C548,96 528,110 500,120" />
          <path d="M612,256 C580,236 556,226 528,222" />
          <path d="M32,272 C70,250 94,240 124,236" />
        </g>
      </g>
      {/* seam piping around the edge */}
      <path d={shape} fill="none" stroke="#c4bdee" strokeWidth="5" strokeLinejoin="round" />
      <path d={shape} fill="none" stroke="#fdfcff" strokeWidth="1.6" strokeLinejoin="round" />
      {/* fabric tag */}
      <g transform="translate(478 226) rotate(-4)">
        <rect width="74" height="20" rx="3" fill="#2b2870" />
        <text x="37" y="13.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
          SleepPillow
        </text>
      </g>
    </svg>
  );
}
