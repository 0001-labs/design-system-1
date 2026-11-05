/**
 * The documentation as a site in Consistency's app: the same place in the app as a site's canvas, drawn from the
 * page's Markdown rather than a frame, since the documentation is this Worker's own build (`services/src/doc-pages.ts`).
 * A page opens in Aa as its words, with each block only the build can draw (a live example, a component) as one atom
 * shown as it stands on the site. Aa moves or removes an atom whole and cannot damage it. The words are saved as they
 * are written, serially, and go live on the site at once.
 *
 * The title and the description are edited here and in Pages through the same route. Internal links open with
 * Command or Control held, as a link does in Aa. Pages lists every page and opens one here (`consistency-open-page`).
 */
import { LitElement, html, nothing } from 'lit';
import { atomPattern, createEditor, createPlainEditor, type Editor } from '../../../website/src/vendor/aa/aa';
import '../../../website/src/vendor/aa/aa.css';
import '../../../DS1/2-core/ds-message';
import '../../../DS1/2-core/ds-button';
import { siteApi } from './places/api';
import type { SiteSummary } from './site-editing';
import type { DocHeading } from '../../../shared/doc-pages';
import './docs-site.css';

interface DocsAtom { id: number; label: string; html: string }
export interface DocsPage { path: string; base: string; revision: number; title: string; description: string; text: string; atoms: DocsAtom[]; headings?: DocHeading[]; file: string; edited: boolean; superseded: boolean }
interface DocsListing { path: string; lang: string; title: string; fields: number; edited: number }
type Plain = ReturnType<typeof createPlainEditor>;

/** How long after the last letter the words are saved. */
const SAVE_AFTER = 600;

export class ConsistencyDocsEditor extends LitElement {
  static properties = { path: { state: true }, problem: { state: true }, page: { state: true } };
  site!: SiteSummary;
  /** The app shows no bar over a site; the same field as a site's editor, for the place that makes either. */
  picker = false;
  /** Reuse the editor in the public documentation's existing reading column. */
  embedded = false;
  pages: DocsListing[] | null = null;
  path: string | null = null;
  problem = '';
  page: DocsPage | null = null;
  private editor: Editor | null = null;
  private plains: Plain[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private text = '';
  private dirty = false;
  private saving: Promise<boolean> | null = null;
  private ticket = 0;

  createRenderRoot() { return this; }
  connectedCallback() {
    super.connectedCallback();
    if (!this.pages) void this.read();
  }
  disconnectedCallback() { super.disconnectedCallback(); this.ticket++; this.teardown(); }

  private async read() {
    try {
      const { pages } = await siteApi<{ pages: DocsListing[] }>(this.site.code, 'pages');
      this.pages = pages;
      if (!this.path) await this.open('/');
    } catch (error) { this.problem = (error as Error).message; }
  }

  /** Opens a page, read fresh, once the page before it is saved; whether it opened. */
  async open(path: string): Promise<boolean> {
    if (!await this.flush()) return false;
    const ticket = ++this.ticket;
    try {
      const page = await siteApi<DocsPage>(this.site.code, `docs-page?path=${encodeURIComponent(path)}`);
      if (ticket !== this.ticket) return false;
      this.teardown();
      this.page = page; this.path = page.path; this.text = page.text; this.dirty = false; this.problem = '';
      await this.updateComplete;
      if (ticket === this.ticket) this.mount(page);
      return true;
    } catch (error) {
      if (ticket === this.ticket) this.problem = (error as Error).message;
      return false;
    }
  }

  private teardown() {
    clearTimeout(this.timer);
    this.editor?.destroy(); this.editor = null;
    for (const plain of this.plains) plain.destroy();
    this.plains = [];
  }

  private mount(page: DocsPage) {
    const atoms = new Map(page.atoms.map(atom => [atom.id, atom]));
    const doc = {
      ...atomPattern('doc', /:doc\[\d+\]/),
      draw(element: HTMLElement, source: string) {
        const atom = atoms.get(Number(/\d+/.exec(source)?.[0]));
        element.classList.add('docs-atom');
        const label = element.ownerDocument.createElement('span');
        label.className = 'docs-atom__label'; label.textContent = atom?.label ?? 'Block';
        const body = element.ownerDocument.createElement('div');
        body.className = 'docs-atom__body'; body.innerHTML = atom?.html ?? '';
        element.replaceChildren(label, body);
      },
    };
    const writing = this.querySelector<HTMLElement>('.docs-canvas__writing')!;
    writing.replaceChildren();
    this.editor = createEditor(writing, { value: page.text, atoms: [doc], toolbar: true, menus: true, onChange: value => this.typed(value) });
    this.outline(page.headings);
    if (!this.embedded) {
      this.field('.docs-canvas__title', 'title', page.title);
      this.field('.docs-canvas__description', 'description', page.description);
    }
  }

  /** The title or the description, edited in place and saved on leaving it, as Pages saves it. */
  private field(selector: string, key: 'title' | 'description', value: string) {
    const host = this.querySelector<HTMLElement>(selector)!;
    host.replaceChildren();
    let accepted = value;
    const plain = createPlainEditor(host, { value, placeholder: key === 'title' ? 'Title' : 'Description' });
    this.plains.push(plain);
    host.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); (event.target as HTMLElement).blur(); } });
    host.addEventListener('focusout', () => {
      const markdown = plain.value.trim();
      if (markdown === accepted || !this.page) return;
      const path = this.page.path;
      void siteApi<{ revision: number }>(this.site.code, 'edit', { method: 'POST', json: { path, key, markdown } }).then(saved => {
        accepted = markdown;
        if (this.page?.path === path) { this.page[key] = markdown; this.page.revision = saved.revision; }
        this.problem = '';
      }, (error: Error) => { plain.value = accepted; this.problem = `It was not saved. ${error.message}`; });
    });
  }

  private typed(value: string) {
    this.text = value; this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.save(), SAVE_AFTER);
  }

  private outline(headings: DocHeading[] = []) {
    if (!this.embedded) return;
    const blocks = [...this.querySelectorAll<HTMLElement>('.aa-block[data-kind="heading"][data-level="2"], .aa-block[data-kind="heading"][data-level="3"]')];
    blocks.forEach((block, index) => { block.id = headings[index]?.id ?? ''; });
    this.dispatchEvent(new CustomEvent('documentation-headings', { detail: headings }));
  }

  /** Saves the words as they stand, one save at a time; whether everything written is saved. */
  private save(): Promise<boolean> {
    if (this.saving) return this.saving.then(ok => (ok ? this.save() : false));
    if (!this.dirty || !this.page) return Promise.resolve(true);
    const page = this.page, text = this.text;
    this.dirty = false;
    this.saving = siteApi<{ revision: number; headings?: DocHeading[] }>(this.site.code, `docs-page?path=${encodeURIComponent(page.path)}`, { method: 'PUT', json: { base: page.base, revision: page.revision, text } })
      .then(saved => { page.revision = saved.revision; if (!this.dirty) this.outline(saved.headings); this.problem = ''; return true; }, (error: Error) => {
        // The words stay on the canvas, marked unsaved, so nothing written is lost.
        this.dirty = true; this.problem = error.message; return false;
      })
      .finally(() => { this.saving = null; });
    return this.saving;
  }

  /** Saves what is waiting before leaving the page. `false` keeps the owner here with the words still unsaved. */
  async flush(): Promise<boolean> {
    clearTimeout(this.timer);
    if (!await this.save()) return false;
    return this.dirty ? this.flush() : true;
  }

  get unsaved() { return this.dirty || this.saving !== null; }

  private readonly press = (event: MouseEvent) => {
    const link = (event.target as Element).closest?.('a[href]');
    if (this.embedded || !link || !(event.metaKey || event.ctrlKey)) return;
    const href = new URL(link.getAttribute('href') ?? '', this.site.url);
    if (href.origin !== new URL(this.site.url).origin || !this.pages?.some(page => page.path === href.pathname)) return;
    event.preventDefault(); event.stopPropagation();
    void this.open(href.pathname);
  };

  render() {
    return html`<div class=${this.embedded ? 'docs-canvas docs-canvas--embedded' : 'docs-canvas'} @click=${this.press}>
      ${this.problem ? html`<ds-message class="docs-canvas__problem" variant="error" role="alert">${this.problem}<ds-button @click=${() => void this.flush()}>Try again</ds-button></ds-message>` : nothing}
      ${this.page?.superseded ? html`<ds-message class="docs-canvas__problem" role="status">This page changed in its source since it was last saved here, so its source is shown. The saved words are kept until they are pulled.</ds-message>` : nothing}
      <div class="docs-canvas__page">
        ${this.embedded ? nothing : html`<div class="docs-canvas__title ds-text ds-text--display"></div>
        <div class="docs-canvas__description"></div>`}
        <div class="docs-canvas__writing"></div>
      </div>
    </div>`;
  }
}
customElements.define('consistency-docs-editor', ConsistencyDocsEditor);
declare global { interface HTMLElementTagNameMap { 'consistency-docs-editor': ConsistencyDocsEditor } }
