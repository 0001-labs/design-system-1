import { LitElement, css, html, unsafeCSS } from 'lit';
import { define } from '../0-face/define';
import { PHONE_WIDTH, PHONE_WINDOW_RATIO, WINDOW_RATIO } from '../0-face/window-shape';
import './app-chrome';
import { isWorkspace } from './workspace-frame';
export class DsWindow extends LitElement {
  static properties = { frameless:{type:Boolean,reflect:true}, kind:{reflect:true}, appearance:{reflect:true}, label:{}, address:{}, href:{}, interactive:{type:Boolean}, favicon:{}, backAvailable:{type:Boolean,attribute:'back-available'}, forwardAvailable:{type:Boolean,attribute:'forward-available'}, username:{}, prompt:{}, reply:{}, model:{}, items:{} };
  declare frameless: boolean; declare kind: string; declare appearance: string; declare label: string; declare address: string; declare href: string; declare interactive: boolean; declare favicon: string; declare backAvailable: boolean; declare forwardAvailable: boolean; declare username: string; declare prompt: string; declare reply: string; declare model: string; declare items: string;
  constructor(){super();this.frameless=false;this.kind='macos';this.appearance='light';this.label='Application';this.address='';this.href='';this.interactive=false;this.favicon='';this.backAvailable=true;this.forwardAvailable=false;this.username='account';this.prompt='';this.reply='';this.model='';this.items='';}
  static styles=css`
    :host { display:flex; flex-direction:column; width:100%; min-width:0; height:var(--ds-window-height,auto); aspect-ratio:${unsafeCSS(WINDOW_RATIO)}; overflow:hidden; border-radius:12px; border:1px solid #0003; background:var(--ds-window-paper,#fff); box-shadow:0 20px 50px #0002; }
    @media (max-width:${unsafeCSS(PHONE_WIDTH)}px) { :host { aspect-ratio:${unsafeCSS(PHONE_WINDOW_RATIO)}; } }
    :host([frameless]) { display:contents; }
    :host([frameless]) ds-app-chrome { display:none; }
    :host([frameless]) .viewport { display:contents; }
    :host([appearance=dark]) { border-color:#ffffff40; --ds-window-paper:#1c1c1e; }
    :host([kind=macos-compact]) { border-radius:calc(10px * var(--sf,1)); box-shadow:none; border-color:color-mix(in srgb,var(--ds-text-color,#26251e) 10%,transparent); }
    ds-app-chrome { flex:none; } .viewport { position:relative; flex:1; min-height:0; overflow:hidden; }
    /* Figma, Codex and Claude hold the viewport in their own stage. */
    ds-app-chrome.workspace { flex:1; min-height:0; } ds-app-chrome.workspace > .viewport { height:100%; }
    ::slotted(iframe) { display:block; width:100%; height:100%; border:0; }
  `;
  render(){
    const viewport=html`<div class="viewport" part="viewport"><slot></slot></div>`;
    const workspace=isWorkspace(this.kind);
    const chrome=html`<ds-app-chrome class=${workspace?'workspace':''} .kind=${this.kind} .appearance=${this.appearance} .label=${this.label} .address=${this.address} .href=${this.href} .interactive=${this.interactive} .favicon=${this.favicon} .backAvailable=${this.backAvailable} .forwardAvailable=${this.forwardAvailable} .username=${this.username} .prompt=${this.prompt} .reply=${this.reply} .model=${this.model} .items=${this.items}>${workspace?viewport:''}</ds-app-chrome>`;
    return workspace?chrome:html`${chrome}${viewport}`;
  }
}
define('ds-window',DsWindow);
declare global { interface HTMLElementTagNameMap { 'ds-window': DsWindow; } }
