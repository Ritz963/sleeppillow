"use client";

import type { ClientEventName } from "./storage/types";

const VISITOR_KEY = "sp.visitor";

/** Random, anonymous id so visits and conversions can be joined without personal data. */
export function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Sends an experiment event at most once per browser tab session. */
export function trackOncePerSession(name: ClientEventName) {
  try {
    const flag = `sp.tracked.${name}`;
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, "1");
  } catch {
    /* storage blocked: still send once for this page load */
  }
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, visitorId: getVisitorId(), path: location.pathname }),
    keepalive: true,
  }).catch(() => undefined);
}
