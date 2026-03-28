export const DEFAULT_CURRENCY = "USD";

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = "en-US",
) {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
  });
}
