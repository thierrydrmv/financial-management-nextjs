/**
 * Category / chart colors for dashboards.
 * Tailwind classes map to `app/globals.css` `--chart-1` … `--chart-12` (same family as shadcn chart tokens + primary-aligned hues).
 */
export const CATEGORY_CHART_BG_CLASSES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
  "bg-chart-9",
  "bg-chart-10",
  "bg-chart-11",
  "bg-chart-12",
] as const;

export type CategoryChartBgClass = (typeof CATEGORY_CHART_BG_CLASSES)[number];

/** CSS variables for inline SVG, conic gradients, etc. */
export const CATEGORY_CHART_CSS_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
] as const;

function hashLabel(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i += 1) {
    h = (h * 31 + label.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function categoryChartBgClassByIndex(index: number): CategoryChartBgClass {
  const n = CATEGORY_CHART_BG_CLASSES.length;
  return CATEGORY_CHART_BG_CLASSES[((index % n) + n) % n];
}

/** Stable color per category name across widgets. */
export function categoryChartBgClassForLabel(label: string): CategoryChartBgClass {
  return categoryChartBgClassByIndex(hashLabel(label));
}

export function categoryChartCssVarForLabel(label: string): string {
  return CATEGORY_CHART_CSS_VARS[
    hashLabel(label) % CATEGORY_CHART_CSS_VARS.length
  ];
}
