import { promises as fs } from "node:fs";
import path from "node:path";
import type { EventInput, InsertResult, ReservationInput, Stats, Storage, WaitlistInput } from "./types";

/**
 * DEVELOPMENT-ONLY storage: a JSON file in .data/ (git-ignored).
 * Not suitable for serverless hosting, where the filesystem is ephemeral.
 */
const FILE = path.join(process.cwd(), ".data", "sleeppillow-dev.json");

interface Db {
  waitlist: (WaitlistInput & { createdAt: string })[];
  reservations: (ReservationInput & { termsAcknowledged: true; createdAt: string })[];
  events: (EventInput & { createdAt: string })[];
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialise read-modify-write cycles so concurrent requests can't clobber each other. */
function withDb<T>(fn: (db: Db) => T | Promise<T>, write: boolean): Promise<T> {
  const run = queue.then(async () => {
    let db: Db;
    try {
      db = JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      db = { waitlist: [], reservations: [], events: [] };
    }
    const result = await fn(db);
    if (write) {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(db, null, 2));
      await fs.rename(tmp, FILE);
    }
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

export const localFileStorage: Storage = {
  kind: "local-file",

  addWaitlistSignup(input: WaitlistInput) {
    return withDb<InsertResult>((db) => {
      if (db.waitlist.some((w) => w.email === input.email)) return "duplicate";
      db.waitlist.push({ ...input, createdAt: now() });
      return "created";
    }, true);
  },

  addReservation(input: ReservationInput) {
    return withDb<InsertResult>((db) => {
      if (db.reservations.some((r) => r.email === input.email)) return "duplicate";
      db.reservations.push({ ...input, termsAcknowledged: true, createdAt: now() });
      return "created";
    }, true);
  },

  logEvent(input: EventInput) {
    return withDb(async (db) => {
      db.events.push({ ...input, createdAt: now() });
    }, true);
  },

  getStats() {
    return withDb<Stats>((db) => {
      const arms = new Map<string, Stats["reservations"][number]>();
      for (const r of db.reservations) {
        const arm = arms.get(r.priceVersion) ?? { priceVersion: r.priceVersion, priceCents: r.priceCents, currency: r.currency, count: 0 };
        arm.count++;
        arms.set(r.priceVersion, arm);
      }
      const events = new Map<string, { total: number; visitors: Set<string | null> }>();
      for (const e of db.events) {
        const agg = events.get(e.name) ?? { total: 0, visitors: new Set() };
        agg.total++;
        if (e.visitorId) agg.visitors.add(e.visitorId);
        events.set(e.name, agg);
      }
      return {
        waitlistSignups: db.waitlist.length,
        reservations: [...arms.values()],
        events: [...events.entries()].map(([name, a]) => ({ name, total: a.total, uniqueVisitors: a.visitors.size })),
      };
    }, false);
  },
};
