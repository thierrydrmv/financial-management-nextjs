import { formatCurrency } from "@/lib/formatters/currency";

export function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Rounds up to a readable axis maximum (1–2–5–10 style). */
export function niceAxisMax(n: number): number {
  if (n <= 0) return 1000;
  const exp = Math.floor(Math.log10(n));
  const magnitude = 10 ** exp;
  const normalized = n / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Compact Y-axis labels ($0, $1k, …). */
export function formatAxisTick(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1000) {
    const k = value / 1000;
    return Number.isInteger(k) ? `$${k}k` : `$${k.toFixed(1)}k`;
  }
  return formatCurrency(value);
}

export function buildAxisTicks(axisMax: number, stepCount = 8): number[] {
  return Array.from(
    { length: stepCount + 1 },
    (_, i) => (axisMax * i) / stepCount,
  );
}
