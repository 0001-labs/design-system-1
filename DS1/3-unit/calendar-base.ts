import { LitElement, type PropertyValues } from "lit";
import { getText } from "../0-face/i18n";
import {
  addDays,
  addMonths,
  clampDay,
  dayLabel,
  firstWeekday,
  isDay,
  readWeekday,
  today,
  weekdayOf,
  type CalendarEvent,
  type Day,
  type Weekday,
} from "../0-face/calendar";

export type { CalendarEvent, Day } from "../0-face/calendar";

export interface CalendarDayDetail {
  day: Day;
  events: CalendarEvent[];
}

export interface CalendarEventDetail {
  event: CalendarEvent;
  day: Day;
}

export interface CalendarChangeDetail {
  value: string;
  previous: string;
  start: Day;
  end: Day;
}

export function readRange(value: string | null | undefined): { start: Day; end: Day } {
  const [first = "", second = ""] = (value ?? "").split("/").map(part => part.trim().slice(0, 10));
  const start = isDay(first) ? first : "";
  const end = isDay(second) ? second : "";
  if (start && end && end < start) return { start: end, end: start };
  return { start, end };
}

export interface CalendarNavigateDetail {
  month: string;
}

export function readMonth(value: string | null | undefined): Day | null {
  const text = value?.trim() ?? "";
  const day = /^\d{4}-\d{2}$/.test(text) ? `${text}-01` : text;
  return isDay(day) ? `${day.slice(0, 8)}01` : null;
}

export abstract class CalendarBase extends LitElement {
  static properties = {
    value: { type: String, reflect: true },
    min: { type: String },
    max: { type: String },
    today: { type: String },
    weekStart: { type: String, attribute: "week-start" },
    selectable: { type: Boolean, reflect: true },
    label: { type: String },
    literal: { type: Boolean, reflect: true },
    events: { attribute: false },
    dayAllowed: { attribute: false },
    focusDay: { state: true },
    hoverDay: { state: true },
    endPending: { state: true },
  };

  declare value: string;
  declare min: string | undefined;
  declare max: string | undefined;
  declare dayAllowed: ((day: Day) => boolean) | undefined;
  declare today: string | undefined;
  declare weekStart: string | undefined;
  declare selectable: boolean;
  declare label: string | undefined;
  declare literal: boolean;
  declare events: CalendarEvent[];
  declare focusDay: Day | undefined;
  declare hoverDay: Day | undefined;
  protected declare endPending: boolean;

  private pressedValue: string | undefined;

  protected abstract readonly weeksRun: "rows" | "columns";

  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.value = "";
    this.selectable = false;
    this.endPending = false;
    this.literal = false;
    this.events = [];
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has("value") && this.value && !readRange(this.value).start) this.value = "";
    if (changed.has("value") && this.value !== this.pressedValue) this.endPending = false;
  }

  protected words(key: string, params?: Record<string, string | number>): string {
    const text = getText(key, params) || key;
    return params ? text.replace(/\{\{?(\w+)\}?\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole)) : text;
  }

  protected nameOr(fallback: string): string {
    if (!this.label) return fallback;
    return this.literal ? this.label : getText(this.label) || this.label;
  }

  protected get firstDay(): Weekday {
    return readWeekday(this.weekStart) ?? firstWeekday();
  }

  protected get todayDay(): Day {
    return isDay(this.today) ? this.today : today();
  }

  protected get minDay(): Day | undefined {
    return isDay(this.min) ? this.min : undefined;
  }

  protected get maxDay(): Day | undefined {
    return isDay(this.max) ? this.max : undefined;
  }

  protected allowed(day: Day): boolean {
    return clampDay(day, this.minDay, this.maxDay) === day && (this.dayAllowed?.(day) ?? true);
  }

  protected get chosen(): { start: Day; end: Day } {
    const { start, end } = readRange(this.value);
    return { start, end: end || start };
  }

  protected selection(day: Day): { selected: boolean; inside: boolean; first: boolean; last: boolean } {
    let { start, end } = this.chosen;
    if (this.endPending && start && this.hoverDay) end = this.hoverDay;
    if (end && end < start) [start, end] = [end, start];
    const selected = day === start || day === end;
    const spans = Boolean(start && end && start !== end);
    return { selected, inside: spans && day > start && day < end, first: spans && day === start, last: spans && day === end };
  }

  protected cellLabel(day: Day, events: readonly CalendarEvent[]): string {
    return [dayLabel(day), ...events.map(event => (event.time ? `${event.time} ${event.title}` : event.title))].join(", ");
  }

  protected keyTarget(event: KeyboardEvent, from: Day): Day | null {
    const rtl = getComputedStyle(this).direction === "rtl";
    const across = this.weeksRun === "rows" ? 1 : 7;
    const down = this.weeksRun === "rows" ? 7 : 1;
    const start = (weekdayOf(from) - this.firstDay + 7) % 7;
    switch (event.key) {
      case "ArrowRight": return addDays(from, rtl ? -across : across);
      case "ArrowLeft": return addDays(from, rtl ? across : -across);
      case "ArrowDown": return addDays(from, down);
      case "ArrowUp": return addDays(from, -down);
      case "Home": return addDays(from, -start);
      case "End": return addDays(from, 6 - start);
      case "PageUp": return addMonths(from, event.shiftKey ? -12 : -1);
      case "PageDown": return addMonths(from, event.shiftKey ? 12 : 1);
      default: return null;
    }
  }

  protected abstract eventsOn(day: Day): CalendarEvent[];

  protected press(day: Day) {
    const pressed = new CustomEvent<CalendarDayDetail>("day-press", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { day, events: this.eventsOn(day) },
    });
    if (!this.dispatchEvent(pressed) || !this.selectable || !this.allowed(day)) return;
    const previous = this.value || "";
    const { start: first } = readRange(previous);
    const ending = this.endPending && Boolean(first);
    const value: string = !ending || day === first ? day : day < first ? `${day}/${first}` : `${first}/${day}`;
    this.focusDay = day;
    this.endPending = !ending;
    this.hoverDay = undefined;
    this.pressedValue = value;
    if (value === previous && !ending) return;
    this.value = value;
    const { start, end } = readRange(value);
    this.dispatchEvent(new CustomEvent<CalendarChangeDetail>("change", { bubbles: true, composed: true, detail: { value, previous, start, end: ending ? end || start : "" } }));
  }

  protected pressEvent(event: CalendarEvent, day: Day) {
    this.dispatchEvent(new CustomEvent<CalendarEventDetail>("event-press", { bubbles: true, composed: true, detail: { event, day } }));
  }

  protected announceMonth(month: Day) {
    this.dispatchEvent(new CustomEvent<CalendarNavigateDetail>("navigate", { bubbles: true, composed: true, detail: { month: month.slice(0, 7) } }));
  }

  protected async focusCell(day: Day) {
    this.focusDay = day;
    await this.updateComplete;
    const cell = this.renderRoot.querySelector<HTMLElement>(`[data-day="${day}"]`);
    cell?.focus({ preventScroll: true });
    cell?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
}
