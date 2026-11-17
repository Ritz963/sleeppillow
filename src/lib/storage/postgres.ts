import { Pool } from "pg";
import type { EventInput, InsertResult, ReservationInput, Stats, Storage, WaitlistInput } from "./types";

// Mirrors db/schema.sql — keep the two in sync.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  visitor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  price_version TEXT NOT NULL,
  terms_acknowledged BOOLEAN NOT NULL,
  visitor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS experiment_events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  visitor_id TEXT,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experiment_events_name_idx ON experiment_events (name, created_at);
`;

// Reuse one pool across hot reloads / warm serverless invocations.
const globalForPg = globalThis as unknown as { __sleepPillowPool?: Pool; __sleepPillowSchema?: Promise<void> };

function pool(): Pool {
  if (!globalForPg.__sleepPillowPool) {
    globalForPg.__sleepPillowPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 8000,
    });
  }
  return globalForPg.__sleepPillowPool;
}

async function ready(): Promise<Pool> {
  const p = pool();
  if (!globalForPg.__sleepPillowSchema) {
    globalForPg.__sleepPillowSchema = p.query(SCHEMA_SQL).then(() => undefined);
    globalForPg.__sleepPillowSchema.catch(() => {
      globalForPg.__sleepPillowSchema = undefined; // retry on the next request
    });
  }
  await globalForPg.__sleepPillowSchema;
  return p;
}

export const postgresStorage: Storage = {
  kind: "postgres",

  async addWaitlistSignup({ email, firstName, visitorId }: WaitlistInput): Promise<InsertResult> {
    const db = await ready();
    const res = await db.query(
      `INSERT INTO waitlist_signups (email, first_name, visitor_id) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [email, firstName, visitorId],
    );
    return res.rowCount === 1 ? "created" : "duplicate";
  },

  async addReservation(input: ReservationInput): Promise<InsertResult> {
    const db = await ready();
    const res = await db.query(
      `INSERT INTO reservations (email, first_name, price_cents, currency, price_version, terms_acknowledged, visitor_id)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [input.email, input.firstName, input.priceCents, input.currency, input.priceVersion, input.visitorId],
    );
    return res.rowCount === 1 ? "created" : "duplicate";
  },

  async logEvent({ name, visitorId, path }: EventInput) {
    const db = await ready();
    await db.query(`INSERT INTO experiment_events (name, visitor_id, path) VALUES ($1, $2, $3)`, [name, visitorId, path]);
  },

  async getStats(): Promise<Stats> {
    const db = await ready();
    // Sequential on purpose: one pooled connection is enough and plays well with small connection limits.
    const w = await db.query<{ count: string }>(`SELECT count(*) FROM waitlist_signups`);
    const r = await db.query<{ price_version: string; price_cents: number; currency: string; count: string }>(
      `SELECT price_version, price_cents, currency, count(*) FROM reservations GROUP BY 1, 2, 3 ORDER BY 1`,
    );
    const e = await db.query<{ name: string; total: string; unique_visitors: string }>(
      `SELECT name, count(*) AS total, count(DISTINCT visitor_id) AS unique_visitors FROM experiment_events GROUP BY name ORDER BY name`,
    );
    return {
      waitlistSignups: Number(w.rows[0].count),
      reservations: r.rows.map((row) => ({
        priceVersion: row.price_version,
        priceCents: row.price_cents,
        currency: row.currency,
        count: Number(row.count),
      })),
      events: e.rows.map((row) => ({ name: row.name, total: Number(row.total), uniqueVisitors: Number(row.unique_visitors) })),
    };
  },
};
