/**
 * The pure parts of the email flow designer: no DOM, so they test on their own. The flows, their kinds and the
 * document are the platform's (`Consistency/platform/worker/email-flows.ts`, System's Emails part); these write a
 * flow's timing in words, start a flow from its kind, add an email to one, and find an email's words in a language.
 */
export type DelayUnit = 'minutes' | 'hours' | 'days';
export interface FlowEmail { subject: string; text: string }
export interface FlowStep { event: string; delay: { amount: number; unit: DelayUnit }; emails: Record<string, FlowEmail> }
export interface Flow { kind: string; steps: FlowStep[] }
export interface FlowsDocument { flows: Flow[] }
export interface FlowsSnapshot { build: string; base: string; revision: number; document: FlowsDocument }
export interface FlowKind {
  kind: string; name: string; trigger: string;
  events: { id: string; name: string }[];
  fields: string[];
  steps: { event: string; delay: { amount: number; unit: DelayUnit }; subject: string; text: string }[];
}
/** What `emails/flows` answers: the site's flows, the kinds it may have, its languages and the made up values. */
export interface FlowsAnswer { flows: FlowsSnapshot; kinds: FlowKind[]; languages: { code: string; name: string }[]; values: Record<string, string> }

export const DELAY_UNITS: readonly DelayUnit[] = ['minutes', 'hours', 'days'];
export const MAX_FLOW_STEPS = 10;

const unitName = (amount: number, unit: DelayUnit) => `${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;

/** When an email goes, in words: "At signing up", "2 days after signing up". */
export function whenName(step: Pick<FlowStep, 'event' | 'delay'>, kind: Pick<FlowKind, 'events'> | undefined): string {
  const event = kind?.events.find(each => each.id === step.event)?.name ?? step.event;
  return step.delay.amount === 0 ? `At ${event}` : `${unitName(step.delay.amount, step.delay.unit)} after ${event}`;
}

/** The language a new flow's first words are kept in: English when the site has it, else its first. */
export const firstWordsLanguage = (languages: readonly { code: string }[]) => (languages.some(language => language.code === 'en') ? 'en' : languages[0]?.code ?? 'en');

/** A flow as its kind starts it, its first words in the given language. */
export const flowOf = (kind: FlowKind, lang: string): Flow => ({ kind: kind.kind, steps: kind.steps.map(({ event, delay, subject, text }) => ({ event, delay: { ...delay }, emails: { [lang]: { subject, text } } })) });

/** The flow with one more email, a day after the last, waiting on the same event; at most ten. */
export function withEmail(flow: Flow): Flow {
  if (flow.steps.length >= MAX_FLOW_STEPS) return flow;
  const last = flow.steps.at(-1)!;
  const amount = last.delay.unit === 'days' ? Math.min(365, last.delay.amount + 1) : 1;
  return { ...flow, steps: [...flow.steps, { event: last.event, delay: { amount, unit: 'days' }, emails: {} }] };
}

/** An email's words in a language, or where they come from when it has none there yet: its first written language. */
export function wordsOf(step: FlowStep, lang: string, languages: readonly { code: string }[]): { words: FlowEmail; from: string | null } {
  const own = step.emails[lang];
  if (own && (own.subject || own.text)) return { words: own, from: lang };
  const other = languages.map(language => language.code).find(code => code !== lang && (step.emails[code]?.subject || step.emails[code]?.text));
  return other ? { words: step.emails[other]!, from: other } : { words: { subject: '', text: '' }, from: null };
}

const MINUTES: Record<DelayUnit, number> = { minutes: 1, hours: 60, days: 1440 };

/**
 * The flow's emails in the order they go: by the kind's events in their order, then by how long after. Gives the
 * step's new place too, so the email open in the drawer stays open when a change of timing moves it.
 */
export function inOrder(flow: Flow, kind: Pick<FlowKind, 'events'> | undefined, index: number): { flow: Flow; index: number } {
  const rank = (step: FlowStep) => [kind?.events.findIndex(event => event.id === step.event) ?? 0, step.delay.amount * MINUTES[step.delay.unit]];
  const order = flow.steps.map((step, at) => ({ step, at })).sort((a, b) => { const [ea, da] = rank(a.step), [eb, db] = rank(b.step); return ea! - eb! || da! - db! || a.at - b.at; });
  return { flow: { ...flow, steps: order.map(each => each.step) }, index: order.findIndex(each => each.at === index) };
}

/** The document with one flow replaced (or taken away, given null). */
export const replaceFlow = (document: FlowsDocument, kind: string, flow: Flow | null): FlowsDocument => ({ flows: flow ? document.flows.map(each => (each.kind === kind ? flow : each)) : document.flows.filter(each => each.kind !== kind) });
