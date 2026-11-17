// Shared by client forms (instant feedback) and API routes (authoritative checks).

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const MAX_NAME_LENGTH = 60;
export const MAX_EMAIL_LENGTH = 254;

export type FieldErrors = Partial<Record<"email" | "firstName" | "acknowledged", string>>;

export function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function normalizeName(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
}

export function validateEmail(email: string): string | undefined {
  if (!email) return "Enter your email address.";
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return "Enter a valid email, like name@example.com.";
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (name.length > MAX_NAME_LENGTH) return `Keep your first name under ${MAX_NAME_LENGTH} characters.`;
  if (/[<>]/.test(name)) return "Please remove < and > from your name.";
  return undefined;
}

/** Anonymous visitor id generated in the browser; never contains personal data. */
export function sanitizeVisitorId(raw: unknown): string | null {
  return typeof raw === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(raw) ? raw : null;
}
