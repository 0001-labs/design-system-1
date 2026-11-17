import { css, html, nothing, svg, type TemplateResult } from 'lit';
import type { WorkspaceKind } from './workspace-frame';

export const workspaceStyles = css`
  .ws svg { width:16px; height:16px; flex:none; }
  .ws-figma svg { width:14px; height:14px; }
  .ico { display:grid; place-items:center; flex:none; width:28px; height:28px; border-radius:6px; color:var(--ws-muted); }
  .ico.on { background:var(--ws-selected); color:var(--ws-ink); }
  .ws-fill { flex:1; }
  .ws-text { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .ws-muted { color:var(--ws-muted); }
  .ws-bar { flex:none; display:flex; align-items:center; gap:2px; height:36px; padding:0 8px; }
  .ws-bar .lights { width:auto; padding:0 12px 0 4px; }
  .ws-main .ws-bar > .lights, .ws-pane .ws-bar > .lights { display:none; }
  .ws-row { display:flex; align-items:center; gap:8px; height:28px; margin:0 8px; padding:0 8px; border-radius:6px; }
  .ws-row .ico { width:16px; height:16px; color:inherit; }
  .ws-row.on { background:var(--ws-selected); }
  .ws-group { margin:16px 16px 4px; font-size:12px; color:var(--ws-muted); }
  .ws-foot { margin-top:auto; display:flex; align-items:center; gap:8px; height:48px; padding:0 16px; border-top:1px solid var(--ws-line); }
  .ws-avatar { display:grid; place-items:center; flex:none; width:22px; height:22px; border-radius:50%; background:var(--ws-accent); color:#fff; font-size:11px; font-weight:600; }
  .ws-title { border-bottom:1px solid var(--ws-line); padding-left:16px; }
  .ws-title strong { font-weight:500; }
  .ws-thread { flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; gap:16px; padding:20px 24px; font-size:14px; line-height:22px; }
  .ws-thread p { margin:0; }
  .ws-bubble { align-self:flex-end; max-width:85%; padding:8px 14px; border-radius:14px; background:var(--ws-field); }
  .ws-composer { flex:none; padding:0 16px 8px; }
  .ws-input { display:flex; align-items:center; gap:4px; min-height:40px; padding:0 4px 0 6px; border:1px solid var(--ws-line); border-radius:12px; background:var(--ws-main); box-shadow:0 1px 4px #0000000d; }
  .ws-input .ws-text { flex:1; color:var(--ws-muted); }
  .ws-meta { display:flex; justify-content:flex-end; gap:16px; height:28px; align-items:center; font-size:12px; color:var(--ws-muted); }
  .ws-tab { display:flex; align-items:center; height:28px; padding:0 10px; border-radius:6px; }
  .ws-url { flex:1; min-width:0; display:flex; align-items:center; height:28px; padding:0 12px; margin-left:4px; border-radius:8px; background:var(--ws-field); }
  .ws-url:empty::before { content:attr(data-placeholder); color:var(--ws-muted); }
  .ws-chip { display:flex; align-items:center; gap:4px; height:28px; padding:0 6px 0 10px; border:1px solid var(--ws-line); border-radius:8px; }
  .ws-chip .ico { width:16px; height:16px; }

  .ws-codex .ws-bubble { border-radius:18px; }
  .ws-codex .ws-input { flex-wrap:wrap; min-height:88px; align-content:space-between; padding:12px 8px 8px 16px; border-radius:20px; }
  .ws-codex .ws-input > .ws-text { flex-basis:100%; }
  .ws-send { display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:var(--ws-accent); color:var(--ws-main); }
  .ws-codex .ws-meta { justify-content:flex-start; padding-left:8px; }
  .ws-codex .ws-meta span { display:flex; align-items:center; gap:4px; }
  .ws-codex .ws-meta .ico { width:14px; height:14px; }
  .ws-codex .ws-pane-head { display:flex; align-items:center; border-bottom:1px solid var(--ws-line); }

  .ws-figma .ws-top { gap:4px; padding-right:8px; }
  .ws-figma .ws-top .lights { padding-right:8px; }
  .ws-figma .ws-tab { height:28px; gap:8px; background:var(--ws-main); font-weight:500; }
  .ws-figma .ico { width:24px; height:24px; border-radius:5px; }
  .ws-head { flex:none; display:flex; align-items:center; gap:8px; height:48px; padding:0 8px 0 12px; border-bottom:1px solid var(--ws-line); }
  .ws-head strong { display:block; font-weight:600; }
  .ws-tabs { flex:none; display:flex; align-items:center; gap:12px; height:40px; padding:0 16px; border-bottom:1px solid var(--ws-line); color:var(--ws-muted); }
  .ws-tabs b { font-weight:600; color:var(--ws-ink); }
  .ws-section { flex:none; padding:8px 0; border-bottom:1px solid var(--ws-line); }
  .ws-section > header { display:flex; align-items:center; height:32px; padding:0 8px 0 16px; font-weight:600; }
  .ws-section > header > span:first-child { flex:1; }
  .ws-figma .ws-row { height:28px; margin:0 8px; gap:6px; }
  .ws-figma .ws-row.child { padding-left:28px; }
  .ws-fields { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:0 16px 8px; }
  .ws-field { display:flex; align-items:center; gap:6px; height:24px; padding:0 8px; border-radius:5px; background:var(--ws-field); font-variant-numeric:tabular-nums; }
  .ws-field i { font-style:normal; color:var(--ws-muted); }
  .ws-swatch { width:14px; height:14px; border-radius:3px; background:#fff; box-shadow:inset 0 0 0 1px #0002; }
  .ws-share { height:24px; padding:0 10px; border-radius:5px; background:#0d99ff; color:#fff; font-weight:500; line-height:24px; }
  .ws-frame-name { position:absolute; left:40px; top:20px; color:var(--ws-muted); }
  .ws-handle { position:absolute; width:7px; height:7px; border:1px solid #0d99ff; background:#fff; z-index:1; }
  .ws-size { position:absolute; left:50%; bottom:64px; translate:-50% 0; padding:0 4px; border-radius:2px; background:#0d99ff; color:#fff; white-space:nowrap; }
  .ws-size:empty { display:none; }
  .ws-tools { position:absolute; left:50%; bottom:12px; translate:-50% 0; display:flex; align-items:center; gap:2px; height:40px; padding:0 4px; border-radius:12px; background:var(--ws-side); box-shadow:0 2px 8px #0000001f, 0 0 0 1px #0000000d; }
  .ws-tools .ico { width:32px; height:32px; border-radius:8px; color:var(--ws-ink); }
  .ws-tools .ico.on { background:#0d99ff; color:#fff; }
  .ws-tools hr { width:1px; height:20px; margin:0 4px; border:0; background:var(--ws-line); }

  @container (max-width:900px) { .ws-claude .ws-main .ws-bar > .lights, .ws-codex .ws-main .ws-bar > .lights { display:flex; } .ws-title .extra { display:none; } }
  @container (max-width:520px) { .ws-claude .ws-pane .ws-bar > .lights, .ws-codex .ws-pane .ws-bar > .lights { display:flex; } }
`;

const paths: Record<string, string> = {
  sidebar: 'M2 3h12v10H2ZM6 3v10', back: 'M10 3 5 8l5 5', forward: 'm6 3 5 5-5 5', plus: 'M8 3v10M3 8h10',
  compose: 'M7 3H3v10h10V9M12 2l2 2-6 6H6V8Z', search: 'm11 11 3 3M12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0Z',
  stack: 'M5 2h7a2 2 0 0 1 2 2v7M2 5h8v9H2Z', clock: 'M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0ZM8 5v3l2 2',
  case: 'M2 5h12v8H2ZM6 5V3h4v2', chevron: 'm4 6 4 4 4-4',
  gear: 'M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4',
  list: 'M6 4h8M6 8h8M6 12h8M2 4h1M2 8h1M2 12h1', terminal: 'm3 4 4 4-4 4M8 12h5',
  globe: 'M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0ZM2 8h12M8 2c-3 3-3 9 0 12 3-3 3-9 0-12Z', folder: 'M2 4h4l1.5 1.5H14V13H2Z',
  reload: 'M13 6a5.5 5.5 0 1 0 .5 4M13 2v4H9', mic: 'M6 3a2 2 0 0 1 4 0v4a2 2 0 0 1-4 0ZM3.5 7a4.5 4.5 0 0 0 9 0M8 11.5V14',
  up: 'M8 13V3M4 7l4-4 4 4', close: 'm4 4 8 8m0-8-8 8', diff: 'M5 2v6M2 5h6M2 12h6M10 4h4M10 12h4',
  bolt: 'M9 1 3 9h5l-1 6 6-8H8Z', book: 'M3 3h4l1 1v10l-1-1H3ZM13 3H9L8 4v10l1-1h4Z',
  laptop: 'M3 4h10v7H3ZM1 13h14', branch: 'M5 2v12M11 4a2 2 0 1 1 0 .01M11 6c0 4-6 2-6 6',
  home: 'M2.5 7 8 2.5 13.5 7v6.5h-11Z', menu: 'M3 3h4v4H3ZM9 3h4v4H9ZM3 9h4v4H3ZM9 9h4v4H9Z',
  frame: 'M5 2v12M11 2v12M2 5h12M2 11h12', rect: 'M3 3h10v10H3Z', pen: 'M8 2 3 9l2 5h6l2-5ZM8 2v6',
  text: 'M3 3h10M8 3v10', comment: 'M3 3h10v8H7l-3 3v-3H3Z', cursor: 'M3 2l10 5-4.5 1.5L7 13Z',
  play: 'M5 3l8 5-8 5Z', code: 'M5 4 1 8l4 4M11 4l4 4-4 4', layer: 'M3 3h10v10H3ZM3 7h10',
};
const glyph = (name: string) => name === 'more'
  ? svg`<svg viewBox="0 0 16 16" aria-hidden="true" style="fill:currentColor;stroke:none"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>`
  : svg`<svg viewBox="0 0 16 16" aria-hidden="true"><path d=${paths[name]}/></svg>`;
const ico = (name: string, on = false, extra = false) => html`<span class=${['ico', on ? 'on' : '', extra ? 'extra' : ''].join(' ')}>${glyph(name)}</span>`;
const row = (name: string | null, text: string, on = false, child = false) => html`<div class=${['ws-row', on ? 'on' : '', child ? 'child' : ''].join(' ')}>${name ? ico(name) : nothing}<span class="ws-text">${text}</span></div>`;

export interface WorkspaceOptions {
  kind: WorkspaceKind; label: string; address: string; username: string; prompt: string; reply: string; model: string;
  items: string[];
  stageSize: { width: number; height: number } | null;
  lights: () => TemplateResult;
}

const thread = (o: WorkspaceOptions) => html`<div class="ws-thread">${o.prompt ? html`<p class="ws-bubble">${o.prompt}</p>` : nothing}${o.reply ? html`<p>${o.reply}</p>` : nothing}</div>`;
const stage = html`<div class="ws-stage" part="stage"><slot></slot></div>`;

function claude(o: WorkspaceOptions) {
  const initial = (o.username.trim()[0] ?? 'A').toUpperCase();
  return html`<div class="ws ws-claude">
    <aside class="ws-side">
      <div class="ws-bar">${o.lights()}${ico('sidebar')}${ico('back')}${ico('forward')}</div>
      <nav>${row('plus', 'New')}${row('search', 'Search')}${row('stack', 'Artifacts')}${row('clock', 'Scheduled')}${row('case', 'Customize')}</nav>
      <p class="ws-group">Sessions</p>
      ${row(null, o.label, true)}${o.items.map(item => row(null, item))}
      <div class="ws-foot"><span class="ws-avatar">${initial}</span><span class="ws-text ws-fill">${o.username}</span>${ico('gear')}</div>
    </aside>
    <div class="ws-main">
      <div class="ws-bar ws-title">${o.lights()}<strong class="ws-text">${o.label}</strong>${ico('chevron')}<span class="ws-fill"></span>${ico('list', false, true)}${ico('terminal', false, true)}${ico('globe', true)}${ico('folder', false, true)}${ico('more')}</div>
      ${thread(o)}
      <div class="ws-composer"><div class="ws-input">${ico('plus')}<span class="ws-text">Reply to Claude</span>${ico('mic')}</div><div class="ws-meta">${o.model ? html`<span>${o.model}</span>` : nothing}<span>Auto</span></div></div>
    </div>
    <section class="ws-pane">
      <div class="ws-pane-head">
        <div class="ws-bar">${o.lights()}<span class="ws-tab ws-text">${o.address ? hostOf(o.address) : 'New tab'}</span>${ico('plus')}<span class="ws-fill"></span>${ico('more')}${ico('close')}</div>
        <div class="ws-bar">${ico('back')}${ico('reload')}<span class="ws-url ws-text" data-placeholder="Type a URL">${o.address}</span></div>
      </div>
      ${stage}
    </section>
  </div>`;
}

function codex(o: WorkspaceOptions) {
  return html`<div class="ws ws-codex">
    <aside class="ws-side">
      <div class="ws-bar">${o.lights()}<span class="ws-fill"></span>${ico('sidebar')}</div>
      <nav>${row('compose', 'New thread')}${row('bolt', 'Automations')}${row('book', 'Skills')}</nav>
      <p class="ws-group">Threads</p>
      ${row(null, o.label, true)}${o.items.map(item => row(null, item))}
      <div class="ws-foot">${ico('gear')}<span class="ws-text">Settings</span></div>
    </aside>
    <div class="ws-main">
      <div class="ws-bar ws-title">${o.lights()}<strong class="ws-text">${o.label}</strong><span class="ws-fill"></span><span class="ws-chip">Open${ico('chevron')}</span><span class="ws-chip">Commit${ico('chevron')}</span>${ico('diff')}</div>
      ${thread(o)}
      <div class="ws-composer">
        <div class="ws-input"><span class="ws-text">Ask for follow-up changes</span>${ico('plus')}${o.model ? html`<span class="ws-chip">${o.model}${ico('chevron')}</span>` : nothing}<span class="ws-fill"></span>${ico('mic')}<span class="ws-send">${glyph('up')}</span></div>
        <div class="ws-meta"><span>${ico('laptop')}Local</span><span>${ico('branch')}main</span></div>
      </div>
    </div>
    <section class="ws-pane">
      <div class="ws-pane-head ws-bar">${o.lights()}${ico('back')}${ico('forward')}${ico('reload')}<span class="ws-url ws-text" data-placeholder="Preview">${o.address}</span></div>
      ${stage}
    </section>
  </div>`;
}

function figma(o: WorkspaceOptions) {
  const size = o.stageSize;
  const field = (name: string, value: string | number) => html`<span class="ws-field"><i>${name}</i>${value}</span>`;
  const section = (title: string, body: TemplateResult | typeof nothing = nothing) => html`<section class="ws-section"><header><span>${title}</span>${ico('plus')}</header>${body}</section>`;
  const handles = ['left:36.5px;top:36.5px', 'right:36.5px;top:36.5px', 'left:36.5px;bottom:84.5px', 'right:36.5px;bottom:84.5px'];
  return html`<div class="ws ws-figma">
    <div class="ws-top">${o.lights()}${ico('home')}<span class="ws-tab"><span class="ws-text">${o.label}</span>${ico('close')}</span>${ico('plus')}</div>
    <aside class="ws-side">
      <div class="ws-head">${ico('menu')}<span class="ws-text ws-fill"><strong class="ws-text">${o.label}</strong><span class="ws-muted">Drafts</span></span>${ico('sidebar')}</div>
      <div class="ws-tabs"><b>File</b><span>Assets</span></div>
      ${section('Pages', row(null, 'Page 1', true))}
      <section class="ws-section"><header><span>Layers</span></header>${row('frame', 'Desktop', true)}${o.items.map(item => row('layer', item, false, true))}</section>
    </aside>
    <div class="ws-main">
      <span class="ws-frame-name">Desktop</span>
      ${stage}
      ${handles.map(place => html`<span class="ws-handle" style=${place}></span>`)}
      <span class="ws-size">${size ? `${size.width} × ${size.height}` : ''}</span>
      <div class="ws-tools">${ico('cursor', true)}${ico('frame')}${ico('rect')}${ico('pen')}${ico('text')}${ico('comment')}<hr>${ico('code')}</div>
    </div>
    <aside class="ws-pane">
      <div class="ws-head"><span class="ws-avatar">${(o.username.trim()[0] ?? 'A').toUpperCase()}</span><span class="ws-fill"></span>${ico('play')}<span class="ws-share">Share</span></div>
      <div class="ws-tabs"><b>Design</b><span>Prototype</span><span class="ws-fill"></span><span>100%</span></div>
      <section class="ws-section"><header><span>Frame</span>${ico('chevron')}</header><div class="ws-fields">${field('X', 0)}${field('Y', 0)}${field('W', size?.width ?? 1440)}${field('H', size?.height ?? 900)}</div></section>
      <section class="ws-section"><header><span>Appearance</span></header><div class="ws-fields">${field('', '100%')}${field('', 0)}</div></section>
      ${section('Fill', html`<div class="ws-fields"><span class="ws-field"><span class="ws-swatch"></span>FFFFFF</span>${field('', '100%')}</div>`)}
      ${section('Stroke')}${section('Effects')}${section('Export')}
    </aside>
  </div>`;
}

const hostOf = (address: string) => address.replace(/^[a-z]+:\/\//, '').replace(/\/.*$/, '');

export function workspace(o: WorkspaceOptions) {
  return o.kind === 'figma' ? figma(o) : o.kind === 'codex' ? codex(o) : claude(o);
}
