import { readJson } from "@/lib/api";
import { getStorage } from "@/lib/storage";
import { CLIENT_EVENTS, type ClientEventName } from "@/lib/storage/types";
import { sanitizeVisitorId } from "@/lib/validation";

/**
 * Records page-level experiment events sent by the browser.
 * Only visit/start events are accepted here — completed signups and reservations
 * are logged server-side, after they are actually saved, so a click can never count as one.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  const name = body?.name;
  if (typeof name !== "string" || !CLIENT_EVENTS.includes(name as ClientEventName)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const storage = getStorage();
  if (!storage) return Response.json({ ok: false, code: "storage_unavailable" }, { status: 503 });
  const path = typeof body?.path === "string" ? body.path.slice(0, 100) : null;
  try {
    await storage.logEvent({ name: name as ClientEventName, visitorId: sanitizeVisitorId(body?.visitorId), path });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[sleeppillow] event log failed", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
