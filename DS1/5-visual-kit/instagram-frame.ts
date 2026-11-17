import { css, html } from 'lit';

export const instagramFrameStyles = css`
  :host([kind=instagram]) { height:100%; background:transparent; color:white; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .reels { position:relative; height:100%; overflow:hidden; isolation:isolate; }
  .reels-media { position:absolute; inset:0; z-index:-2; }
  .reels ::slotted(*) { width:100%; height:100%; display:block; object-fit:cover; }
`;

export const instagramFrame = () => html`<div class="reels"><div class="reels-media"><slot></slot></div></div>`;
