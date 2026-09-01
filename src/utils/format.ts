// ============================================================================
// Formatting helpers — currency, compact numbers, distances, percentages.
// ============================================================================

/**
 * Format a rupee amount using the Indian number system (lakhs/crores).
 * Examples: 500000 -> "₹5,00,000", 1200000 -> "₹12,00,000".
 */
export function formatINR(amount: number): string {
  return `₹${formatIndian(amount)}`;
}

/** Apply Indian digit grouping ("5,00,000") to a number. */
function formatIndian(value: number): string {
  const str = Math.round(value).toString();
  // Split into last 3 digits and the remaining leading group(s).
  const last3 = str.slice(-3);
  const head = str.slice(0, -3);
  if (!head) return last3;
  // Group the head in pairs from the right.
  const grouped = head.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${last3}`;
}

/** Format a plain number with Indian grouping but no ₹ sign. */
export function formatNumber(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Format a distance in km with a single decimal. */
export function formatDistance(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Format a percentage, trimming a trailing ".00". */
export function formatPercent(value: number, digits = 1): string {
  const text = value.toFixed(digits);
  return `${text.replace(/\.0+$/, "")}%`;
}
