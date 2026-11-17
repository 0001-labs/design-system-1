import { formatCompact, formatMoney, formatNumber, formatPercent } from "../0-face/format";
import { translate } from "../0-face/i18n";

export type FigureFormat = "number" | "compact" | "percent" | "money";
const FORMATS: readonly FigureFormat[] = ["number", "compact", "percent", "money"];

export interface FigureOptions {
  format?: FigureFormat;
  currency?: string;
  minor?: boolean;
  whole?: boolean;
  digits?: number;
  signed?: boolean;
  language?: string;
}

export function figureFormat(value: string | null | undefined): FigureFormat {
  return FORMATS.includes(value as FigureFormat) ? (value as FigureFormat) : "number";
}

export function formatFigure(value: number, options: FigureOptions = {}): string {
  if (!Number.isFinite(value)) return "";
  const { currency, minor, whole, digits, signed, language } = options;
  const format = figureFormat(options.format);
  const numeric: Intl.NumberFormatOptions & { language?: string } = { language };
  if (signed) numeric.signDisplay = "exceptZero";
  if (digits !== undefined && Number.isFinite(digits) && digits >= 0) {
    numeric.minimumFractionDigits = Math.min(20, Math.floor(digits));
    numeric.maximumFractionDigits = Math.min(20, Math.floor(digits));
  }
  if (format === "money" && currency) return formatMoney(value, currency, { ...numeric, minor, whole });
  if (format === "percent") return formatPercent(value, numeric);
  if (format === "compact") return formatCompact(value, numeric);
  return formatNumber(value, numeric);
}

export interface FigureCell { text: string; digit: boolean }

export function figureCells(text: string): FigureCell[] {
  const cells: FigureCell[] = [];
  for (const character of text) {
    const digit = /\p{Nd}/u.test(character);
    const last = cells[cells.length - 1];
    if (!digit && last && !last.digit) last.text += character;
    else cells.push({ text: character, digit });
  }
  return cells;
}

export interface MeterAria {
  now: number;
  min: number;
  max: number;
  text: string;
  fraction: number;
  over: boolean;
}

export function meterAria(value: number, min = 0, max = 1, options: FigureOptions & { over?: boolean } = {}): MeterAria {
  const low = Number.isFinite(min) ? min : 0;
  const high = Number.isFinite(max) && max > low ? max : low + 1;
  const raw = Number.isFinite(value) ? value : low;
  const over = Boolean(options.over) || raw > high;
  const now = Math.min(high, Math.max(low, raw));
  const fraction = over ? 1 : (now - low) / (high - low);
  const write = (n: number) => formatFigure(n, { ...options, signed: false });
  const params = { value: write(raw), max: write(high), over: write(Math.max(0, raw - high)) };
  const text = over && raw > high
    ? translate("{value} of {max}, over by {over}", params)
    : translate("{value} of {max}", params);
  return { now, min: low, max: high, text, fraction, over };
}
