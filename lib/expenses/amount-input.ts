/**
 * Restricts amount typing to digits and at most one decimal separator (`,` or `.`).
 */
export function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  const sepIndex = cleaned.search(/[.,]/);
  if (sepIndex === -1) return cleaned;
  const left = cleaned.slice(0, sepIndex).replace(/\D/g, "");
  const sep = cleaned[sepIndex];
  const right = cleaned.slice(sepIndex + 1).replace(/\D/g, "");
  return left + sep + right;
}
