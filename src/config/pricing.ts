/**
 * Proposed reservation price — the ONE place to change it.
 *
 * ⚠️ DEVELOPMENT PLACEHOLDER: no price has been decided for SleepPillow yet.
 * Replace `amountCents`, bump `version`, and set `isPlaceholder: false` before launch.
 * Every reservation stores the price + version that was displayed, so changing
 * the price later starts a new, separately countable experiment arm.
 */
export const RESERVATION_PRICE = {
  amountCents: 14900,
  currency: "USD",
  version: "dev-placeholder-v1",
  isPlaceholder: true,
} as const;

export function formatPrice(amountCents: number = RESERVATION_PRICE.amountCents, currency: string = RESERVATION_PRICE.currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}
