export type EmailsView = 'sent' | 'look' | 'flows';

export interface EmailAttachment { filename: string; contentType: string; size: number }

export interface EmailSummary {
  id: string; at: number; kind: string; to: string; from: string; subject: string;
  related: string | null; status: 'sent' | 'failed'; error: string | null; attachments: EmailAttachment[];
}

export interface EmailDetail extends EmailSummary { html: string; text: string }

export interface EmailTemplateSource { subject: string; text: string }
export interface EmailTemplateEditing { build: string; base: string; revision: number; document: EmailTemplateSource; values: Record<string, string> }
export interface EmailTemplate { editing?: EmailTemplateEditing; from?: string; kind: string; to: string; subject: string; text: string; html: string; attachments: EmailAttachment[] }

export const EMAIL_KIND_NAMES: Record<string, string> = {
  'form-inquiry': 'Form enquiry',
  'sign-in-code': 'Sign-in code',
  'booking-confirmation': 'Booking confirmation',
  'booking-team-note': 'Booking note to the team',
  'booking-cancelled': 'Booking cancelled',
  'gift-card': 'Gift card',
  'gift-card-receipt': 'Gift card receipt',
  'email-confirm': 'Signup confirmation',
  'email-flow': 'Flow email',
};

export const kindName = (kind: string) => EMAIL_KIND_NAMES[kind] ?? kind;

export const emailStatusName = (status: string): { name: string; tone: 'success' | 'danger' } => (status === 'failed' ? { name: 'Failed', tone: 'danger' } : { name: 'Sent', tone: 'success' });

export function emailsQuery(filter: { kind?: string | null; q?: string | null; after?: string | null }): string {
  const query = new URLSearchParams();
  if (filter.kind) query.set('kind', filter.kind);
  const words = filter.q?.trim();
  if (words) query.set('q', words);
  if (filter.after) query.set('after', filter.after);
  const written = query.toString();
  return written ? `emails?${written}` : 'emails';
}

export function sentAt(at: number, now = Date.now(), timeZone?: string): string {
  const day = (time: number) => new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(time);
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(at);
  if (day(at) === day(now)) return clock;
  const year = (time: number) => new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric' }).format(time);
  const date = new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short', ...(year(at) === year(now) ? {} : { year: 'numeric' }) }).format(at);
  return `${date}, ${clock}`;
}

export function sizeName(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1_000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function relatedOf(email: Pick<EmailSummary, 'kind' | 'related'>): { name: string; place: 'bookings' | 'giftcards'; id: string; pdf?: string } | null {
  if (!email.related) return null;
  const id = email.related;
  if (email.kind.startsWith('booking-')) return { name: 'A booking', place: 'bookings', id };
  if (email.kind.startsWith('gift-card')) return { name: 'A gift card', place: 'giftcards', id, pdf: `giftcards/${encodeURIComponent(id)}/pdf` };
  return null;
}

export function emailDocument(html: string): string {
  return [
    '<!doctype html>',
    '<html><head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'">`,
    '<base target="_blank">',
    "<style>html{color-scheme:light}body{margin:16px;background:#fff;color:#1d1d1b;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;overflow-wrap:anywhere}</style>",
    `</head><body>${html}</body></html>`,
  ].join('');
}

export function templatePreview(source: EmailTemplateSource, values: Record<string, string>): { subject: string; text: string; html: string } {
  const fill = (words: string) => words.replace(/{{\s*([a-zA-Z][\w]{0,31})\s*}}/g, (match, key: string) => values[key] ?? match);
  const text = fill(source.text), subject = fill(source.subject).replace(/[\r\n]+/g, ' ').slice(0, 200);
  return { subject, text, html: `<pre style="white-space:pre-wrap">${text.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]!)}</pre>` };
}
