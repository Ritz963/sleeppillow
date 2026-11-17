import "server-only";
import { localFileStorage } from "./local-file";
import { postgresStorage } from "./postgres";
import type { Storage } from "./types";

export type { Storage } from "./types";

/**
 * Picks the storage backend:
 *  - DATABASE_URL set            → PostgreSQL (use this for any real deployment)
 *  - development, or ALLOW_FILE_STORAGE=true → local JSON file in .data/
 *  - otherwise                   → null: the API answers 503 and never reports a fake success
 */
export function getStorage(): Storage | null {
  if (process.env.DATABASE_URL) return postgresStorage;
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_FILE_STORAGE === "true") return localFileStorage;
  return null;
}

let warned = false;
export function storageUnavailable() {
  if (!warned) {
    warned = true;
    console.error("[sleeppillow] No storage configured. Set DATABASE_URL (see README) — submissions are being rejected with 503.");
  }
  return Response.json(
    { ok: false, code: "storage_unavailable", message: "Signups are temporarily unavailable. Please try again later." },
    { status: 503 },
  );
}

export function serverError(context: string, err: unknown) {
  console.error(`[sleeppillow] ${context} failed:`, err);
  return Response.json({ ok: false, code: "server_error", message: "Something went wrong on our side. Please try again." }, { status: 500 });
}
