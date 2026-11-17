export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "night"; className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[-0.03em] ${className}`}>
      <span className={tone === "light" ? "text-ink" : "text-white"}>Sleep</span>
      <span className={tone === "light" ? "text-iris" : "text-moon"}>Pillow</span>
      <sup className={`ml-0.5 text-[0.35em] font-semibold ${tone === "light" ? "text-ink" : "text-moon"}`}>™</sup>
    </span>
  );
}

/** Crescent moon with sparkles, as in the brand references. */
export function MoonMark({ className = "", tone = "light" }: { className?: string; tone?: "light" | "night" }) {
  const id = tone === "light" ? "moon-l" : "moon-n";
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone === "light" ? "#8f82ff" : "#ffffff"} />
          <stop offset="1" stopColor={tone === "light" ? "#3a2cf2" : "#c9c3ff"} />
        </linearGradient>
      </defs>
      <path d="M44 8a32 32 0 1 0 30 44A26 26 0 0 1 44 8Z" fill={`url(#${id})`} />
      <path d="M80 4l2.6 7.4L90 14l-7.4 2.6L80 24l-2.6-7.4L70 14l7.4-2.6Z" fill={tone === "light" ? "#5b4dff" : "#fff"} />
      <path d="M66 26l1.4 3.6L71 31l-3.6 1.4L66 36l-1.4-3.6L61 31l3.6-1.4Z" fill={tone === "light" ? "#5b4dff" : "#fff"} />
    </svg>
  );
}
