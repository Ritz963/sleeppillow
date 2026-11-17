"use client";

import { useState } from "react";
import type { FieldErrors } from "@/lib/validation";
import { getVisitorId } from "@/lib/track";

export type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; devStorageNote: boolean }
  | { status: "duplicate"; message: string }
  | { status: "error"; message: string };

const NETWORK_ERROR = "We couldn't reach the server. Check your connection and try again.";

/**
 * Posts a form to one of our API routes. Success is shown ONLY for a 201 response,
 * i.e. after the server confirms the record was saved.
 */
export function useSubmission(endpoint: string) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});

  async function submit(payload: Record<string, unknown>) {
    setState({ status: "submitting" });
    setServerFieldErrors({});
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, visitorId: getVisitorId() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        message?: string;
        storage?: string;
        fieldErrors?: FieldErrors;
      };
      if (res.status === 201 && data.ok) {
        setState({ status: "success", devStorageNote: data.storage === "local-file" });
      } else if (data.code === "duplicate") {
        setState({ status: "duplicate", message: data.message ?? "You're already signed up." });
      } else {
        if (data.fieldErrors) setServerFieldErrors(data.fieldErrors);
        setState({ status: "error", message: data.message ?? "Something went wrong. Please try again." });
      }
    } catch {
      setState({ status: "error", message: NETWORK_ERROR });
    }
  }

  return { state, setState, submit, serverFieldErrors };
}
