import { formatMoney } from './bookings-view';

export type OrderKind = 'booking' | 'request' | 'sale';
export type OrderStatus = 'requested' | 'held' | 'confirmed' | 'paid' | 'invoiced' | 'cancelled' | 'fulfilled' | 'expired';
export type OrderPayment = 'stripe' | 'invoice' | 'none';
export type OrderAction = 'confirm' | 'cancel' | 'mark-paid' | 'invoice' | 'fulfil';
export type OrderOpen = 'off' | 'owners' | 'everyone';

export interface OrderLabel { one: string; many: string }

export interface OrderLineView {
  id: number;
  position: number;
  item: { kind: 'offer' | 'product'; ref: string };
  label: string;
  quantity: number;
  unitMinor: number;
  totalMinor: number;
  startsAt: number | null;
  endsAt: number | null;
  nights: number | null;
  seats: number | null;
  meta: Record<string, unknown>;
}

export interface OrderView {
  id: string;
  code: string;
  kind: OrderKind;
  status: OrderStatus;
  lang: string;
  currency: string;
  totalMinor: number;
  paidMinor: number;
  refundedMinor: number;
  payment: OrderPayment;
  invoice: { number: string; to: Record<string, string> | null; dueOn: string | null; at: number | null } | null;
  lines: OrderLineView[];
  createdAt: number;
  updatedAt: number;
  heldUntil: number | null;
  testMode: boolean;
  customer: { name: string; email: string; phone: string; note: string };
  stripe: { session: string | null; paymentIntent: string | null };
  note: string;
  meta: Record<string, unknown>;
}

export interface OrderEvent { id: number; order: string; at: number; by: string | null; what: string; detail: Record<string, unknown> | null }

export interface OrdersAbout {
  label?: Record<string, OrderLabel>;
  kindLabels?: Partial<Record<OrderKind, Record<string, OrderLabel>>>;
  kinds?: OrderKind[];
  currency?: string;
  timeZone?: string;
  payment?: { stripe?: boolean; invoice?: boolean };
  testMode?: boolean;
}
export interface OrdersAnswer extends OrdersAbout { orders?: OrderView[]; next?: string | null }
export interface OrdersConfig extends OrdersAbout { open?: OrderOpen }
export interface OrderDetail { order: OrderView; events?: OrderEvent[]; giftCard?: { code?: string; amount?: number; state?: string } | null; testMode?: boolean }

export const APP_LANGUAGE = 'en';

const KIND_WORDS: Record<OrderKind, OrderLabel> = {
  booking: { one: 'Booking', many: 'Bookings' }, request: { one: 'Request', many: 'Requests' }, sale: { one: 'Sale', many: 'Sales' },
};

export function ordersLabel(about: OrdersAbout | null | undefined, fallback?: string): OrderLabel {
  return about?.label?.[APP_LANGUAGE] ?? (fallback ? { one: fallback, many: fallback } : { one: 'Order', many: 'Orders' });
}

export function kindLabel(about: OrdersAbout | null | undefined, kind: OrderKind): OrderLabel {
  return about?.kindLabels?.[kind]?.[APP_LANGUAGE] ?? KIND_WORDS[kind] ?? { one: kind, many: kind };
}

export const STATUSES: readonly OrderStatus[] = ['requested', 'held', 'confirmed', 'invoiced', 'paid', 'fulfilled', 'cancelled', 'expired'];

export function orderStatusName(status: OrderStatus): { name: string; tone: 'success' | 'warning' | 'danger' | 'muted' | 'accent' } {
  switch (status) {
    case 'requested': return { name: 'Requested', tone: 'accent' };
    case 'held': return { name: 'Awaiting payment', tone: 'warning' };
    case 'confirmed': return { name: 'Confirmed', tone: 'success' };
    case 'invoiced': return { name: 'Invoiced', tone: 'warning' };
    case 'paid': return { name: 'Paid', tone: 'success' };
    case 'fulfilled': return { name: 'Fulfilled', tone: 'muted' };
    case 'cancelled': return { name: 'Cancelled', tone: 'danger' };
    default: return { name: 'Expired', tone: 'muted' };
  }
}

export const OWNER_STEPS: Record<OrderAction, readonly OrderStatus[]> = {
  confirm: ['requested'],
  invoice: ['confirmed'],
  'mark-paid': ['confirmed', 'invoiced'],
  fulfil: ['confirmed', 'invoiced', 'paid'],
  cancel: ['requested', 'held', 'confirmed', 'invoiced', 'paid'],
};

export function allowedSteps(status: OrderStatus): OrderAction[] {
  return (['confirm', 'invoice', 'mark-paid', 'fulfil', 'cancel'] as const).filter(step => OWNER_STEPS[step].includes(status));
}

export function stepName(step: OrderAction, order: Pick<OrderView, 'kind' | 'status'>): string {
  switch (step) {
    case 'confirm': return order.kind === 'request' ? 'Approve' : 'Confirm';
    case 'invoice': return 'Send invoice';
    case 'mark-paid': return 'Mark paid';
    case 'fulfil': return 'Mark fulfilled';
    default: return order.status === 'requested' ? 'Decline' : 'Cancel';
  }
}

export function stepDone(step: OrderAction, order: Pick<OrderView, 'code' | 'kind' | 'status'>): string {
  const words: Record<OrderAction, string> = {
    confirm: order.kind === 'request' ? 'approved' : 'confirmed', invoice: 'invoiced', 'mark-paid': 'marked paid', fulfil: 'fulfilled',
    cancel: order.status === 'requested' ? 'declined' : 'cancelled',
  };
  return `${order.code} is ${words[step]}`;
}

export const stepNotifies = (step: OrderAction) => step === 'confirm' || step === 'cancel';

export interface OrdersFilter { kind: OrderKind | null; status: OrderStatus | null; q: string }

export function ordersQuery(filter: OrdersFilter, after: string | null = null, limit = 50): string {
  const query = new URLSearchParams();
  if (filter.kind) query.set('kind', filter.kind);
  if (filter.status) query.set('status', filter.status);
  const q = filter.q.trim().slice(0, 100);
  if (q) query.set('q', q);
  query.set('limit', String(limit));
  if (after) query.set('after', after);
  return `orders?${query}`;
}

export const orderAt = (order: Pick<OrderView, 'lines' | 'createdAt'>) => order.lines.find(line => line.startsAt !== null)?.startsAt ?? order.createdAt;

export function dayAt(at: number, timeZone: string, withTime = false, now = Date.now()): string {
  const year = (time: number) => new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric' }).format(time);
  return new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short', ...(year(at) === year(now) ? {} : { year: 'numeric' }), ...(withTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } : {}) }).format(at);
}

export function lineSpan(line: Pick<OrderLineView, 'startsAt' | 'nights' | 'meta'>, timeZone: string): string {
  const from = typeof line.meta.from === 'string' ? line.meta.from : null;
  const to = typeof line.meta.to === 'string' ? line.meta.to : null;
  if (from) return to && to !== from ? `${from} to ${to}` : from;
  if (line.startsAt === null) return '';
  const start = dayAt(line.startsAt, timeZone, !line.nights);
  return line.nights ? `${start}, ${line.nights} ${line.nights === 1 ? 'night' : 'nights'}` : start;
}

export function paymentName(order: Pick<OrderView, 'payment' | 'invoice'>): string {
  if (order.payment === 'stripe') return 'Stripe';
  if (order.payment === 'invoice') return order.invoice ? `Invoice ${order.invoice.number}` : 'Invoice';
  return 'No payment';
}

export function orderEventName(event: Pick<OrderEvent, 'what' | 'detail'>, currency: string, locale: string): string {
  const detail = event.detail ?? {};
  const amount = [detail.amount, detail.refund, detail.paid].find(value => typeof value === 'number') as number | undefined;
  const money = amount === undefined ? '' : ` ${formatMoney(amount, currency, locale)}`;
  const to = typeof detail.to === 'string' ? ` to ${detail.to}` : '';
  switch (event.what) {
    case 'created': return 'Placed';
    case 'confirmed': return 'Confirmed';
    case 'invoiced': return `Invoiced${typeof detail.number === 'string' ? ` as ${detail.number}` : ''}`;
    case 'paid': return `Paid${money}`;
    case 'paid-after-cancel': return `Paid${money} after it was cancelled: refund it in Stripe`;
    case 'fulfilled': return 'Fulfilled';
    case 'cancelled': return 'Cancelled';
    case 'refund': return `Refunded${money}`;
    case 'expired': return 'Not paid in time';
    case 'note': return 'Note changed';
    case 'email-customer': return `Emailed the customer${to}`;
    case 'email-team': return `Announced${to}`;
    case 'email-failed': return `An email could not be sent${to}`;
    case 'stripe-failed': return 'Stripe did not open a payment page';
    case 'gift-card-held': return `Gift card held${money}`;
    case 'gift-card-returned': return `Gift card given back${money}`;
    case 'gift-card-refused': case 'gift-card-short': return 'The gift card could not pay';
    case 'imported': return 'Moved over from the bookings';
    default: {
      const words = event.what.replace(/[-_.]+/g, ' ');
      return `${words.charAt(0).toUpperCase()}${words.slice(1)}${money}`;
    }
  }
}

export const WHO_ORDERS: { open: OrderOpen; name: string; about: string }[] = [
  { open: 'off', name: 'Off', about: 'Visitors cannot order on the site; only its owners can.' },
  { open: 'owners', name: 'Owners only', about: 'Everyone can see prices on the site, and only its owners can place an order.' },
  { open: 'everyone', name: 'Everyone', about: 'Every visitor can order on the site.' },
];
