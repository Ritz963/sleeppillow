"use client";

import { useEffect } from "react";
import { trackOncePerSession } from "@/lib/track";
import type { ClientEventName } from "@/lib/storage/types";

export function TrackVisit({ event }: { event: ClientEventName }) {
  useEffect(() => trackOncePerSession(event), [event]);
  return null;
}
