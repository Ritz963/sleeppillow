-- SleepPillow storage schema (PostgreSQL).
-- The app also runs these statements automatically on first use, so running
-- this file manually is optional.

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,          -- stored lowercased
  first_name  TEXT,
  visitor_id  TEXT,                          -- anonymous browser id, for funnel joins
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Separate table: the same email may join the waitlist AND reserve.
CREATE TABLE IF NOT EXISTS reservations (
  id                 BIGSERIAL PRIMARY KEY,
  email              TEXT NOT NULL UNIQUE,
  first_name         TEXT,
  price_cents        INTEGER NOT NULL,       -- price displayed when reserving
  currency           TEXT NOT NULL,
  price_version      TEXT NOT NULL,
  terms_acknowledged BOOLEAN NOT NULL,
  visitor_id         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiment events never contain emails or names.
CREATE TABLE IF NOT EXISTS experiment_events (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  visitor_id  TEXT,
  path        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experiment_events_name_idx ON experiment_events (name, created_at);
