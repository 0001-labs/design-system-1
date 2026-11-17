import { css, html, type TemplateResult } from 'lit';

export const WORKSPACE_KINDS = ['figma', 'codex', 'claude'] as const;
export type WorkspaceKind = typeof WORKSPACE_KINDS[number];
export const isWorkspace = (kind: string): kind is WorkspaceKind => (WORKSPACE_KINDS as readonly string[]).includes(kind);

export const workspaceFrameStyles = css`
  :host([kind=figma]), :host([kind=codex]), :host([kind=claude]) { container-type:inline-size; height:100%; min-height:0; background:transparent; }
  :host([kind=claude]) { --ws-side:#f8f8f6; --ws-main:#fff; --ws-ink:#1f1e1d; --ws-muted:#73726c; --ws-line:#e8e7e3; --ws-field:#f4f3f0; --ws-selected:#ebeae6; --ws-accent:#d97757; }
  :host([kind=claude][appearance=dark]) { --ws-side:#1f1e1d; --ws-main:#262624; --ws-ink:#f5f4ef; --ws-muted:#a3a29c; --ws-line:#3a3936; --ws-field:#30302e; --ws-selected:#33322f; }
  :host([kind=codex]) { --ws-side:#f7f7f8; --ws-main:#fff; --ws-ink:#0d0d0d; --ws-muted:#6e6e73; --ws-line:#ececec; --ws-field:#f4f4f4; --ws-selected:#ebebeb; --ws-accent:#0d0d0d; }
  :host([kind=codex][appearance=dark]) { --ws-side:#171717; --ws-main:#212121; --ws-ink:#ececec; --ws-muted:#9b9b9b; --ws-line:#303030; --ws-field:#2a2a2a; --ws-selected:#2f2f2f; --ws-accent:#ececec; }
  :host([kind=figma]) { --ws-top:#f5f5f5; --ws-side:#fff; --ws-main:#fff; --ws-canvas:#f5f5f5; --ws-ink:#000000e6; --ws-muted:#00000080; --ws-line:#e6e6e6; --ws-field:#f5f5f5; --ws-selected:#e5f4ff; --ws-accent:#0d99ff; }
  :host([kind=figma][appearance=dark]) { --ws-top:#1e1e1e; --ws-side:#2c2c2c; --ws-main:#2c2c2c; --ws-canvas:#1e1e1e; --ws-ink:#ffffffe6; --ws-muted:#ffffff8c; --ws-line:#444; --ws-field:#383838; --ws-selected:#0d99ff33; }
  .ws { display:grid; height:100%; min-height:0; overflow:hidden; background:var(--ws-main); color:var(--ws-ink); font:13px/18px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .ws > * { min-width:0; min-height:0; overflow:hidden; }
  .ws-side, .ws-main, .ws-pane { display:flex; flex-direction:column; }
  .ws-side { background:var(--ws-side); }
  .ws-pane { border-left:1px solid var(--ws-line); }
  .ws-stage { position:relative; flex:1; min-height:0; overflow:hidden; background:var(--ws-paper,#fff); }
  .ws-stage ::slotted(*) { display:block; width:100%; height:100%; border:0; }

  .ws-claude, .ws-codex { grid-template-columns:220px minmax(0,1fr) minmax(0,1.3fr); }
  .ws-claude .ws-pane-head { flex:none; height:72px; }
  .ws-codex .ws-pane-head { flex:none; height:44px; }
  @container (max-width:900px) { .ws-claude, .ws-codex { grid-template-columns:minmax(0,1fr) minmax(0,1.3fr); } .ws-claude .ws-side, .ws-codex .ws-side { display:none; } }
  @container (max-width:520px) { .ws-claude, .ws-codex { grid-template-columns:minmax(0,1fr); } .ws-claude .ws-main, .ws-codex .ws-main { display:none; } }

  .ws-figma { grid-template:40px minmax(0,1fr) / 240px minmax(0,1fr) 240px; font-size:11px; line-height:16px; }
  .ws-figma .ws-top { grid-column:1 / -1; display:flex; align-items:center; background:var(--ws-top); border-bottom:1px solid var(--ws-line); }
  .ws-figma .ws-side { border-right:1px solid var(--ws-line); }
  .ws-figma .ws-main { position:relative; padding:40px 40px 88px; background:var(--ws-canvas); }
  .ws-figma .ws-stage { outline:1px solid #0d99ff; }
  @container (max-width:1000px) { .ws-figma { grid-template-columns:240px minmax(0,1fr); } .ws-figma .ws-pane { display:none; } }
  @container (max-width:600px) { .ws-figma { grid-template-columns:minmax(0,1fr); } .ws-figma .ws-side { display:none; } }
`;

export function workspaceFrame(kind: WorkspaceKind, lights: TemplateResult) {
  const stage = html`<div class="ws-stage" part="stage"><slot></slot></div>`;
  if (kind === 'figma') return html`<div class="ws ws-figma"><div class="ws-top">${lights}</div><aside class="ws-side"></aside><div class="ws-main">${stage}</div><aside class="ws-pane"></aside></div>`;
  return html`<div class=${`ws ws-${kind}`}><aside class="ws-side"></aside><div class="ws-main"></div><section class="ws-pane"><div class="ws-pane-head"></div>${stage}</section></div>`;
}
