import { upgradeComponentTree, componentsReady, prepareComponents } from './component-surface';
import { LitElement, html } from 'lit';
import { nativePageStyles, nativePageRootStyles, renderNativePage, type NativePageDocument } from '../../../shared/consistency-native-page';
import { NativeSiteController, type NativePageSnapshot, type NativePageSave } from './native-site';
import baseStyles from '../../../DS1/1-root/one.css?inline';
import './site-editor.css';
import { CANVAS_SANDBOX, protectCanvasHTML } from '../../../shared/consistency-canvas';
import { canvasAssetAddress } from './canvas-assets';
import { PANEL_EVENT, type BehaviourTarget, type ConsistencyBehaviourPanel } from './behaviour-panel';
import './behaviour-panel';

/**
 * A host-independent page document editor. The host supplies a
 * snapshot, its trusted page shell and the persistence transport; blocks and gestures never vary
 * by host. The shell is build-owned, never accepted from a saved document.
 */
export class ConsistencyPageEditor extends LitElement {
  private controller?: NativeSiteController;
  private snapshot?: NativePageSnapshot;
  private save?: NativePageSave;
  private source = '';
  private assetURL = (source:string) => this.source && this.snapshot?.origin
    ? canvasAssetAddress(source,new URL(this.source,location.href).pathname.replace(/\/document$/,'/files'),new URL(this.snapshot.path,this.snapshot.origin).href)
    : source;
  private generation = 0;
  private mounting = -1;
  private poll?: ReturnType<typeof setTimeout>;
  private expectedDocument?: Document;
  private deadline=0;
  private observedDocument = '';
  private ready: Promise<boolean> = Promise.resolve(false);
  private settle?: (ready: boolean) => void;
  private readonly frame = Object.assign(document.createElement('iframe'), { className: 'consistency-site-frame', title: 'Page to edit' });
  /** The behaviour panel beside the page (`behaviour-panel.ts`), shown while a block's behaviour is open. */
  private readonly panel: ConsistencyBehaviourPanel = Object.assign(document.createElement('consistency-behaviour-panel'), { hidden: true });
  private readonly unloading = (event: BeforeUnloadEvent) => { if (this.pending) { event.preventDefault(); event.returnValue = ''; } };
  constructor() {
    super();
    this.frame.setAttribute('sandbox', CANVAS_SANDBOX);
    this.frame.addEventListener('load', () => this.checkReady());
    this.panel.addEventListener('behaviour-close', () => { this.closeBehaviour(); this.frame.focus(); });
  }
  /** Opens a block's behaviour beside the page; the app around the editor hears it and lets its sidebar give way. */
  private openBehaviour(target: BehaviourTarget) {
    this.panel.flush(); this.panel.target = target; this.panel.refresh();
    if (!this.panel.hidden) return;
    this.panel.hidden = false;
    this.dispatchEvent(new CustomEvent(PANEL_EVENT, { detail: { open: true }, bubbles: true }));
    void this.panel.updateComplete.then(() => this.panel.focus());
  }
  private closeBehaviour() {
    this.panel.flush(); this.panel.target = undefined;
    if (this.panel.hidden) return;
    this.panel.hidden = true;
    this.dispatchEvent(new CustomEvent(PANEL_EVENT, { detail: { open: false }, bubbles: true }));
  }
  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); addEventListener('beforeunload', this.unloading); }
  disconnectedCallback() { super.disconnectedCallback(); this.destroy(); removeEventListener('beforeunload', this.unloading); }
  destroy() { this.closeBehaviour(); this.generation++; clearTimeout(this.poll); this.controller?.destroy(); this.controller = undefined; this.settle?.(false); }
  /** Call after flushing the previous document. A supplied URL is the authenticated, script-free site canvas. */
  open(snapshot: NativePageSnapshot, save: NativePageSave, source?: { url: string; html?: string } | { styles: string }) {
    clearTimeout(this.poll); this.expectedDocument = this.frame.contentDocument ?? undefined;
    this.closeBehaviour();
    this.controller?.destroy(); this.controller = undefined; this.settle?.(false);
    this.snapshot = structuredClone(snapshot); this.observedDocument = JSON.stringify(snapshot.document); this.save = save; this.generation++;
    this.deadline=Date.now()+15000;
    this.ready = new Promise(resolve => { this.settle = resolve; });
    this.source = source && 'url' in source ? source.url : '';
    if (source && 'html' in source && source.html) {
      this.frame.removeAttribute('src');
      this.frame.srcdoc = protectCanvasHTML(source.html);
    } else if (this.source) { this.frame.removeAttribute('srcdoc'); this.frame.src = this.source; }
    else {
      this.frame.removeAttribute('src');
      const page = renderNativePage(snapshot.document, { images: snapshot.images, collections: snapshot.collections, editor: true, components: snapshot.components });
      this.frame.srcdoc = protectCanvasHTML(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${baseStyles}\n${nativePageStyles}\n${source && 'styles' in source ? source.styles : ''}\nhtml{--sf:1;--ds-sf:1}body{margin:0;font:14px/20px var(--ds-typeface-regular);color:var(--ds-text-color);background:var(--ds-paper)}.c9y-native-text,.c9y-component-words,.aa-plain,.aa-plain>.aa-block{font:inherit;color:inherit;line-height:inherit;margin:0;padding:0;min-height:0;outline:none;background:none}.c9y-native-text{display:contents}</style></head><body${snapshot.document.layout.mode==='document'?' data-c9y-native-root':''}>${page}</body></html>`);
    }
    this.requestUpdate();
    this.poll = setTimeout(() => this.checkReady(), 0);
    return this.ready;
  }
  /** DOM and styles are enough to edit. Eager pictures must not hold the entire editor hostage. */
  private checkReady() {
    clearTimeout(this.poll);
    if (this.mounting === this.generation) return;
    if(Date.now()>this.deadline){this.settle?.(false);this.settle=undefined;this.dispatchEvent(new CustomEvent('page-error',{bubbles:true}));return;}
    const doc = this.frame.contentDocument;
    if (!this.isConnected || !doc || doc === this.expectedDocument || doc.readyState === 'loading' || !doc.querySelector('[data-c9y-native-root]') || [...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some(link => !link.sheet && !link.disabled)) {
      this.poll = setTimeout(() => this.checkReady(), 16); return;
    }
    this.mounting = this.generation;
    const generation=this.generation;
    void this.mount().catch(()=>{if(generation!==this.generation)return;this.settle?.(false);this.settle=undefined;this.dispatchEvent(new CustomEvent('page-error',{bubbles:true}));});
  }
  private async mount() {
    const opening = this.generation;
    if(this.frame.contentDocument){await prepareComponents(this.frame.contentDocument.body);if(opening!==this.generation)return;await componentsReady(upgradeComponentTree(this.frame.contentDocument.body,this.assetURL,true));}
    if(opening!==this.generation)return;
    if (!this.snapshot || !this.save || !this.isConnected) return;
    if(this.snapshot&&this.frame.contentDocument)for(const[key,value]of Object.entries(nativePageRootStyles(this.snapshot.document)))this.frame.contentDocument.body.style.setProperty(key,value,'important');
    const root = this.frame.contentDocument?.querySelector('[data-c9y-native-root]');
    if (!root) { this.settle?.(false); this.dispatchEvent(new CustomEvent('page-error',{bubbles:true})); return; }
    const base = this.frame.contentDocument?.documentElement.getAttribute('data-c9y-native-base');
    if (base && base !== this.snapshot.base) { this.settle?.(false); this.dispatchEvent(new CustomEvent('page-reopen', { bubbles: true })); return; }
    const snapshot = this.snapshot, save = this.save, generation = this.generation;
    this.controller?.destroy();
    this.controller = new NativeSiteController(this.frame, snapshot, async value => {
      const accepted = await save(value);
      if (generation === this.generation) this.snapshot = accepted;
      return accepted;
    }, () => this.dispatchEvent(new CustomEvent('page-reopen', { bubbles: true })), {
      assetURL: this.assetURL,
      behaviour: target => this.openBehaviour(target),
      changed: () => {
        // The open block changed or went: the panel draws it as it stands, or closes with it.
        if (!this.panel.hidden) { if (this.panel.target?.read()) this.panel.refresh(); else this.closeBehaviour(); }
        const document = JSON.stringify(this.controller?.state.document ?? this.snapshot?.document);
        if (document === this.observedDocument) return;
        this.observedDocument = document;
        this.dispatchEvent(new CustomEvent('consistency-change', { bubbles: true }));
      },
      imageURL: source => {
        if(!this.source)return source;
        if(/^\/media\/uploads\/[^/]+$/.test(source)&&snapshot.origin)return new URL(source,snapshot.origin).href;
        return source.startsWith('/')&&snapshot.images.includes(source)?new URL(this.source,location.href).pathname.replace(/\/document$/,'/files')+source:source;
      },
    });
    this.settle?.(true); this.settle = undefined;
    this.dispatchEvent(new CustomEvent('page-ready', { detail: { frame: this.frame }, bubbles: true }));
  }
  get canvas(){return this.frame;}
  set active(value:boolean){if(!value)this.closeBehaviour();this.hidden=!value;this.frame.className=value?'consistency-site-frame':'consistency-site-frame-cached';}
  get pending() { return this.controller?.pending ?? false; }
  readDocument(): NativePageDocument { if (!this.snapshot) throw new Error('No page is open.'); return structuredClone(this.controller?.state.document ?? this.snapshot.document); }
  async flush() {
    await this.ready;
    // A rejected canvas has no editable controller or local changes; let the host reopen it.
    return this.controller ? this.controller.flush() : true;
  }
  render() { return html`<div class="consistency-site-stage">${this.frame}${this.panel}</div>`; }
}
customElements.define('consistency-page-editor', ConsistencyPageEditor);
