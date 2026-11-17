import { WEEKDAYS, wordsIn, type OfferKind, type OfferOverride, type ResolvedOffer, type Season, type Weekday, type Words } from "../vendor/site-engine/bookings-shared";
import { cleanTimes, fractionDigits, parseAmount } from "./bookings-view";

export function parseTime(typed: string): string | null {
  const match = /^(\d{1,2})(?:[:.](\d{2}))?$/.exec(typed.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseTimes(typed: string): { times: string[] } | { error: string } {
  const tokens = typed.split(/[\s,;]+/).filter(Boolean);
  const times: string[] = [];
  for (const token of tokens) {
    const time = parseTime(token);
    if (!time) return { error: `“${token}” is not a time. Write hours, such as 10, 12:30, 14.` };
    times.push(time);
  }
  return { times: cleanTimes(times) };
}

export function shortTime(time: string): string {
  const [hours = "", minutes = "00"] = time.split(":");
  const hour = String(Number(hours));
  return minutes === "00" ? hour : `${hour}:${minutes}`;
}

export function formatTimes(times: readonly string[] | undefined): string {
  return cleanTimes([...(times ?? [])]).map(shortTime).join(" ");
}

export function timesInput(times: readonly string[] | undefined): string {
  return cleanTimes([...(times ?? [])]).map(shortTime).join(", ");
}

type Groupable = Pick<ResolvedOffer, "id" | "name" | "kind" | "pool">;

export interface OfferGroup<T extends Groupable = ResolvedOffer> {
  id: string;
  name: string;
  kind: OfferKind;
  offers: T[];
}

export const KIND_GROUP_NAMES: Record<OfferKind, string> = { slot: "Private trips", seats: "Shared trips", nights: "Stays" };

export function commonName(names: string[]): string {
  if (!names.length) return "";
  const split = names.map(name => name.trim().split(/\s+/));
  const shared: string[] = [];
  for (let index = 0; index < split[0]!.length; index++) {
    const word = split[0]![index]!;
    if (!split.every(words => words[index]?.toLocaleLowerCase() === word.toLocaleLowerCase())) break;
    shared.push(word);
  }
  while (shared.length && !/\p{L}/u.test(shared[shared.length - 1]!)) shared.pop();
  return shared.join(" ").replace(/[\s\-–—:·,(]+$/u, "");
}

export function shortName(name: string, groupName: string): string {
  if (!groupName || name.length <= groupName.length || name.slice(0, groupName.length).toLocaleLowerCase() !== groupName.toLocaleLowerCase()) return name;
  const rest = name.slice(groupName.length).replace(/^[\s\-–—:·,]+/u, "");
  return rest || name;
}

export function groupOffers<T extends Groupable>(offers: T[], language: string): OfferGroup<T>[] {
  const pools = new Map<string, number>();
  for (const offer of offers) pools.set(`${offer.kind}:${offer.pool}`, (pools.get(`${offer.kind}:${offer.pool}`) ?? 0) + 1);
  const groups = new Map<string, OfferGroup<T>>();
  for (const offer of offers) {
    const pool = `${offer.kind}:${offer.pool}`;
    const id = (pools.get(pool) ?? 0) > 1 ? `pool:${pool}` : `kind:${offer.kind}`;
    const group = groups.get(id) ?? { id, name: "", kind: offer.kind, offers: [] };
    group.offers.push(offer);
    groups.set(id, group);
  }
  const taken = new Set<string>();
  return [...groups.values()].map(group => {
    const names = group.offers.map(offer => wordsIn(offer.name, language) || offer.id);
    let name = group.offers.length === 1 ? names[0]! : commonName(names) || KIND_GROUP_NAMES[group.kind];
    for (let count = 2; taken.has(name); count++) name = `${name.replace(/ \(\d+\)$/, "")} (${count})`;
    taken.add(name);
    return { ...group, name };
  });
}

export interface Limits {
  season: Season | null;
  closed: string[];
  noticeHours: number;
  horizonDays: number;
}

export function limitsOf(offer: Pick<ResolvedOffer, keyof Limits>): Limits {
  return {
    season: offer.season ? { from: offer.season.from, to: offer.season.to } : null,
    closed: [...new Set(offer.closed ?? [])].sort(),
    noticeHours: offer.noticeHours,
    horizonDays: offer.horizonDays,
  };
}

const limitsKey = (limits: Limits) => JSON.stringify(limitsOf(limits));

export const sameLimits = (a: Limits, b: Limits) => limitsKey(a) === limitsKey(b);

export function groupLimits(offers: Pick<ResolvedOffer, keyof Limits>[]): Limits | null {
  const counts = new Map<string, { limits: Limits; count: number }>();
  for (const offer of offers) {
    const limits = limitsOf(offer);
    const key = limitsKey(limits);
    const entry = counts.get(key) ?? { limits, count: 0 };
    entry.count++;
    counts.set(key, entry);
  }
  let best: { limits: Limits; count: number } | null = null;
  for (const entry of counts.values()) if (!best || entry.count > best.count) best = entry;
  return best?.limits ?? null;
}

export function ownLimits(offers: (Pick<ResolvedOffer, keyof Limits> & { id: string })[], limits: Limits): Set<string> {
  return new Set(offers.filter(offer => !sameLimits(limitsOf(offer), limits)).map(offer => offer.id));
}

export function applyLimits<T extends Pick<ResolvedOffer, keyof Limits> & { id: string }>(offers: T[], limits: Limits, own: ReadonlySet<string>): T[] {
  return offers.map(offer => (own.has(offer.id) ? offer : { ...offer, ...limitsOf(limits) }));
}

export type Change = "open" | "prices" | Weekday | "season" | "closed" | "noticeHours" | "horizonDays";

type Comparable = Pick<ResolvedOffer, "open" | "prices" | "weekly" | keyof Limits>;

export function changesOf(saved: Comparable, draft: Comparable): Set<Change> {
  const changes = new Set<Change>();
  if (saved.open !== draft.open) changes.add("open");
  if (JSON.stringify(saved.prices.map(price => price.amount)) !== JSON.stringify(draft.prices.map(price => price.amount))) changes.add("prices");
  for (const day of WEEKDAYS) if (formatTimes(saved.weekly?.[day]) !== formatTimes(draft.weekly?.[day])) changes.add(day);
  const before = limitsOf(saved);
  const after = limitsOf(draft);
  if (JSON.stringify(before.season) !== JSON.stringify(after.season)) changes.add("season");
  if (before.closed.join() !== after.closed.join()) changes.add("closed");
  if (before.noticeHours !== after.noticeHours) changes.add("noticeHours");
  if (before.horizonDays !== after.horizonDays) changes.add("horizonDays");
  return changes;
}

export function overrideOf(offer: ResolvedOffer): OfferOverride {
  const weekly = Object.fromEntries(WEEKDAYS.map(day => [day, cleanTimes([...(offer.weekly?.[day] ?? [])])]));
  return { id: offer.id, open: offer.open, prices: offer.prices, season: offer.season, weekly, closed: limitsOf(offer).closed, noticeHours: offer.noticeHours, horizonDays: offer.horizonDays };
}

export function sameTimesAs<T extends Pick<ResolvedOffer, "weekly">>(offer: T, from: Pick<ResolvedOffer, "weekly">): T {
  return { ...offer, weekly: Object.fromEntries(WEEKDAYS.map(day => [day, [...(from.weekly?.[day] ?? [])]])) };
}

export function priceText(minor: number, currency: string, locale: string): string {
  const digits = fractionDigits(currency);
  const whole = minor % 10 ** digits === 0;
  return new Intl.NumberFormat(locale, { minimumFractionDigits: whole ? 0 : digits, maximumFractionDigits: digits }).format(minor / 10 ** digits);
}

export function pricesText(prices: { amount: number }[], currency: string, locale: string): string {
  return prices.map(price => priceText(price.amount, currency, locale)).join(" / ");
}

export function parsePrices(typed: string, count: number, currency: string): { amounts: number[] } | { error: string } {
  const parts = typed.split("/").map(part => part.trim());
  if (parts.length !== count) return { error: count === 1 ? "Write one amount, such as 450." : `Write ${count} amounts with a / between them, such as 149 / 249.` };
  const amounts: number[] = [];
  for (const part of parts) {
    const minor = parseAmount(part, currency);
    if (minor === null) return { error: `“${part || " "}” is not an amount.` };
    amounts.push(minor);
  }
  return { amounts };
}

export function priceNames(prices: { id: string; name: Words }[], language: string): string {
  return prices.map(price => wordsIn(price.name, language) || price.id).join(" / ");
}

const shortDay = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });

export function closedDayName(date: string): string {
  return shortDay.format(new Date(`${date}T12:00:00Z`)).replace(",", "");
}

export function seasonText(season: Season | null): string {
  if (!season) return "All year";
  const day = (date: string) => shortDate.format(new Date(`${date}T12:00:00Z`));
  return `${day(season.from)} – ${day(season.to)}`;
}
