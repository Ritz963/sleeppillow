"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { soundEngine } from "./audio";
import { DEFAULT_PREFS, sanitizePrefs, type Connection, type Prefs, type Session, type SoundId, type Tab } from "./model";

const STORAGE_KEY = "sp.demo.v1";
const IDLE: Session = { status: "idle" };

interface Persisted {
  prefs: Prefs;
  session: Session;
  connection: Connection;
}

function load(): Persisted {
  const fallback: Persisted = { prefs: DEFAULT_PREFS, session: { status: "idle" }, connection: "connected" };
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw) return fallback;
    const s = raw.session as Session | undefined;
    const session: Session =
      s && ["idle", "running", "paused", "complete"].includes(s.status) ? s : { status: "idle" };
    return {
      prefs: sanitizePrefs(raw.prefs),
      session,
      connection: raw.connection === "disconnected" ? "disconnected" : "connected",
    };
  } catch {
    return fallback;
  }
}

interface AppStateValue {
  prefs: Prefs;
  updatePrefs: (patch: Partial<Prefs>) => void;
  session: Session;
  remainingMs: number;
  begin: () => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  dismissComplete: () => void;
  connection: Connection;
  connect: () => void;
  disconnect: () => void;
  playing: SoundId | null;
  playSound: (id: SoundId) => void;
  stopSound: () => void;
  tab: Tab;
  goTo: (tab: Tab) => void;
  toast: { id: number; message: string } | null;
  showToast: (message: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function useApp() {
  const v = use(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppStateProvider>");
  return v;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted | null>(null);
  const [now, setNow] = useState(0); // set in effects/handlers (Date.now() cannot run during prerender)
  const [tab, setTab] = useState<Tab>("tonight");
  const [toast, setToast] = useState<AppStateValue["toast"]>(null);
  const connectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playing = useSyncExternalStore(soundEngine.subscribe, soundEngine.getSnapshot, () => null);

  // Hydrate from localStorage after mount (the server has no access to it).
  useEffect(() => {
    const loaded = load();
    soundEngine.setVolume(loaded.prefs.volume);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setNow(Date.now());
    setState(loaded);
    return () => {
      soundEngine.stop();
      clearTimeout(connectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, connection: state.connection === "connecting" ? "disconnected" : state.connection }),
      );
    } catch {
      /* storage unavailable: the demo still works for this visit */
    }
  }, [state]);

  const session = state?.session ?? IDLE;
  const prefs = state?.prefs ?? DEFAULT_PREFS;

  // Tick only while running. The countdown is derived from an absolute end time,
  // so it stays correct across tab switches, background tabs and reloads.
  useEffect(() => {
    if (session.status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [session.status]);

  const remainingMs =
    session.status === "running"
      ? Math.max(0, session.endsAt - now)
      : session.status === "paused"
        ? session.remainingMs
        : session.status === "complete"
          ? 0
          : prefs.duration * 60_000;

  useEffect(() => {
    if (session.status === "running" && remainingMs <= 0) {
      soundEngine.stop();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the countdown reached zero
      setState((s) => (s ? { ...s, session: { status: "complete", durationMs: session.durationMs } } : s));
    }
  }, [session, remainingMs]);

  const setSession = useCallback((next: Session) => setState((s) => (s ? { ...s, session: next } : s)), []);

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const value = useMemo<AppStateValue>(
    () => ({
      prefs,
      updatePrefs: (patch) => {
        if (patch.volume !== undefined) soundEngine.setVolume(patch.volume);
        setState((s) => (s ? { ...s, prefs: { ...s.prefs, ...patch } } : s));
      },
      session,
      remainingMs,
      begin: () => {
        const durationMs = prefs.duration * 60_000;
        setNow(Date.now());
        setSession({ status: "running", endsAt: Date.now() + durationMs, durationMs });
        soundEngine.play(prefs.sound);
      },
      pause: () => {
        if (session.status !== "running") return;
        setSession({ status: "paused", remainingMs: Math.max(0, session.endsAt - Date.now()), durationMs: session.durationMs });
        soundEngine.stop();
      },
      resume: () => {
        if (session.status !== "paused") return;
        setNow(Date.now());
        setSession({ status: "running", endsAt: Date.now() + session.remainingMs, durationMs: session.durationMs });
        soundEngine.play(prefs.sound);
      },
      end: () => {
        setSession({ status: "idle" });
        soundEngine.stop();
      },
      dismissComplete: () => setSession({ status: "idle" }),
      connection: state?.connection ?? "connected",
      connect: () => {
        setState((s) => (s ? { ...s, connection: "connecting" } : s));
        clearTimeout(connectTimer.current);
        connectTimer.current = setTimeout(() => {
          setState((s) => (s ? { ...s, connection: "connected" } : s));
          showToast("Simulated pillow connected");
        }, 1600);
      },
      disconnect: () => {
        clearTimeout(connectTimer.current);
        setState((s) => (s ? { ...s, connection: "disconnected" } : s));
        showToast("Simulated pillow disconnected");
      },
      playing,
      playSound: (id) => soundEngine.play(id),
      stopSound: () => soundEngine.stop(),
      tab,
      goTo: setTab,
      toast,
      showToast,
      resetDemo: () => {
        soundEngine.stop();
        clearTimeout(connectTimer.current);
        soundEngine.setVolume(DEFAULT_PREFS.volume);
        setState({ prefs: DEFAULT_PREFS, session: { status: "idle" }, connection: "connected" });
        setTab("tonight");
        showToast("Demo reset to defaults");
      },
    }),
    [prefs, session, remainingMs, state?.connection, playing, tab, toast, setSession, showToast],
  );

  if (!state) {
    return (
      <div className="grid h-full place-items-center" role="status">
        <span className="sr-only">Loading the SleepPillow prototype…</span>
        <span aria-hidden className="anim-breathe size-16 rounded-full bg-glow/40" />
      </div>
    );
  }
  return <Ctx value={value}>{children}</Ctx>;
}
