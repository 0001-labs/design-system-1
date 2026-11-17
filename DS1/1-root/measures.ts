export const measures = {
  square: 20,
  half: 10,
  control: 16,
  row: 20,
  item: { width: 79, height: 19, correction: 1 },
  type: {
    default: 14,
    small: 10,
    heading: 13,
    display: 20,
  },
  leading: 16,
  tracking: -0.3,
  displayTracking: -0.4,
  weight: { default: 400, bold: 500 },
  line: 1,
  radius: 4,
  scale: { base: 280, min: 0.75, max: 2, decimals: 3 },
} as const;

export type Measures = typeof measures;

export function deviceScale(width: number): number {
  const { base, min, max, decimals } = measures.scale;
  return Number(Math.max(min, Math.min(max, width / base)).toFixed(decimals));
}
