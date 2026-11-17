"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { normalizeEmail, normalizeName, validateEmail, validateName, type FieldErrors } from "@/lib/validation";
import { DevStorageNote, Honeypot, StatusBanner, SubmitButton, TextField } from "./Fields";
import { useSubmission } from "./useSubmission";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [website, setWebsite] = useState("");
  const [attempted, setAttempted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { state, setState, submit, serverFieldErrors } = useSubmission("/api/waitlist");

  const clientErrors: FieldErrors = attempted
    ? { email: validateEmail(normalizeEmail(email)), firstName: validateName(normalizeName(firstName)) }
    : {};
  const errors = { ...serverFieldErrors, ...Object.fromEntries(Object.entries(clientErrors).filter(([, v]) => v)) } as FieldErrors;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.status === "submitting") return;
    setAttempted(true);
    const emailErr = validateEmail(normalizeEmail(email));
    const nameErr = validateName(normalizeName(firstName));
    if (emailErr) return emailRef.current?.focus();
    if (nameErr) return nameRef.current?.focus();
    await submit({ email, firstName, website });
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  if (state.status === "success") {
    const name = normalizeName(firstName);
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="text-center outline-none">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-mint-200 text-mint-700">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">You&apos;re on the waitlist{name ? `, ${name}` : ""}.</h3>
        <p className="mt-2 text-ink-soft">We&apos;ll email you when there&apos;s pilot news. No spam, and you can opt out anytime.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/app" className="rounded-full border border-lav-300 bg-white px-5 py-3 font-semibold text-ink hover:border-iris hover:text-iris">
            Try the app prototype
          </Link>
          <Link href="/reserve" className="inline-flex items-center justify-center gap-2 rounded-full bg-iris px-5 py-3 font-semibold text-white hover:bg-iris-600">
            See the proposed price <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {state.devStorageNote && <DevStorageNote />}
      </div>
    );
  }

  if (state.status === "duplicate") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="text-center outline-none">
        <h3 className="font-display text-2xl font-bold text-ink">You&apos;re already on the list.</h3>
        <p className="mt-2 text-ink-soft">
          <span className="font-semibold text-ink">{normalizeEmail(email)}</span> has already joined the waitlist, so there&apos;s nothing else to do.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setState({ status: "idle" });
              setEmail("");
              requestAnimationFrame(() => emailRef.current?.focus());
            }}
            className="rounded-full border border-lav-300 bg-white px-5 py-3 font-semibold text-ink hover:border-iris hover:text-iris"
          >
            Use a different email
          </button>
          <Link href="/reserve" className="rounded-full bg-iris px-5 py-3 font-semibold text-white hover:bg-iris-600">
            Reserve a spot instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative space-y-4" aria-describedby="waitlist-privacy">
      {state.status === "error" && (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          <StatusBanner tone="error" title="We couldn't add you yet">
            {state.message} Your details are still filled in.
          </StatusBanner>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <TextField
          ref={nameRef}
          id="wl-first-name"
          label="First name"
          optional
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          maxLength={80}
        />
        <TextField
          ref={emailRef}
          id="wl-email"
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
      </div>
      <Honeypot value={website} onChange={setWebsite} />
      <SubmitButton submitting={state.status === "submitting"} submittingLabel="Joining…">
        Join the waitlist
      </SubmitButton>
      <p id="waitlist-privacy" className="text-center text-xs text-ink-soft">
        We only use your email for SleepPillow pilot updates.
      </p>
    </form>
  );
}
