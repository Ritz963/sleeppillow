import { badRequest, parseContact, readJson } from "@/lib/api";
import { getStorage, serverError, storageUnavailable } from "@/lib/storage";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest({}, "Invalid request.");

  const { email, firstName, visitorId, errors, isBot } = parseContact(body);
  if (isBot) return badRequest({}, "Invalid request.");
  if (Object.keys(errors).length) return badRequest(errors);

  const storage = getStorage();
  if (!storage) return storageUnavailable();

  try {
    const result = await storage.addWaitlistSignup({ email, firstName, visitorId });
    if (result === "duplicate") {
      return Response.json({ ok: false, code: "duplicate", message: "This email is already on the waitlist." }, { status: 409 });
    }
    // The signup is saved; a failed analytics write must not turn it into an error.
    await storage.logEvent({ name: "waitlist_signup", visitorId, path: "/" }).catch((e) => console.error("[sleeppillow] event log failed", e));
    return Response.json({ ok: true, storage: storage.kind }, { status: 201 });
  } catch (err) {
    return serverError("waitlist signup", err);
  }
}
