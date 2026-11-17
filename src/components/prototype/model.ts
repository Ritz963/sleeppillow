import type { LucideIcon } from "lucide-react";
import { Clapperboard, Gamepad2, MessageCircle, Newspaper, ShoppingBag, Users } from "lucide-react";

export const COOLING_LEVELS = ["Off", "Gentle", "Balanced", "Cool"] as const;
export const HAPTIC_LEVELS = ["Off", "Gentle", "Medium"] as const;
export const DURATIONS = [5, 10, 15, 20, 30] as const;

export type Cooling = (typeof COOLING_LEVELS)[number];
export type Haptics = (typeof HAPTIC_LEVELS)[number];
export type Duration = (typeof DURATIONS)[number];
export type SoundId = "ocean" | "rain" | "breeze";
export type Tab = "tonight" | "routine" | "sounds" | "device";
export type Connection = "disconnected" | "connecting" | "connected";

export interface Routine {
  bedtime: string; // "HH:MM", 24h
  duration: Duration;
  cooling: Cooling;
  haptics: Haptics;
  appLock: boolean;
  blockedApps: string[];
}

export interface Prefs extends Routine {
  sound: SoundId;
  volume: number; // 0..1
}

export type Session =
  | { status: "idle" }
  | { status: "running"; endsAt: number; durationMs: number }
  | { status: "paused"; remainingMs: number; durationMs: number }
  | { status: "complete"; durationMs: number };

export const DEFAULT_PREFS: Prefs = {
  bedtime: "22:30",
  duration: 20,
  cooling: "Balanced",
  haptics: "Gentle",
  appLock: true,
  blockedApps: ["social", "video", "games"],
  sound: "ocean",
  volume: 0.6,
};

export const SOUNDS: { id: SoundId; name: string; long: string; blurb: string }[] = [
  { id: "ocean", name: "Ocean", long: "Ocean waves", blurb: "Slow swells rolling in" },
  { id: "rain", name: "Rain", long: "Soft rain", blurb: "Steady rain on the window" },
  { id: "breeze", name: "Night breeze", long: "Night breeze", blurb: "Wind through tall grass" },
];

export const EXAMPLE_APPS: { id: string; name: string; Icon: LucideIcon; color: string }[] = [
  { id: "social", name: "Social feed", Icon: Users, color: "from-[#ff7a9a] to-[#c3368d]" },
  { id: "video", name: "Short videos", Icon: Clapperboard, color: "from-[#5ad6ff] to-[#3a52e0]" },
  { id: "messages", name: "Group chats", Icon: MessageCircle, color: "from-[#5ff0a8] to-[#13a06d]" },
  { id: "news", name: "News", Icon: Newspaper, color: "from-[#ffb36b] to-[#e0613a]" },
  { id: "games", name: "Games", Icon: Gamepad2, color: "from-[#b48bff] to-[#6a3ae0]" },
  { id: "shopping", name: "Shopping", Icon: ShoppingBag, color: "from-[#ffd95a] to-[#e0a21a]" },
];

export const COOLING_COPY: Record<Cooling, string> = {
  Off: "No cooling tonight",
  Gentle: "A light, barely-there chill",
  Balanced: "Noticeably cool, never cold",
  Cool: "The coolest setting",
};

export const HAPTIC_COPY: Record<Haptics, string> = {
  Off: "No vibration",
  Gentle: "Soft, slow pulses to pace your breathing",
  Medium: "Firmer pulses you'll clearly notice",
};

export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function subtractMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m - minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatTimer(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function soundName(id: SoundId, long = false) {
  const s = SOUNDS.find((x) => x.id === id)!;
  return long ? s.long : s.name;
}

export function sanitizePrefs(raw: unknown): Prefs {
  const p = { ...DEFAULT_PREFS, ...(raw && typeof raw === "object" ? raw : {}) } as Prefs;
  return {
    bedtime: /^\d{2}:\d{2}$/.test(p.bedtime) ? p.bedtime : DEFAULT_PREFS.bedtime,
    duration: (DURATIONS as readonly number[]).includes(p.duration) ? p.duration : DEFAULT_PREFS.duration,
    cooling: (COOLING_LEVELS as readonly string[]).includes(p.cooling) ? p.cooling : DEFAULT_PREFS.cooling,
    haptics: (HAPTIC_LEVELS as readonly string[]).includes(p.haptics) ? p.haptics : DEFAULT_PREFS.haptics,
    appLock: typeof p.appLock === "boolean" ? p.appLock : DEFAULT_PREFS.appLock,
    blockedApps: Array.isArray(p.blockedApps) ? p.blockedApps.filter((id) => EXAMPLE_APPS.some((a) => a.id === id)) : DEFAULT_PREFS.blockedApps,
    sound: SOUNDS.some((s) => s.id === p.sound) ? p.sound : DEFAULT_PREFS.sound,
    volume: typeof p.volume === "number" && p.volume >= 0 && p.volume <= 1 ? p.volume : DEFAULT_PREFS.volume,
  };
}
