import { currentLanguage } from "./i18n";
import { DEFAULT_LANGUAGE, LANGUAGES, normalizeLanguage } from "./languages";
import type { Language } from "./languages";

export const LOCALE_TAGS: Readonly<Record<Language, string>> = {
  da: "da-DK",
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fi: "fi-FI",
  fr: "fr-FR",
  is: "is-IS",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nb: "nb-NO",
  nn: "nn-NO",
  no: "no-NO",
  pt: "pt-PT",
  "pt-BR": "pt-BR",
  sv: "sv-SE",
  zh: "zh-CN",
};

export type FormatSettings = {
  locales?: Partial<Record<string, string>>;
  timeZone?: string;
};

let settings: FormatSettings = {};

const resolvedTags = new Map<string, string>();

export function configureFormat(next: FormatSettings): void {
  settings = {
    ...settings,
    ...next,
    locales: { ...settings.locales, ...next.locales },
  };
  resolvedTags.clear();
}

function canonical(tag: string): string | null {
  try {
    return Intl.getCanonicalLocales(tag)[0] ?? null;
  } catch {
    return null;
  }
}

function regional(language: Language): string {
  const own = settings.locales?.[language];
  return (own && canonical(own)) || LOCALE_TAGS[language];
}

export function localeTag(language?: string | null): string {
  const tag = String(language || currentLanguage.value || "")
    .trim()
    .replace(/_/g, "-");
  let resolved = resolvedTags.get(tag);
  if (!resolved) {
    resolved = resolveTag(tag);
    if (resolvedTags.size >= MAX_FORMATTERS) {
      resolvedTags.clear();
    }
    resolvedTags.set(tag, resolved);
  }
  return resolved;
}

function resolveTag(tag: string): string {
  if (!tag) {
    return regional(DEFAULT_LANGUAGE);
  }

  const lower = tag.toLowerCase();
  const member = LANGUAGES.find((code) => code.toLowerCase() === lower);
  if (member) {
    return regional(member);
  }

  const written = canonical(tag);
  if (written && supported(written)) {
    return written;
  }

  const known = normalizeLanguage(tag, null);
  return regional(known ?? DEFAULT_LANGUAGE);
}

function supported(tag: string): boolean {
  try {
    return Intl.NumberFormat.supportedLocalesOf([tag]).length > 0;
  } catch {
    return false;
  }
}

type WithLanguage = {
  language?: string;
};

const MAX_FORMATTERS = 256;
const formatters = new Map<string, unknown>();

function optionsKey(options: object): string {
  const entries = Object.entries(options).filter(
    ([, value]) => value !== undefined
  );
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return JSON.stringify(entries);
}

function kept<T>(
  kind: string,
  locale: string,
  options: object,
  make: () => T
): T {
  const key = `${kind}|${locale}|${optionsKey(options)}`;
  if (formatters.has(key)) {
    return formatters.get(key) as T;
  }
  if (formatters.size >= MAX_FORMATTERS) {
    const oldest = formatters.keys().next();
    if (!oldest.done) {
      formatters.delete(oldest.value);
    }
  }
  const formatter = make();
  formatters.set(key, formatter);
  return formatter;
}

function split<T extends WithLanguage>(
  options: T
): [string, Omit<T, "language">] {
  const { language, ...rest } = options;
  return [localeTag(language), rest];
}

export function dateFormatter(
  options: Intl.DateTimeFormatOptions & WithLanguage = {}
): Intl.DateTimeFormat {
  const [locale, rest] = split(options);
  const resolved: Intl.DateTimeFormatOptions = {
    ...rest,
    timeZone: rest.timeZone ?? settings.timeZone,
  };
  return kept("date", locale, resolved, () => new Intl.DateTimeFormat(locale, resolved));
}

export function numberFormatter(
  options: Intl.NumberFormatOptions & WithLanguage = {}
): Intl.NumberFormat {
  const [locale, rest] = split(options);
  return kept("number", locale, rest, () => new Intl.NumberFormat(locale, rest));
}

export function relativeTimeFormatter(
  options: Intl.RelativeTimeFormatOptions & WithLanguage = {}
): Intl.RelativeTimeFormat {
  const [locale, rest] = split(options);
  return kept(
    "relative",
    locale,
    rest,
    () => new Intl.RelativeTimeFormat(locale, rest)
  );
}

export type ListType = "conjunction" | "disjunction" | "unit";
export type ListStyle = "long" | "short" | "narrow";

export type ListFormatter = {
  format(items: Iterable<string>): string;
};

type ListFormatConstructor = new (
  locale: string,
  options: { type?: ListType; style?: ListStyle }
) => ListFormatter;

export function listFormatter(
  options: { type?: ListType; style?: ListStyle } & WithLanguage = {}
): ListFormatter {
  const [locale, rest] = split(options);
  return kept("list", locale, rest, () => {
    const ListFormat = (Intl as unknown as { ListFormat?: ListFormatConstructor })
      .ListFormat;
    return ListFormat
      ? new ListFormat(locale, rest)
      : { format: (items: Iterable<string>) => [...items].join(", ") };
  });
}

export type DateInput = Date | number | string;

export type DateLength = "short" | "medium" | "long";

export type DateOptions = WithLanguage & {
  length?: DateLength;
  timeZone?: string;
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function readDate(value: DateInput): { time: number; day: boolean } {
  if (typeof value === "string") {
    const day = DATE_ONLY.exec(value.trim());
    if (day) {
      return {
        time: Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])),
        day: true,
      };
    }
    return { time: Date.parse(value), day: false };
  }
  return {
    time: value instanceof Date ? value.getTime() : Number(value),
    day: false,
  };
}

function dateArguments(
  options: DateOptions | DateLength | undefined,
  fallback: DateLength
): DateOptions & { length: DateLength } {
  if (typeof options === "string") {
    return { length: options };
  }
  return { ...options, length: options?.length ?? fallback };
}

function formatMoment(
  value: DateInput,
  parts: Intl.DateTimeFormatOptions,
  { language, timeZone }: DateOptions
): string {
  const { time, day } = readDate(value);
  if (!Number.isFinite(time)) {
    return "";
  }
  const zone = day ? "UTC" : timeZone;
  return dateFormatter({ ...parts, timeZone: zone, language }).format(time);
}

export function formatDate(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "medium");
  return formatMoment(value, { dateStyle: length }, rest);
}

export function formatTime(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "short");
  return formatMoment(value, { timeStyle: length }, rest);
}

export function formatDateTime(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "medium");
  return formatMoment(value, { dateStyle: length, timeStyle: "short" }, rest);
}

const MONTH: Record<DateLength, "numeric" | "short" | "long"> = {
  short: "numeric",
  medium: "short",
  long: "long",
};

export function formatMonthYear(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "long");
  return formatMoment(value, { year: "numeric", month: MONTH[length] }, rest);
}

export function formatMonthDay(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "medium");
  return formatMoment(value, { month: MONTH[length], day: "numeric" }, rest);
}

export function formatMonthDayTime(
  value: DateInput,
  options?: DateOptions | DateLength
): string {
  const { length, ...rest } = dateArguments(options, "medium");
  return formatMoment(
    value,
    { month: MONTH[length], day: "numeric", hour: "numeric", minute: "2-digit" },
    rest
  );
}

export type RelativeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export type RelativeTimeOptions = WithLanguage & {
  now?: DateInput;
  unit?: RelativeUnit;
  numeric?: "auto" | "always";
  style?: "long" | "short" | "narrow";
  timeZone?: string;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH_DAYS = 30.436875;
const YEAR_DAYS = 365.2425;

const UNIT_LENGTH: Record<RelativeUnit, number> = {
  second: SECOND,
  minute: MINUTE,
  hour: HOUR,
  day: DAY,
  week: 7 * DAY,
  month: MONTH_DAYS * DAY,
  quarter: 3 * MONTH_DAYS * DAY,
  year: YEAR_DAYS * DAY,
};

function dayNumber(time: number, timeZone: string | undefined): number {
  if (!timeZone) {
    const date = new Date(time);
    return Math.round(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY
    );
  }
  const parts = kept(
    "calendar",
    "en-US",
    { timeZone },
    () =>
      new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
  ).formatToParts(time);
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value);
  return Math.round(Date.UTC(part("year"), part("month") - 1, part("day")) / DAY);
}

export function relativeTimeUnit(
  value: DateInput,
  now: DateInput = Date.now(),
  timeZone: string | undefined = settings.timeZone
): [number, RelativeUnit] {
  const { time: at, day } = readDate(value);
  const from = readDate(now).time;
  const elapsed = at - from;
  const size = Math.abs(elapsed);
  const sign = elapsed < 0 ? -1 : 1;

  if (day) {
    const days = Math.round(at / DAY) - dayNumber(from, timeZone);
    return days === 0 ? [0, "day"] : inDays(days);
  }
  if (size < 45 * SECOND) {
    return [elapsed < 0 ? -0 : 0, "second"];
  }
  if (size < 45 * MINUTE) {
    return [sign * Math.max(1, Math.round(size / MINUTE)), "minute"];
  }
  const days = dayNumber(at, timeZone) - dayNumber(from, timeZone);
  if (size < 22 * HOUR || days === 0) {
    return [sign * Math.max(1, Math.round(size / HOUR)), "hour"];
  }
  return inDays(days);
}

function inDays(days: number): [number, RelativeUnit] {
  const whole = Math.abs(days);
  const sign = days < 0 ? -1 : 1;
  if (whole < 7) {
    return [days, "day"];
  }
  if (whole < 26) {
    return [sign * Math.round(whole / 7), "week"];
  }
  if (whole < 335) {
    return [sign * Math.max(1, Math.round(whole / MONTH_DAYS)), "month"];
  }
  return [sign * Math.max(1, Math.round(whole / YEAR_DAYS)), "year"];
}

export function formatRelativeTime(
  value: DateInput,
  options: RelativeTimeOptions = {}
): string {
  const { now = Date.now(), unit, numeric = "auto", style = "long", language } =
    options;
  const timeZone = options.timeZone ?? settings.timeZone;
  const at = readDate(value).time;
  const from = readDate(now).time;
  if (!Number.isFinite(at) || !Number.isFinite(from)) {
    return "";
  }
  const [count, chosen] = unit
    ? [Math.round((at - from) / UNIT_LENGTH[unit]), unit]
    : relativeTimeUnit(value, from, timeZone);
  return relativeTimeFormatter({ numeric, style, language }).format(count, chosen);
}

export type NumberOptions = WithLanguage & Intl.NumberFormatOptions;

export function formatNumber(value: number | bigint, options: NumberOptions = {}): string {
  return numberFormatter(options).format(value);
}

export function formatCompact(value: number | bigint, options: NumberOptions = {}): string {
  return numberFormatter({
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export function formatPercent(value: number, options: NumberOptions = {}): string {
  return numberFormatter({ style: "percent", ...options }).format(value);
}

export type CurrencyDisplay = "symbol" | "narrowSymbol" | "code" | "name";

export type MoneyOptions = WithLanguage &
  Omit<Intl.NumberFormatOptions, "style" | "currency" | "currencyDisplay"> & {
    minor?: boolean;
    display?: CurrencyDisplay;
    whole?: boolean;
  };

function currencyCode(currency: string): string {
  return String(currency ?? "").trim().toUpperCase();
}

export function currencyDigits(currency: string): number {
  const code = currencyCode(currency);
  try {
    return kept(
      "digits",
      "en",
      { currency: code },
      () => new Intl.NumberFormat("en", { style: "currency", currency: code })
    ).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function fromMinorUnits(amount: number, currency: string): number {
  return amount / 10 ** currencyDigits(currency);
}

export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** currencyDigits(currency));
}

function moneyFormatter(
  currency: string,
  options: MoneyOptions
): { format: Intl.NumberFormat | null; value: (amount: number) => number; code: string; digits: number } {
  const { minor, display = "symbol", whole, language, ...rest } = options;
  const code = currencyCode(currency);
  const digits = currencyDigits(code);
  const value = (amount: number) => (minor ? amount / 10 ** digits : amount);
  try {
    const format = numberFormatter({
      ...rest,
      ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
      style: "currency",
      currency: code,
      currencyDisplay: display,
      language,
    });
    return { format, value, code, digits };
  } catch {
    return { format: null, value, code, digits };
  }
}

export function formatMoney(
  amount: number,
  currency: string,
  options: MoneyOptions = {}
): string {
  const { format, value, code, digits } = moneyFormatter(currency, options);
  if (format) {
    return format.format(value(amount));
  }
  const places = options.whole ? 0 : digits;
  return `${formatNumber(value(amount), {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
    language: options.language,
  })} ${code}`;
}

export function formatMoneyToParts(
  amount: number,
  currency: string,
  options: MoneyOptions = {}
): Intl.NumberFormatPart[] {
  const { format, value } = moneyFormatter(currency, options);
  if (format) {
    return format.formatToParts(value(amount));
  }
  return [{ type: "literal", value: formatMoney(amount, currency, options) }];
}

export function currencySymbol(
  currency: string,
  options: WithLanguage & { display?: "symbol" | "narrowSymbol" } = {}
): string {
  const parts = formatMoneyToParts(0, currency, options);
  return parts.find((part) => part.type === "currency")?.value ?? currencyCode(currency);
}

export type ListOptions = WithLanguage & {
  type?: ListType;
  style?: ListStyle;
};

export function formatList(items: Iterable<string>, options: ListOptions = {}): string {
  const { type = "conjunction", style = "long", language } = options;
  return listFormatter({ type, style, language }).format(
    Array.from(items, (item) => String(item))
  );
}
