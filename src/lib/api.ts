import "server-only";
import { normalizeEmail, normalizeName, validateEmail, validateName, sanitizeVisitorId, type FieldErrors } from "./validation";

const MAX_BODY_BYTES = 4_000;

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

/** Validates the fields shared by waitlist and reservation forms. */
export function parseContact(body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const name = normalizeName(body.firstName);
  const errors: FieldErrors = {};
  const emailError = validateEmail(email);
  const nameError = validateName(name);
  if (emailError) errors.email = emailError;
  if (nameError) errors.firstName = nameError;
  // Honeypot: real people never see or fill the "website" field.
  const isBot = typeof body.website === "string" && body.website.length > 0;
  return { email, firstName: name || null, visitorId: sanitizeVisitorId(body.visitorId), errors, isBot };
}

export function badRequest(errors: FieldErrors = {}, message = "Please check the highlighted fields.") {
  return Response.json({ ok: false, code: "invalid", message, fieldErrors: errors }, { status: 400 });
}
