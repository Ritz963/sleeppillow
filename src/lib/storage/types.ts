export type InsertResult = "created" | "duplicate";

export const CLIENT_EVENTS = ["landing_visit", "app_demo_start", "reserve_visit"] as const;
export const SERVER_EVENTS = ["waitlist_signup", "reservation_created"] as const;
export type ClientEventName = (typeof CLIENT_EVENTS)[number];
export type EventName = ClientEventName | (typeof SERVER_EVENTS)[number];

export interface WaitlistInput {
  email: string;
  firstName: string | null;
  visitorId: string | null;
}

export interface ReservationInput {
  email: string;
  firstName: string | null;
  priceCents: number;
  currency: string;
  priceVersion: string;
  visitorId: string | null;
}

export interface EventInput {
  name: EventName;
  visitorId: string | null;
  path: string | null;
}

export interface Stats {
  waitlistSignups: number;
  reservations: { priceVersion: string; priceCents: number; currency: string; count: number }[];
  events: { name: string; total: number; uniqueVisitors: number }[];
}

export interface Storage {
  kind: "postgres" | "local-file";
  addWaitlistSignup(input: WaitlistInput): Promise<InsertResult>;
  addReservation(input: ReservationInput): Promise<InsertResult>;
  logEvent(input: EventInput): Promise<void>;
  getStats(): Promise<Stats>;
}
