import { RESERVATION_PRICE } from "@/config/pricing";
import { badRequest, parseContact, readJson } from "@/lib/api";
import { getStorage, serverError, storageUnavailable } from "@/lib/storage";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest({}, "Invalid request.");

  const { email, firstName, visitorId, errors, isBot } = parseContact(body);
  if (isBot) return badRequest({}, "Invalid request.");
  if (body.acknowledged !== true) errors.acknowledged = "Please confirm you understand the price and terms.";
  if (Object.keys(errors).length) return badRequest(errors);

  // The client sends the price it displayed. If the configured price changed since
  // the page loaded, refuse rather than record a price the person never saw.
  if (body.priceCents !== RESERVATION_PRICE.amountCents || body.priceVersion !== RESERVATION_PRICE.version) {
    return Response.json(
      { ok: false, code: "price_changed", message: "The proposed price has been updated. Please reload the page to see it." },
      { status: 409 },
    );
  }

  const storage = getStorage();
  if (!storage) return storageUnavailable();

  try {
    const result = await storage.addReservation({
      email,
      firstName,
      visitorId,
      priceCents: RESERVATION_PRICE.amountCents,
      currency: RESERVATION_PRICE.currency,
      priceVersion: RESERVATION_PRICE.version,
    });
    if (result === "duplicate") {
      return Response.json({ ok: false, code: "duplicate", message: "This email already has a reservation." }, { status: 409 });
    }
    await storage
      .logEvent({ name: "reservation_created", visitorId, path: "/reserve" })
      .catch((e) => console.error("[sleeppillow] event log failed", e));
    return Response.json(
      { ok: true, storage: storage.kind, priceCents: RESERVATION_PRICE.amountCents, currency: RESERVATION_PRICE.currency },
      { status: 201 },
    );
  } catch (err) {
    return serverError("reservation", err);
  }
}
