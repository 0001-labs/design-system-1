import { currentLanguage } from "./i18n";
import { dateFormatter, localeTag } from "./format";

export type Day = string;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function readDay(value: string | null | undefined): { year: number; month: number; date: number } | null {
  const match = DAY.exec(value?.trim() ?? "");
  if (!match) return null;
  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, date));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== date) return null;
  return { year, month, date };
}

export const isDay = (value: unknown): value is Day => typeof value === "string" && readDay(value) !== null;

export function toDay(year: number, month: number, date: number): Day {
  const moment = new Date(Date.UTC(year, month - 1, date));
  const pad = (value: number, size = 2) => String(value).padStart(size, "0");
  return `${pad(moment.getUTCFullYear(), 4)}-${pad(moment.getUTCMonth() + 1)}-${pad(moment.getUTCDate())}`;
}

export const dayOf = (moment: Date): Day => toDay(moment.getFullYear(), moment.getMonth() + 1, moment.getDate());

export const today = (): Day => dayOf(new Date());

const noon = (day: Day) => {
  const parts = readDay(day)!;
  return Date.UTC(parts.year, parts.month - 1, parts.date, 12);
};

export function addDays(day: Day, count: number): Day {
  const parts = readDay(day)!;
  return toDay(parts.year, parts.month, parts.date + count);
}

export function addMonths(day: Day, count: number): Day {
  const parts = readDay(day)!;
  const month = parts.month - 1 + count;
  const year = parts.year + Math.floor(month / 12);
  const inYear = ((month % 12) + 12) % 12;
  const last = new Date(Date.UTC(year, inYear + 1, 0)).getUTCDate();
  return toDay(year, inYear + 1, Math.min(parts.date, last));
}

export const startOfMonth = (day: Day): Day => `${day.slice(0, 8)}01`;

export const sameMonth = (a: Day, b: Day) => a.slice(0, 7) === b.slice(0, 7);

export const weekdayOf = (day: Day): Weekday => new Date(noon(day)).getUTCDay() as Weekday;

export const compareDays = (a: Day, b: Day) => (a < b ? -1 : a > b ? 1 : 0);

export function clampDay(day: Day, min?: Day | null, max?: Day | null): Day {
  if (min && isDay(min) && day < min) return min;
  if (max && isDay(max) && day > max) return max;
  return day;
}

type WeekInfo = { firstDay?: number };

export function firstWeekday(language?: string | null): Weekday {
  try {
    const locale = new Intl.Locale(localeTag(language ?? currentLanguage.value)) as Intl.Locale & {
      weekInfo?: WeekInfo;
      getWeekInfo?: () => WeekInfo;
    };
    const first = locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay;
    if (typeof first === "number" && first >= 1 && first <= 7) return (first % 7) as Weekday;
  } catch {
  }
  return 1;
}

export function readWeekday(value: unknown): Weekday | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6) return value as Weekday;
  if (typeof value !== "string" || !value.trim()) return undefined;
  const number = Number(value);
  if (Number.isInteger(number) && number >= 0 && number <= 6) return number as Weekday;
  const index = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(value.trim().toLowerCase());
  return index >= 0 ? (index as Weekday) : undefined;
}

export function monthWeeks(day: Day, weekStart: Weekday, fixed = false): Day[][] {
  const first = startOfMonth(day);
  const lead = (weekdayOf(first) - weekStart + 7) % 7;
  const start = addDays(first, -lead);
  const last = addDays(addMonths(first, 1), -1);
  const days = Number(last.slice(8)) + lead;
  const count = fixed ? 6 : Math.ceil(days / 7);
  return Array.from({ length: count }, (_, week) => Array.from({ length: 7 }, (_, index) => addDays(start, week * 7 + index)));
}

export function weekdayNames(weekStart: Weekday, width: "narrow" | "short" | "long" = "short", language?: string): string[] {
  const format = dateFormatter({ weekday: width, timeZone: "UTC", language });
  return Array.from({ length: 7 }, (_, index) => format.format(Date.UTC(1970, 0, 4 + ((weekStart + index) % 7), 12)));
}

export const monthTitle = (day: Day, width: "long" | "short" = "long", language?: string) =>
  dateFormatter({ month: width, year: "numeric", timeZone: "UTC", language }).format(noon(day));

export const monthName = (day: Day, width: "long" | "short" = "long", language?: string) =>
  dateFormatter({ month: width, timeZone: "UTC", language }).format(noon(day));

export const dateNumber = (day: Day, language?: string) => {
  const parts = dateFormatter({ day: "numeric", timeZone: "UTC", language }).formatToParts(noon(day));
  return parts.find(part => part.type === "day")?.value ?? parts.map(part => part.value).join("");
};

export const dayLabel = (day: Day, language?: string) =>
  dateFormatter({ weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC", language }).format(noon(day));

export function isoWeek(day: Day): number {
  const thursday = addDays(day, 3 - ((weekdayOf(day) + 6) % 7));
  const january4 = `${thursday.slice(0, 4)}-01-04`;
  const firstThursday = addDays(january4, 3 - ((weekdayOf(january4) + 6) % 7));
  return 1 + Math.round((noon(thursday) - noon(firstThursday)) / (7 * 864e5));
}

export type CalendarEvent = {
  id?: string;
  title: string;
  start: Day;
  end?: Day;
  time?: string;
  color?: string;
  count?: number;
};

export type HeatLevel = 1 | 2 | 3 | 4;

export function heatLevels(byDay: ReadonlyMap<Day, readonly CalendarEvent[]>, max?: number): Map<Day, HeatLevel> {
  const amounts = new Map<Day, number>();
  for (const [day, events] of byDay) {
    const amount = events.reduce((sum, event) => sum + (typeof event.count === "number" && Number.isFinite(event.count) ? Math.max(0, event.count) : 1), 0);
    if (amount > 0) amounts.set(day, amount);
  }
  const top = typeof max === "number" && Number.isFinite(max) && max > 0 ? max : Math.max(0, ...amounts.values());
  const levels = new Map<Day, HeatLevel>();
  for (const [day, amount] of amounts) levels.set(day, Math.min(4, Math.max(1, Math.ceil((amount / top) * 4))) as HeatLevel);
  return levels;
}

export function eventsByDay(events: readonly CalendarEvent[], from: Day, to: Day): Map<Day, CalendarEvent[]> {
  const days = new Map<Day, CalendarEvent[]>();
  const sorted = events
    .filter(event => isDay(event.start))
    .map(event => ({ event, end: event.end && isDay(event.end) && event.end > event.start ? event.end : event.start }))
    .sort((a, b) => compareDays(a.event.start, b.event.start) || compareDays(b.end, a.end) || (a.event.time ?? "").localeCompare(b.event.time ?? ""));
  for (const { event, end } of sorted) {
    if (end < from || event.start > to) continue;
    for (let day = event.start < from ? from : event.start; day <= end && day <= to; day = addDays(day, 1)) {
      const list = days.get(day) ?? [];
      list.push(event);
      days.set(day, list);
    }
  }
  return days;
}
