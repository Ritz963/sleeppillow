import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { getStorage, serverError, storageUnavailable } from "@/lib/storage";

/**
 * Aggregate experiment counts (no emails). Disabled unless ADMIN_TOKEN is set.
 *   curl -H "Authorization: Bearer $ADMIN_TOKEN" https://your-site/api/stats
 */
export async function GET(request: Request) {
  await connection(); // always evaluate per request (env + auth), never prerender
  const token = process.env.ADMIN_TOKEN;
  if (!token) return new Response("Not found", { status: 404 });

  const given = Buffer.from(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const expected = Buffer.from(token);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const storage = getStorage();
  if (!storage) return storageUnavailable();
  try {
    return Response.json({ storage: storage.kind, ...(await storage.getStats()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError("stats", err);
  }
}
