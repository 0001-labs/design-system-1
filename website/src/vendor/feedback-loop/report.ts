/**
 * Report: a person testing a product says what is wrong with what is in front
 * of them, and it lands in System → Issues as its own issue. Unlike the rest of
 * the Feedback loop, a Report is words a person chose to send the owner, so its
 * note, the words of what it points at and who sent it are kept.
 *
 * The owner annotates a product the same way, right-clicking anything in it:
 * a report carries a tone, `fix` (the default: something to change) or `like`
 * (something to keep as it is), and the element it is about, so an agent handed
 * a batch of them (brief.ts `batchBrief`) finds each one in the source.
 *
 * The browser never posts to System: the product's own server checks who is
 * signed in, names them, and sends the report on with its token
 * (`POST https://system.0001.dev/api/feedback/report/<product>`,
 * `Authorization: Bearer <token>`). This file is the one validator the
 * product's server and System's Worker share, and how a report is filed.
 */

export const REPORT_LIMITS = { note: 4000, about: 300, by: 120, path: 500, version: 40, bytes: 16_000, tag: 64, name: 120, classes: 240, selector: 400, html: 1500, theme: 24 } as const;
export const REPORT_ID = /^[A-Za-z0-9_-]{8,40}$/;
export const REPORT_TONES = ['fix', 'like'] as const;
/** `fix`: something wrong, to change; `like`: something good, to keep as it is. */
export type ReportTone = (typeof REPORT_TONES)[number];

/** The element a report points at, as the browser saw it, so an agent finds it in the source. */
export interface ReportElement {
  /** Its tag: `button`, `ds-button`. */
  tag: string;
  /** The component it is part of: the nearest custom element's tag (`ds-sheet`), else its first `ds-` or `c9y-` class. */
  component: string | null;
  id: string | null;
  /** Its first few classes, space-separated. */
  classes: string | null;
  /** A short path to it from the nearest element with an id, or the body: `main > ds-card:nth-of-type(2) > button`. */
  selector: string;
  /** Where it stood in the window, in CSS pixels. */
  rect: { x: number; y: number; width: number; height: number } | null;
  /** Its outer HTML, cut to the limit. */
  html: string | null;
}

/** What the browser sends its product's server: the note and where it was made. */
export interface ReportDraft {
  /** The report's own id, drawn in the browser, so a retry is one report. */
  id: string;
  /** What is wrong, in the person's words. */
  note: string;
  /** The page's path, or a workspace site's host and path (`flavo.using.link/`), without query or fragment. */
  path: string;
  /** What was pointed at: the words of the element pressed or under the pointer, or its name. */
  about: string | null;
  /** The screen it was seen on. */
  screen: { width: number; height: number; touch: boolean } | null;
  /** The product's build, when it says. */
  version: string | null;
  /** To change (`fix`, the default) or to keep (`like`). */
  tone?: ReportTone;
  /** The element it points at, when the sheet could tell. */
  element?: ReportElement | null;
  /** The theme the page wore: `light`, `dark`. */
  theme?: string | null;
}

/** What the product's server sends System: the draft, with who sent it and when. */
export interface Report extends ReportDraft {
  /** Who sent it, as the product knows them: an editor's address, a person's name. */
  by: string;
  at: number;
}

const words = (value: unknown, name: string, max: number, required = false): string | null => {
  if (value === undefined || value === null || value === '') { if (required) throw new Error(`${name} is required`); return null; }
  if (typeof value !== 'string') throw new Error(`${name} must be text`);
  const trimmed = value.replace(/\r\n?/g, '\n').trim();
  if (required && !trimmed) throw new Error(`${name} is required`);
  if (trimmed.length > max) throw new Error(`${name} is too long`);
  return trimmed || null;
};
const size = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100_000 ? Math.round(value) : 0);
/** A figure of the window, which may stand off screen: rounded, within a screen's reach. */
const place = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 100_000 ? Math.round(value) : 0);
const oneLine = (value: string | null) => value?.replace(/\s+/g, ' ') ?? null;

/** Checks the element a draft points at; null when there is none or it does not check. */
export function parseReportElement(value: unknown): ReportElement | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const given = value as Record<string, unknown>;
  const tag = oneLine(words(given.tag, 'The tag', REPORT_LIMITS.tag));
  const selector = oneLine(words(given.selector, 'The selector', REPORT_LIMITS.selector));
  if (!tag || !selector) return null;
  const rect = given.rect && typeof given.rect === 'object' ? given.rect as Record<string, unknown> : null;
  return {
    tag: tag.toLowerCase(),
    component: oneLine(words(given.component, 'The component', REPORT_LIMITS.tag))?.toLowerCase() ?? null,
    id: oneLine(words(given.id, 'The id', REPORT_LIMITS.name)),
    classes: oneLine(words(given.classes, 'The classes', REPORT_LIMITS.classes)),
    selector,
    rect: rect ? { x: place(rect.x), y: place(rect.y), width: size(rect.width), height: size(rect.height) } : null,
    html: words(given.html, 'The HTML', REPORT_LIMITS.html),
  };
}

/** Checks a draft from the browser: an id, a note, a path, and what it points at. */
export function parseReportDraft(value: unknown): ReportDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('A report must be an object');
  const given = value as Record<string, unknown>;
  if (typeof given.id !== 'string' || !REPORT_ID.test(given.id)) throw new Error('A report needs its id');
  const path = words(given.path, 'The page', REPORT_LIMITS.path, true)!;
  if (/[?#\s]/.test(path)) throw new Error('The page is a path only');
  const screen = given.screen && typeof given.screen === 'object' ? given.screen as Record<string, unknown> : null;
  if (given.tone !== undefined && given.tone !== null && !REPORT_TONES.includes(given.tone as ReportTone)) throw new Error('The tone is fix or like');
  const draft: ReportDraft = {
    id: given.id,
    note: words(given.note, 'The note', REPORT_LIMITS.note, true)!,
    path,
    about: oneLine(words(given.about, 'What it is about', REPORT_LIMITS.about)),
    screen: screen ? { width: size(screen.width), height: size(screen.height), touch: screen.touch === true } : null,
    version: words(given.version, 'The version', REPORT_LIMITS.version),
  };
  if (given.tone) draft.tone = given.tone as ReportTone;
  const element = parseReportElement(given.element);
  if (element) draft.element = element;
  const theme = oneLine(words(given.theme, 'The theme', REPORT_LIMITS.theme));
  if (theme) draft.theme = theme.toLowerCase();
  return draft;
}

/** Checks a report from a product's server: a draft, who sent it and when (never later than now). */
export function parseReport(value: unknown, now = Date.now()): Report {
  const draft = parseReportDraft(value);
  const given = value as Record<string, unknown>;
  const at = typeof given.at === 'number' && Number.isFinite(given.at) && given.at > 0 ? Math.min(given.at, now) : now;
  return { ...draft, by: words(given.by, 'Who sent it', REPORT_LIMITS.by, true)!, at };
}

/** The issue's title: the note's first line, cut at a word within eighty characters. */
export function reportTitle(note: string): string {
  const line = note.split('\n').find(each => each.trim())?.trim() ?? note.trim();
  if (line.length <= 80) return line;
  const cut = line.slice(0, 80);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : 80).trimEnd()}…`;
}

/** An element in one line, as a selector reads: `ds-button#save.ds-button.ds-button--primary`, in its component. */
export function describeReportElement(element: ReportElement): string {
  const name = `${element.tag}${element.id ? `#${element.id}` : ''}${element.classes ? `.${element.classes.split(' ').slice(0, 4).join('.')}` : ''}`;
  return element.component && element.component !== element.tag ? `${name} in ${element.component}` : name;
}

/** What the issue keeps of it: the note, then what it points at, the element and the screen, one a line, and the element's HTML last. */
export function reportMessage(report: Pick<Report, 'note' | 'about' | 'screen' | 'version' | 'tone' | 'element' | 'theme'>): string {
  const lines = [report.note];
  const facts: string[] = [];
  if (report.tone === 'like') facts.push('Liked: keep this as it is');
  if (report.about) facts.push(`About: “${report.about}”`);
  if (report.element) {
    facts.push(`Element: ${describeReportElement(report.element)}`);
    facts.push(`Selector: ${report.element.selector}`);
    if (report.element.rect) facts.push(`Place: ${report.element.rect.x},${report.element.rect.y} · ${report.element.rect.width} × ${report.element.rect.height}`);
  }
  if (report.screen && report.screen.width) facts.push(`Screen: ${report.screen.width} × ${report.screen.height}${report.screen.touch ? ', touch' : ''}${report.theme ? `, ${report.theme}` : ''}`);
  else if (report.theme) facts.push(`Theme: ${report.theme}`);
  if (report.version) facts.push(`Version: ${report.version}`);
  if (facts.length) lines.push('', ...facts);
  if (report.element?.html) lines.push('', 'HTML:', report.element.html);
  return lines.join('\n');
}

/** A report as an issue (issues.ts `IssueReport`): its own issue, keyed by its id, so two reports are never one; a liked one is of kind `like`. */
export function reportIssue(report: Report) {
  return { source: 'report', key: report.id, ref: report.id, title: reportTitle(report.note), message: reportMessage(report), at: report.at, by: report.by, path: report.path, kind: report.tone === 'like' ? 'like' as const : 'report' as const };
}
