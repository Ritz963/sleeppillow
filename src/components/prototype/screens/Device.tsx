"use client";

import { AudioWaveform, BatteryMedium, Bluetooth, Info, Loader2, RotateCcw, Smartphone, Snowflake } from "lucide-react";
import { useState } from "react";
import { useApp } from "../AppState";
import { Card, PrototypeNote, ScreenHeader, Sheet, SimBadge } from "../ui";

export function DeviceScreen({ headingRef }: { headingRef: React.Ref<HTMLHeadingElement> }) {
  const app = useApp();
  const { connection } = app;
  const [confirmReset, setConfirmReset] = useState(false);
  const [testing, setTesting] = useState<"haptics" | "cooling" | null>(null);
  const connected = connection === "connected";

  function runTest(kind: "haptics" | "cooling") {
    setTesting(kind);
    app.showToast(kind === "haptics" ? "Simulated: test pulse sent to pillow" : "Simulated: cooling preview sent to pillow");
    setTimeout(() => setTesting(null), 2200);
  }

  return (
    <div>
      <ScreenHeader title="Device" subtitle="Your pillow and demo settings." headingRef={headingRef} />

      <Card>
        <div className="flex items-start justify-between">
          <h2 className="font-display text-lg font-bold text-white">SleepPillow</h2>
          <SimBadge />
        </div>

        <div className="relative mx-auto my-4 grid h-28 place-items-center">
          {testing && (
            <span aria-hidden className={`anim-pulse-ring absolute size-24 rounded-full ${testing === "cooling" ? "bg-sky-300/40" : "bg-aqua/40"}`} />
          )}
          <div
            aria-hidden
            className={`relative h-20 w-44 rounded-[45%] bg-gradient-to-b from-white to-[#cfc9f2] shadow-[0_14px_30px_-8px_rgba(0,0,0,0.5)] transition-opacity ${
              connected ? "opacity-100" : "opacity-45"
            }`}
          >
            <span className="absolute right-6 bottom-3 rounded-sm bg-night-800 px-1.5 text-[0.5rem] font-bold text-white">SleepPillow</span>
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 font-semibold" role="status" data-testid="connection-status">
          {connection === "connecting" ? (
            <>
              <Loader2 className="anim-spin size-4 text-moon" aria-hidden />
              <span className="text-moon">Connecting to simulated pillow…</span>
            </>
          ) : connected ? (
            <>
              <span aria-hidden className="size-2.5 rounded-full bg-aqua shadow-[0_0_10px_#8ff2da]" />
              <span className="text-white">Connected (simulated)</span>
            </>
          ) : (
            <>
              <span aria-hidden className="size-2.5 rounded-full bg-haze/60" />
              <span className="text-haze">Not connected</span>
            </>
          )}
        </p>

        {connected && (
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/5 p-3">
              <dt className="flex items-center gap-1.5 text-haze">
                <BatteryMedium className="size-4" aria-hidden /> Battery
              </dt>
              <dd className="mt-0.5 font-semibold text-white">82% (demo)</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <dt className="flex items-center gap-1.5 text-haze">
                <Bluetooth className="size-4" aria-hidden /> Link
              </dt>
              <dd className="mt-0.5 font-semibold text-white">Simulated</dd>
            </div>
          </dl>
        )}

        <div className="mt-4 space-y-2">
          {connected ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => runTest("haptics")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <AudioWaveform className="size-4" aria-hidden /> Test pulse
                </button>
                <button
                  type="button"
                  onClick={() => runTest("cooling")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <Snowflake className="size-4" aria-hidden /> Test cooling
                </button>
              </div>
              <button
                type="button"
                onClick={app.disconnect}
                className="h-12 w-full rounded-full border border-white/20 font-semibold text-moon hover:bg-white/10"
              >
                Disconnect pillow
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={app.connect}
              disabled={connection === "connecting"}
              className="h-13 w-full rounded-full bg-gradient-to-b from-glow to-glow-600 font-semibold text-white shadow-[0_12px_30px_-8px_rgba(106,92,255,0.95)] disabled:opacity-60"
            >
              {connection === "connecting" ? "Connecting…" : "Connect simulated pillow"}
            </button>
          )}
        </div>
        <p className="mt-3 flex gap-2 text-xs text-haze">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          No Bluetooth or real hardware is used. Connection, cooling, and haptics are simulated for this prototype.
        </p>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-11 place-items-center rounded-full bg-gradient-to-b from-night-700 to-night-800 text-moon">
            <Smartphone className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">Paired phone</h2>
            <p className="text-sm text-haze">App lock would run here in the real product. A website can&apos;t block other apps.</p>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold text-white">Demo</h2>
        <p className="mt-1 text-sm text-haze">Your routine and sound choices are saved in this browser only.</p>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          aria-haspopup="dialog"
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-300/40 font-semibold text-rose-200 hover:bg-rose-300/10"
        >
          <RotateCcw className="size-4" aria-hidden /> Reset demo
        </button>
      </Card>

      <PrototypeNote />

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        variant="dialog"
        title="Reset the demo?"
        description="This restores the default routine, sound, volume, and pillow connection, and ends any session."
      >
        <div className="flex gap-2">
          <button
            type="button"
            data-autofocus
            onClick={() => setConfirmReset(false)}
            className="h-12 flex-1 rounded-full border border-white/20 font-semibold text-moon hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmReset(false);
              app.resetDemo();
            }}
            className="h-12 flex-1 rounded-full bg-rose-400 font-semibold text-night-950 hover:bg-rose-300"
          >
            Reset
          </button>
        </div>
      </Sheet>
    </div>
  );
}
