"use client";

import { useEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";
import { CALLOUTS, CalloutIcon, PillowScene } from "@/components/site/PillowScene";
import type { FrameInfo, PillowViewer } from "./engine";

/**
 * Landing-page hero: an interactive 3D pillow with feature callouts that stay pinned to points on it.
 * The 3D engine (three.js) is loaded on demand; without WebGL the static render is shown instead.
 */

// Where each chip sits (icon centre, % of the stage) and the point on the pillow it points at (u, v).
const LAYOUT: Record<string, { chip: [number, number]; uv: [number, number] }> = {
  "Wave audio": { chip: [5, 13], uv: [-0.42, 0.42] },
  Cooling: { chip: [63, 7], uv: [0.32, 0.5] },
  "Gentle haptics": { chip: [4, 83], uv: [-0.48, -0.4] },
  "App lock": { chip: [65, 90], uv: [0.42, -0.46] },
};
const CHIPS = CALLOUTS.map((c) => ({ ...c, ...LAYOUT[c.label] }));

type Mode = "loading" | "ready" | "fallback";

export function HeroPillow({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [hinted, setHinted] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let viewer: PillowViewer | null = null;
    let cancelled = false;

    const onFrame = ({ anchors, width, height, time, reduced }: FrameInfo) => {
      const sway = reduced ? 0 : 1;
      CHIPS.forEach((c, i) => {
        // Each chip drifts on its own slow, out-of-phase orbit.
        const dx = sway * 5 * Math.sin(time * 0.55 + i * 1.9);
        const dy = sway * 7 * Math.sin(time * 0.8 + i * 2.4);
        const chip = chipRefs.current[i];
        const dot = dotRefs.current[i];
        const line = lineRefs.current[i];
        const a = anchors[i];
        if (chip) chip.style.transform = `translate(${dx}px, calc(-50% + ${dy}px))`;
        if (dot) {
          dot.style.transform = `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(${0.4 + 0.6 * a.visibility})`;
          dot.style.opacity = String(a.visibility);
        }
        if (line) {
          line.setAttribute("x1", String((c.chip[0] / 100) * width + dx));
          line.setAttribute("y1", String((c.chip[1] / 100) * height + dy));
          line.setAttribute("x2", String(a.x));
          line.setAttribute("y2", String(a.y));
          line.style.opacity = String(a.visibility);
        }
      });
    };

    import("./engine")
      .then(({ createPillowViewer }) => {
        if (cancelled) return;
        viewer = createPillowViewer(host, {
          anchors: CHIPS.map((c) => c.uv),
          onFrame,
          onInteract: () => setHinted(true),
        });
        setMode("ready");
      })
      .catch((err) => {
        console.warn("[sleeppillow] 3D pillow unavailable, showing the static image.", err);
        if (!cancelled) setMode("fallback");
      });

    return () => {
      cancelled = true;
      viewer?.dispose();
    };
  }, []);

  if (mode === "fallback") return <PillowScene preload className={className} />;

  const ready = mode === "ready";
  return (
    <div className={className}>
      <div className="relative aspect-[1182/926] w-full">
        <div
          aria-hidden
          className="anim-breathe pointer-events-none absolute inset-[12%_14%] rounded-full bg-[radial-gradient(circle,rgba(143,130,255,0.32),rgba(215,209,246,0.18)_45%,transparent_70%)] blur-2xl"
        />

        <div
          ref={hostRef}
          tabIndex={0}
          role="application"
          aria-roledescription="3D model"
          aria-label="SleepPillow in 3D. Drag, or use the arrow keys, to spin it."
          data-testid="pillow-3d"
          className={`absolute inset-0 cursor-grab touch-pan-y rounded-[2rem] transition-[opacity,scale] duration-1000 ease-out select-none data-[dragging]:cursor-grabbing ${
            ready ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        />

        {/* Callouts: decorative overlay (the list below carries the same text on small screens). */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <svg className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            {CHIPS.map((c, i) => (
              <line
                key={c.label}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                stroke="#11103f"
                strokeOpacity="0.45"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />
            ))}
          </svg>
          {CHIPS.map((c, i) => (
            <span
              key={c.label}
              aria-hidden="true"
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 size-3 rounded-full border-2 border-white bg-iris shadow-[0_0_0_5px_rgba(58,44,242,0.16)]"
              style={{ opacity: 0 }}
            />
          ))}
          {CHIPS.map((c, i) => (
            <span
              key={c.label}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className={`absolute flex items-center gap-2.5 rounded-full border border-white/90 bg-white/65 py-1 pr-5 pl-0 shadow-[0_10px_30px_-12px_rgba(17,16,63,0.35)] backdrop-blur-md transition-opacity duration-700 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
              style={{
                left: `calc(${c.chip[0]}% - 1.5rem)`,
                top: `${c.chip[1]}%`,
                transform: "translateY(-50%)",
                transitionDelay: ready ? `${300 + i * 140}ms` : "0ms",
              }}
            >
              <CalloutIcon Icon={c.Icon} tone={c.tone} />
              <span className="text-[0.95rem] font-semibold whitespace-nowrap text-ink">{c.label}</span>
            </span>
          ))}
        </div>
      </div>

      <p
        aria-hidden="true"
        className={`mx-auto mt-1 flex w-fit items-center gap-2 rounded-full bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-opacity duration-700 ${
          ready && !hinted ? "opacity-100" : "opacity-0"
        }`}
      >
        <Rotate3d className="size-4 text-iris" />
        Drag to spin
      </p>

      <ul className="mt-2 grid grid-cols-2 gap-2.5 sm:hidden" aria-label="Pillow features">
        {CALLOUTS.map((c) => (
          <li key={c.label} className="flex items-center gap-2.5 rounded-full border border-white bg-white/70 p-1 pr-3">
            <CalloutIcon Icon={c.Icon} tone={c.tone} />
            <span className="text-sm font-semibold text-ink">{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
