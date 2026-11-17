import type { GiftCardStatus, GiftCardUse, TeamGiftCardView } from "../vendor/site-engine/bookings-shared";
import { formatMoney, parseAmount } from "./bookings-view";

export type GiftCardsView = "active" | "used" | "all";
export type GiftCardsOrder = "created" | "expiry";

export const GIFT_CARDS_VIEWS: readonly GiftCardsView[] = ["active", "used", "all"];

type Card = Pick<TeamGiftCardView, "code" | "status" | "expires" | "createdAt">;

export interface GiftCardEvent {
  id?: number;
  at: number;
  type: string;
  by: string | null;
  detail: Record<string, unknown> | null;
}

export function viewOf(chosen: string | null | undefined): GiftCardsView {
  return GIFT_CARDS_VIEWS.find(view => view === chosen) ?? "active";
}

export function sortCards<T extends Card>(cards: T[], by: GiftCardsOrder): T[] {
  const newest = (a: T, b: T) => b.createdAt - a.createdAt || (a.code ?? "").localeCompare(b.code ?? "");
  if (by === "created") return [...cards].sort(newest);
  return [...cards].sort((a, b) => {
    if (a.expires && b.expires && a.expires !== b.expires) return a.expires.localeCompare(b.expires);
    if (!a.expires !== !b.expires) return a.expires ? -1 : 1;
    return newest(a, b);
  });
}

export function chooseCards<T extends Card>(cards: T[], view: GiftCardsView): T[] {
  if (view === "active") return sortCards(cards.filter(card => card.status === "active"), "expiry");
  if (view === "used") return sortCards(cards.filter(card => card.status === "used"), "created");
  return sortCards(cards, "created");
}

export function giftStatusName(status: GiftCardStatus): { name: string; tone: "success" | "warning" | "danger" | "muted" } {
  if (status === "active") return { name: "Active", tone: "success" };
  if (status === "pending") return { name: "Awaiting payment", tone: "warning" };
  if (status === "used") return { name: "Used", tone: "muted" };
  if (status === "void") return { name: "Void", tone: "danger" };
  return { name: "Expired", tone: "muted" };
}

export function useName(state: GiftCardUse["state"]): string {
  if (state === "drawn") return "Paid";
  if (state === "held") return "Held while the guest pays";
  if (state === "returned") return "Put back, the booking cancelled";
  if (state === "short") return "Not covered when the booking was paid";
  return "Let go, not paid";
}

export function dateName(date: string | null | undefined, short = false): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: short ? "short" : "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));
}

export function momentName(at: number | null | undefined, timeZone?: string): string {
  if (typeof at !== "number" || !Number.isFinite(at) || at <= 0) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(at));
}

const SENDINGS = new Set(["sent", "resent"]);

export function sentTo(card: Pick<TeamGiftCardView, "sendTo" | "recipientEmail" | "buyer">, events: Pick<GiftCardEvent, "type" | "detail">[]): string {
  const to = (event: Pick<GiftCardEvent, "detail">) => (typeof event.detail?.to === "string" ? event.detail.to : "");
  const latest = [...events].reverse().find(event => (SENDINGS.has(event.type) || (card.sendTo === "buyer" && event.type === "receipt")) && to(event));
  if (latest) return to(latest);
  return card.sendTo === "recipient" ? (card.recipientEmail ?? card.buyer.email) : card.buyer.email;
}

export interface IssueBounds {
  min: number;
  max: number;
}

export function checkIssueAmount(typed: string, currency: string, locale: string, bounds: IssueBounds | null): { minor: number } | { error: string } {
  const minor = parseAmount(typed, currency);
  if (minor === null || minor <= 0) return { error: "Write the amount in whole kroner, such as 500." };
  if (minor % 100 !== 0) return { error: "Write the amount in whole kroner, without øre." };
  if (bounds && (minor < bounds.min || minor > bounds.max)) return { error: `From ${formatMoney(bounds.min, currency, locale)} to ${formatMoney(bounds.max, currency, locale)}, the site's bounds.` };
  return { minor };
}

export function messageCount(message: string, limit: number): string {
  return `${[...message].length} of ${limit}`;
}

export function giftEventName(event: Pick<GiftCardEvent, "type" | "detail">, currency: string, locale: string): string {
  const detail = event.detail ?? {};
  const money = typeof detail.amount === "number" ? ` ${formatMoney(detail.amount, currency, locale)}` : "";
  const to = typeof detail.to === "string" ? ` to ${detail.to}` : "";
  switch (event.type) {
    case "created":
      return `Bought${money}, awaiting payment`;
    case "paid":
      return `Paid${money}`;
    case "issued":
      return `Issued${money}, without payment`;
    case "expired":
      return "Not paid in time";
    case "stripe-failed":
      return "Stripe did not open a payment page";
    case "sent":
      return `Sent${to}`;
    case "resent":
      return `Sent again${to}`;
    case "receipt":
      return `Receipt sent${to}`;
    case "email-failed":
      return `An email could not be sent${to}`;
    case "pdf-failed":
      return "The PDF could not be made";
    case "voided":
      return "Voided";
    case "held":
      return `Held${money} for a booking`;
    case "drawn":
      return `Paid${money} of a booking`;
    case "short":
      return `Could not pay${money} of a booking`;
    case "released":
      return `Let go${money}, the booking not paid`;
    case "returned":
      return `Put back${money}, the booking cancelled`;
    default: {
      const words = event.type.replace(/[-_.]+/g, " ");
      return `${words.charAt(0).toUpperCase()}${words.slice(1)}${money}`;
    }
  }
}
