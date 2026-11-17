"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { RESERVATION_PRICE, formatPrice } from "@/config/pricing";
import { normalizeEmail, normalizeName, validateEmail, validateName, type FieldErrors } from "@/lib/validation";
import { DevStorageNote, FieldError, Honeypot, StatusBanner, SubmitButton, TextField } from "./Fields";
import { useSubmission } from "./useSubmission";

const ACK_ERROR = "Please confirm you understand the proposed price and that this reservation is nonbinding.";

export function ReserveForm() {
  const price = formatPrice();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [website, setWebsite] = useState("");
  const [attempted, setAttempted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const ackRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { state, setState, submit, serverFieldErrors } = useSubmission("/api/reserve");

  const clientErrors: FieldErrors = attempted
    ? {
        email: validateEmail(normalizeEmail(email)),
        firstName: validateName(normalizeName(firstName)),
        acknowledged: acknowledged ? undefined : ACK_ERROR,
      }
    : {};
  const errors = { ...serverFieldErrors, ...Object.fromEntries(Object.entries(clientErrors).filter(([, v]) => v)) } as FieldErrors;
  if (attempted && acknowledged) delete errors.acknowledged;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.status === "submitting") return;
    setAttempted(true);
    if (validateEmail(normalizeEmail(email))) return emailRef.current?.focus();
    if (validateName(normalizeName(firstName))) return nameRef.current?.focus();
    if (!acknowledged) return ackRef.current?.focus();
    await submit({
      email,
      firstName,
      website,
      acknowledged: true,
      priceCents: RESERVATION_PRICE.amountCents,
      priceVersion: RESERVATION_PRICE.version,
    });
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  if (state.status === "success") {
    const name = normalizeName(firstName);
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="text-center outline-none">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-mint-200 text-mint-700">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Your spot is reserved{name ? `, ${name}` : ""}.</h2>
        <p className="mt-2 text-ink-soft">
          We saved your nonbinding reservation at the proposed price of{" "}
          <strong className="text-ink">
            {price} {RESERVATION_PRICE.currency}
          </strong>
          .
        </p>
        <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-ink">
          {["No payment was taken.", "You're not committed to buying.", "We'll email you before anything becomes final."].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-mint-700" aria-hidden /> {t}
            </li>
          ))}
        </ul>
        <Link href="/app" className="mt-6 inline-block rounded-full border border-lav-300 bg-white px-5 py-3 font-semibold text-ink hover:border-iris hover:text-iris">
          Explore the app prototype
        </Link>
        {state.devStorageNote && <DevStorageNote />}
      </div>
    );
  }

  if (state.status === "duplicate") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="text-center outline-none">
        <h2 className="font-display text-2xl font-bold text-ink">You&apos;ve already reserved a spot.</h2>
        <p className="mt-2 text-ink-soft">
          There&apos;s already a reservation for <span className="font-semibold text-ink">{normalizeEmail(email)}</span>, so you&apos;re all set.
        </p>
        <button
          type="button"
          onClick={() => {
            setState({ status: "idle" });
            setEmail("");
            requestAnimationFrame(() => emailRef.current?.focus());
          }}
          className="mt-6 rounded-full border border-lav-300 bg-white px-5 py-3 font-semibold text-ink hover:border-iris hover:text-iris"
        >
          Reserve with a different email
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative space-y-4">
      {state.status === "error" && (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          <StatusBanner tone="error" title="Your reservation wasn't saved">
            {state.message}
          </StatusBanner>
        </div>
      )}
      <TextField
        ref={emailRef}
        id="rs-email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        ref={nameRef}
        id="rs-first-name"
        label="First name"
        optional
        autoComplete="given-name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={errors.firstName}
        maxLength={80}
      />
      <div>
        <label
          htmlFor="rs-ack"
          className={`flex cursor-pointer gap-3 rounded-2xl border bg-white/80 p-4 text-sm text-ink transition-colors ${
            errors.acknowledged ? "border-[#c02646]" : "border-lav-300 hover:border-lav-400"
          }`}
        >
          <input
            ref={ackRef}
            id="rs-ack"
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            aria-invalid={errors.acknowledged ? true : undefined}
            aria-describedby={errors.acknowledged ? "rs-ack-error" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-iris"
          />
          <span>
            I understand the proposed price is{" "}
            <strong>
              {price} {RESERVATION_PRICE.currency}
            </strong>
            , that this reservation is <strong>nonbinding</strong>, and that no payment is collected.
          </span>
        </label>
        {errors.acknowledged && <FieldError id="rs-ack-error">{errors.acknowledged}</FieldError>}
      </div>
      <Honeypot value={website} onChange={setWebsite} />
      <SubmitButton submitting={state.status === "submitting"} submittingLabel="Reserving…">
        Reserve my spot
      </SubmitButton>
      <p className="text-center text-xs text-ink-soft">No card details and no checkout. We only use your email for SleepPillow updates.</p>
    </form>
  );
}
