/** Soft decorative cloud banks used along section edges. */
export function CloudBank({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className={`pointer-events-none ${flip ? "-scale-x-100" : ""} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="cloud-blur" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g filter="url(#cloud-blur)">
        <path
          d="M0 160V96c40-30 90-38 130-18 18-40 78-54 118-24 30-44 110-46 140 0 30-22 80-18 100 14 40-30 110-26 130 14 26-34 96-40 128-4 34-40 112-36 138 8 30-24 84-22 110 8 40-26 100-20 126 14 36-18 68-14 80-8V160Z"
          fill="#ffffff"
          opacity="0.9"
        />
        <path
          d="M0 160v-40c60-26 120-20 160 6 40-26 100-28 150 4 50-30 130-30 180 6 50-26 120-24 170 4 50-30 140-26 180 6 60-28 130-22 170 6 50-24 110-20 190 14V160Z"
          fill="#efecfd"
        />
      </g>
    </svg>
  );
}

export function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 110" className={`pointer-events-none ${className}`} aria-hidden="true">
      <path
        d="M40 96a30 30 0 0 1 4-60 40 40 0 0 1 74-14 34 34 0 0 1 56 20 28 28 0 0 1 6 54Z"
        fill="#fff"
        opacity="0.85"
      />
    </svg>
  );
}
