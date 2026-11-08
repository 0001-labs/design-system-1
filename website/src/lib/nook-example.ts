import type { LayoutExample } from './layout-examples';
import { library, photo, text } from './library-example-parts';

// Nook, a fictional private workspace, in the Nook library: white paper and near-black ink, light
// display type, hairline page rules, soft blooms of colour and full-bleed black bands. The look is
// the library's; this page holds only where things stand. Tabs and the floating pill draw their
// first state in the markup, so the page reads the same with no script (the editor runs none).

const composition = `<style>
/* The page stands centred in sixty-one squares, ruled down both sides, so the grid starts where the
   page does. Below that the page fills and the grid keeps the left edge. */
:root { --ds-grid-origin-x:max(0px, calc(50% - 30 * var(--ds-unit))); }
.nook [hidden] { display:none !important; }
.nook-page { box-sizing:border-box; width:100%; max-width:calc(61 * var(--ds-unit)); margin-inline:auto; min-width:0; border-inline:1px solid var(--nook-line); }
.nook-wrap { box-sizing:border-box; width:100%; max-width:calc(61 * var(--ds-unit)); margin-inline:auto; padding-inline:var(--ds-unit); min-width:0; }
.nook-top { display:block; max-width:calc(61 * var(--ds-unit)); margin-inline:auto; }
.nook-stack { display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; min-width:0; }
.nook-stack > * { margin:0; }
.nook-title { display:block; margin:0; }
.nook-pad { padding:calc(2 * var(--ds-unit)); min-width:0; }
.nook-rule { border-block-start:1px solid var(--nook-line); }
.nook-cta { display:flex; flex-wrap:wrap; gap:calc(0.5 * var(--ds-unit)); }

/* Blooms: blurred colour in the corners of a light section. */
.nook-bloom-a { background-image:radial-gradient(38% 55% at 100% 0%, rgba(255,150,175,.5), transparent 70%), radial-gradient(34% 50% at 0% 100%, rgba(196,238,96,.5), transparent 70%), radial-gradient(30% 45% at 100% 100%, rgba(150,205,255,.45), transparent 70%); }
.nook-bloom-b { background-image:radial-gradient(40% 55% at 0% 0%, rgba(255,196,160,.55), transparent 70%), radial-gradient(36% 50% at 100% 100%, rgba(196,238,96,.45), transparent 70%); }
.nook-bloom-c { background-image:radial-gradient(40% 60% at 100% 50%, rgba(150,205,255,.5), transparent 70%), radial-gradient(36% 55% at 0% 0%, rgba(255,150,175,.4), transparent 70%); }

/* Hero: a box ruled by hairlines, split in half so its rule meets the middle rule of the four cells below. */
.nook-hero { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); border-block-end:1px solid var(--nook-line); }
.nook-hero-words { display:grid; gap:var(--ds-unit); align-content:center; padding:calc(4 * var(--ds-unit)) calc(2 * var(--ds-unit)); min-width:0; }
.nook-hero-lead { max-width:calc(20 * var(--ds-unit)); }
.nook-hero-art { display:grid; place-items:center; padding:calc(2 * var(--ds-unit)); border-inline-start:1px solid var(--nook-line); min-width:0; }
.nook-hero-art svg { display:block; width:100%; max-width:calc(20 * var(--ds-unit)); height:auto; color:var(--ds-text-color); }
.nook-features { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border-block-end:1px solid var(--nook-line); }
.nook-features > * { padding:calc(1.5 * var(--ds-unit)) var(--ds-unit); border-inline-start:1px solid var(--nook-line); min-width:0; }
.nook-features > :first-child { border-inline-start:0; }
.nook-video { display:grid; gap:var(--ds-unit); align-content:space-between; min-height:calc(7 * var(--ds-unit)); background:#0b0b0b; color:#fff; text-decoration:none; }
.nook-video ds-text { --ds-text-color:#fff; } .nook-video { --ds-text-color-muted:#a3a3a3; }
.nook-play { display:block; width:calc(2 * var(--ds-unit)); height:calc(2 * var(--ds-unit)); border-radius:50%; background:#fff; position:relative; }
.nook-play::after { content:""; position:absolute; inset-block-start:50%; inset-inline-start:calc(50% - 3px); width:calc(0.5 * var(--ds-unit)); height:calc(0.6 * var(--ds-unit)); background:#0b0b0b; clip-path:polygon(0 0, 100% 50%, 0 100%); transform:translateY(-50%); }

/* Sections. */
.nook-section { padding-block:calc(5 * var(--ds-unit)); border-block-end:1px solid var(--nook-line); }
.nook-section[data-band] { border-block-end:0; }
.nook-section > .nook-wrap, .nook-section > .nook-page > .nook-wrap { display:grid; gap:calc(2 * var(--ds-unit)); }
.nook-head { display:grid; gap:var(--ds-unit); max-width:calc(36 * var(--ds-unit)); }

/* Three dark mock apps with their words beneath. */
.nook-apps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.nook-app { display:grid; gap:var(--ds-unit); align-content:start; min-width:0; }
.nook-mock { box-sizing:border-box; display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; min-height:calc(15 * var(--ds-unit)); padding:var(--ds-unit); border:1px solid #2c2c2c; border-radius:var(--ds-radius-card); background:#161616; overflow:hidden; min-width:0; }
.nook-mock-bar { display:flex; align-items:center; gap:calc(0.4 * var(--ds-unit)); padding-block-end:calc(0.5 * var(--ds-unit)); border-block-end:1px solid #2c2c2c; }
.nook-dot { width:calc(0.4 * var(--ds-unit)); height:calc(0.4 * var(--ds-unit)); border-radius:50%; background:#3a3a3a; }
.nook-bubble { max-width:80%; padding:calc(0.4 * var(--ds-unit)) calc(0.6 * var(--ds-unit)); border-radius:calc(0.6 * var(--ds-unit)); background:#262626; }
.nook-bubble[data-own] { justify-self:end; background:#ffffff; }
.nook-bubble[data-own] ds-text { --ds-text-color:#0b0b0b; color:#0b0b0b; }
.nook-line { height:calc(0.4 * var(--ds-unit)); border-radius:calc(0.2 * var(--ds-unit)); background:#2c2c2c; }
.nook-line[data-short] { width:62%; }
.nook-mock-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:calc(0.5 * var(--ds-unit)); align-items:center; padding-block:calc(0.4 * var(--ds-unit)); border-block-end:1px solid #2c2c2c; }

/* Numbered panels: ruled columns, each a number, a huge heading and two facts. */
.nook-panels { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border:1px solid var(--nook-line); background:rgba(255,255,255,.72); }
.nook-panel { display:grid; gap:calc(2 * var(--ds-unit)); align-content:space-between; padding:calc(1.5 * var(--ds-unit)); border-inline-start:1px solid var(--nook-line); min-width:0; }
.nook-panel:first-child { border-inline-start:0; }
.nook-facts { display:grid; gap:calc(0.5 * var(--ds-unit)); }
.nook-facts > * { padding-block-start:calc(0.5 * var(--ds-unit)); border-block-start:1px solid var(--nook-line); margin:0; }

/* Compose freely: a window with a row of tabs and a panel under them. */
.nook-window { box-sizing:border-box; display:grid; gap:var(--ds-unit); padding:var(--ds-unit); border:1px solid var(--nook-line); border-radius:var(--ds-radius-card); background:#fff; min-width:0; }
.nook-window ds-tabs { justify-self:start; max-width:100%; }
.nook-pane { display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; min-height:calc(10 * var(--ds-unit)); min-width:0; }
.nook-pane-cols { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.nook-pane-cols > * { min-width:0; }
.nook-check { display:grid; grid-template-columns:auto minmax(0,1fr); gap:calc(0.5 * var(--ds-unit)); align-items:center; }
.nook-table { display:grid; border-block-start:1px solid #0b0b0b; }
.nook-table > div { display:grid; grid-template-columns:minmax(0,3fr) minmax(0,2fr) minmax(0,2fr); gap:var(--ds-unit); padding-block:calc(0.5 * var(--ds-unit)); border-block-end:1px solid var(--nook-line); }
.nook-table > div > * { min-width:0; }
.nook-board { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.nook-col { display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; padding:calc(0.5 * var(--ds-unit)); border-radius:var(--ds-radius); background:var(--ds-fill); min-width:0; }
.nook-card { padding:calc(0.5 * var(--ds-unit)) var(--ds-unit); border-radius:var(--ds-radius); background:#fff; border:1px solid var(--nook-line); }
.nook-gallery { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.nook-gallery > * { min-width:0; }
.nook-views { display:grid; gap:var(--ds-unit); }

/* Think fast: three facts on rules. */
.nook-fast { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--ds-unit); }
.nook-fast > div { display:grid; gap:calc(0.5 * var(--ds-unit)); align-content:start; padding-block-start:var(--ds-unit); border-block-start:1px solid #0b0b0b; }

/* Quotes. */
.nook-quotes { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid var(--nook-line); }
.nook-quote { display:grid; gap:var(--ds-unit); align-content:space-between; padding:calc(1.5 * var(--ds-unit)) var(--ds-unit); border-inline-start:1px solid var(--nook-line); min-width:0; }
.nook-quote:first-child { border-inline-start:0; }

/* Closing and footer. */
.nook-closing { padding-block:calc(7 * var(--ds-unit)); }
.nook-closing > .nook-wrap { display:grid; justify-items:start; gap:calc(2 * var(--ds-unit)); }
.nook-closing .nook-closing-title { max-width:calc(40 * var(--ds-unit)); }
.nook-footer { display:block; max-width:calc(61 * var(--ds-unit)); margin-inline:auto; }

/* The floating pill: sticky, so it holds centred at the bottom of whatever scrolls (the window or the editor canvas) and takes no room, a translucent dark bar of three places. */
.nook-float-wrap { position:sticky; inset-block-end:var(--ds-unit); z-index:20; display:flex; justify-content:center; align-items:flex-end; height:0; pointer-events:none; }
.nook-float { pointer-events:auto; box-sizing:border-box; display:flex; gap:calc(0.25 * var(--ds-unit)); padding:calc(0.5 * var(--ds-unit)); border-radius:999px; background:rgba(14,14,14,.82); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); box-shadow:0 0 0 1px rgba(255,255,255,.08); }
.nook-float a { box-sizing:border-box; display:block; height:var(--ds-unit); padding:calc(2px * var(--ds-sf, 1)) calc(0.75 * var(--ds-unit)) 0; border-radius:999px; color:#e8e8e8; font-size:var(--ds-type-size-default); line-height:calc(16px * var(--ds-sf, 1)); text-decoration:none; }
.nook-float a[aria-current] { background:#fff; color:#0b0b0b; }

@media(max-width:899px) {
 .nook-hero { grid-template-columns:minmax(0,1fr); }
 .nook-hero-art { border-inline-start:0; border-block-start:1px solid var(--nook-line); }
 .nook-features, .nook-quotes { grid-template-columns:repeat(2,minmax(0,1fr)); }
 .nook-features > :nth-child(3) { border-inline-start:0; }
 .nook-features > :nth-child(n+3) { border-block-start:1px solid var(--nook-line); }
 .nook-quote:nth-child(3) { border-inline-start:0; }
 .nook-quote:nth-child(n+3) { border-block-start:1px solid var(--nook-line); }
 .nook-apps, .nook-panels, .nook-fast, .nook-pane-cols, .nook-board, .nook-gallery { grid-template-columns:minmax(0,1fr); }
 .nook-panel { border-inline-start:0; border-block-start:1px solid var(--nook-line); }
 .nook-panel:first-child { border-block-start:0; }
}
@media(max-width:600px) {
 .nook-section { padding-block:calc(3 * var(--ds-unit)); }
 .nook-closing { padding-block:calc(4 * var(--ds-unit)); }
 .nook-hero-words { padding:calc(2 * var(--ds-unit)) var(--ds-unit); }
 .nook-features, .nook-quotes { grid-template-columns:minmax(0,1fr); }
 .nook-features > *, .nook-quote { border-inline-start:0; border-block-start:1px solid var(--nook-line); }
 .nook-features > :first-child, .nook-quote:first-child { border-block-start:0; }
 .nook-table > div { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
 .nook-table > div > :last-child { display:none; }
}
</style>`;

const type = (role: string, words: string, attrs = '') => text(words, `data-type="${role}" wrap ${attrs}`);
const heading = (role: string, words: string, level: number, extra = '') => type(role, words, `role="heading" aria-level="${level}" ${extra}`);
const body = (words: string, attrs = '') => type('body', words, `tone="muted" ${attrs}`);
const small = (words: string, attrs = '') => type('small', words, attrs);

// A line drawing in the library's stroke: one weight, round ends, the ink. A cabin on a ground
// line, a shield with a keyhole in it, a phone and a laptop each side, and a dashed link between.
const drawing = `<svg viewBox="0 0 400 340" role="img" aria-label="A small house with a lock on its door, a laptop and a phone beside it, joined by dashed lines" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 300H380"/>
  <path d="M110 300V168L200 96L290 168V300"/>
  <path d="M96 176L200 92L304 176"/>
  <path d="M200 148C200 148 232 158 232 182V210C232 232 200 246 200 246C200 246 168 232 168 210V182C168 158 200 148 200 148Z"/>
  <circle cx="200" cy="190" r="9"/>
  <path d="M200 199V214"/>
  <path d="M244 300V262H276V300"/>
  <rect x="24" y="226" width="62" height="42" rx="4"/>
  <path d="M14 276H96L90 268H20Z"/>
  <rect x="318" y="206" width="30" height="58" rx="5"/>
  <path d="M328 256H338"/>
  <path d="M88 247C100 247 100 247 110 247" stroke-dasharray="3 5"/>
  <path d="M290 235C302 235 306 235 318 235" stroke-dasharray="3 5"/>
  <path d="M140 60C160 36 240 36 260 60" stroke-dasharray="3 5"/>
  <path d="M120 36L140 60" stroke-dasharray="3 5"/>
  <circle cx="60" cy="120" r="3"/>
  <circle cx="340" cy="120" r="3"/>
  <circle cx="320" cy="60" r="2"/>
</svg>`;

const tab = (name: string, controls: string, active: boolean) => `<ds-button control="host" role="tab" aria-controls="${controls}" aria-selected="${active}"${active ? ' active' : ''}>${name}</ds-button>`;
const tabs = (label: string, group: string, items: [string, string][]) => `<ds-tabs wrap aria-label="${label}" data-switch="${group}">${items.map(([name, id], index) => tab(name, id, index === 0)).join('')}</ds-tabs>`;
const pane = (id: string, content: string, shown: boolean) => `<div class="nook-pane" id="${id}" role="tabpanel"${shown ? '' : ' hidden'}>${content}</div>`;
const check = (words: string, done = false) => `<div class="nook-check"><ds-checkbox><input type="checkbox" aria-label="${words}"${done ? ' checked' : ''}></ds-checkbox>${type('body', words)}</div>`;
const tableRow = (name: string, status: string, due: string) => `<div>${type('body', name)}${body(status)}${body(due)}</div>`;
const mockRow = (name: string, status: string) => `<div class="nook-mock-row">${type('small', name)}<ds-tag>${status}</ds-tag></div>`;
const app = (mock: string, name: string, words: string) => `<div class="nook-app">${mock}<div class="nook-stack">${heading('title', name, 3)}${body(words)}</div></div>`;
const panel = (number: string, title: string, facts: [string, string]) => `<div class="nook-panel">
  <div class="nook-stack">${type('number', number, 'tone="muted"')}${heading('panel', title, 3)}</div>
  <div class="nook-facts">${facts.map(fact => body(fact)).join('')}</div>
</div>`;
const quote = (words: string, name: string, role: string) => `<figure class="nook-quote" style="margin:0">${type('body', words)}<figcaption class="nook-stack">${small(name, 'strong')}${small(role, 'tone="muted"')}</figcaption></figure>`;
const fast = (name: string, words: string) => `<div>${heading('figure', name, 3)}${body(words)}</div>`;
const feature = (name: string, words: string) => `<div class="nook-stack">${heading('title', name, 3)}${body(words)}</div>`;

const download = (extra = '') => `<ds-button primary ${extra} href="#download"><span>Download</span></ds-button>`;
const footer = JSON.stringify([
  { heading: 'Nook', links: [{ label: 'What', href: '#what' }, { label: 'Why', href: '#why' }, { label: 'Who', href: '#who' }] },
  { heading: 'Get it', links: [{ label: 'Download', href: '#download' }, { label: 'Introduction', href: '#intro' }] },
  { heading: 'Help', links: [{ label: 'Guides', href: '#guides' }, { label: 'Contact', href: '#contact' }] },
]);

const html = `${composition}
<div class="nook" data-ds-surface id="top">
<ds-header class="nook-top" data-plain label="Main"><a slot="brand" data-wordmark href="#top">nook</a><ds-button slot="actions" primary href="#download"><span>Download</span></ds-button></ds-header>
<main>
<div class="nook-page nook-bloom-a" id="what">
  <section class="nook-hero" aria-label="Nook">
    <div class="nook-hero-words">
      <div role="heading" aria-level="1" class="nook-title">${type('hero', 'A safe place')}${type('hero', 'for your team', 'data-tone="pink"')}</div>
      ${body('Nook is a private workspace for teams. Chats, documents and databases live on your devices, so the work stays yours.', 'class="nook-hero-lead"')}
      <div class="nook-cta">${download('data-size="medium"')}<ds-button secondary data-size="medium" href="#intro"><span>See how it works</span></ds-button></div>
    </div>
    <div class="nook-hero-art">${drawing}</div>
  </section>
  <div class="nook-features">
    ${feature('Yours alone', 'Everything is kept on your own devices. Nobody else holds a copy to read.')}
    ${feature('Works together', 'Share a space with your team. Changes meet up when everyone is back online.')}
    ${feature('Built to last', 'Your work is plain files you can open, move and keep, even without Nook.')}
    <a class="nook-video" id="intro" href="#intro" aria-label="Watch the introduction, two minutes"><span class="nook-play" aria-hidden="true"></span><div class="nook-stack">${type('title', 'Watch the introduction')}${small('Two minutes, no sign-up', 'tone="muted"')}</div></a>
  </div>
</div>

<section class="nook-section" data-band="dark" aria-labelledby="nook-organise"><div class="nook-wrap">
  <div class="nook-head">${small('One place for the day', 'tone="muted"')}${heading('display', 'Discuss. Organise. Remember.', 2, 'id="nook-organise"')}</div>
  <div class="nook-apps">
    ${app(`<div class="nook-mock" aria-label="A chat">
      <div class="nook-mock-bar"><span class="nook-dot"></span><span class="nook-dot"></span><span class="nook-dot"></span></div>
      <div class="nook-bubble">${small('Can we move the review to Friday?')}</div>
      <div class="nook-bubble" data-own>${small('Yes. I will update the plan.')}</div>
      <div class="nook-bubble">${small('Thanks, I will tell the others.')}</div>
    </div>`, 'Discuss', 'Talk with your team in rooms that keep their own history, and turn any message into a note.')}
    ${app(`<div class="nook-mock" aria-label="A document">
      <div class="nook-mock-bar"><span class="nook-dot"></span><span class="nook-dot"></span><span class="nook-dot"></span></div>
      ${type('title', 'Autumn plan')}
      <div class="nook-line"></div><div class="nook-line"></div><div class="nook-line" data-short></div>
      <div class="nook-line"></div><div class="nook-line" data-short></div>
    </div>`, 'Organise', 'Write pages, link them together and keep each project in its own space.')}
    ${app(`<div class="nook-mock" aria-label="A list of tasks">
      <div class="nook-mock-bar"><span class="nook-dot"></span><span class="nook-dot"></span><span class="nook-dot"></span></div>
      ${mockRow('Book the venue', 'Done')}${mockRow('Send the invites', 'Doing')}${mockRow('Print the signs', 'To do')}${mockRow('Thank the helpers', 'To do')}
    </div>`, 'Remember', 'Keep lists and records you can sort and find again, long after the day has passed.')}
  </div>
</div></section>

<div class="nook-page" id="why">
  <section class="nook-section nook-bloom-b" aria-labelledby="nook-privacy"><div class="nook-wrap">
    <div class="nook-head">${small('Why Nook', 'tone="muted"')}${heading('display', 'Privacy, in three parts.', 2, 'id="nook-privacy"')}</div>
    <div class="nook-panels">
      ${panel('1', 'Yours, on your devices.', ['Your chats, pages and lists are stored on the phone or computer you use.', 'There is no account to hand over and no server that holds your work.'])}
      ${panel('2', 'Locked, from end to end.', ['Whatever leaves your device is scrambled first, and only your team can unscramble it.', 'Even we cannot read what you send.'])}
      ${panel('3', 'Open, if you leave.', ['Export everything as plain files at any time, in one tap.', 'Your work never depends on us staying around.'])}
    </div>
  </div></section>

  <section class="nook-section" aria-labelledby="nook-compose"><div class="nook-wrap">
    <div class="nook-head">${small('What you can make', 'tone="muted"')}${heading('display', 'Compose freely.', 2, 'id="nook-compose"')}${body('Start with a blank page and add only what you need. Nothing is in the way.')}</div>
    <div class="nook-window">
      ${tabs('Parts of Nook', 'compose', [['Editor', 'nook-editor'], ['Databases', 'nook-databases'], ['Templates', 'nook-templates'], ['Widgets', 'nook-widgets']])}
      ${pane('nook-editor', `${heading('title', 'Autumn plan', 3)}${body('A page is words first. Add headings, lists and links as you go.')}${check('Choose the dates', true)}${check('Ask the team for ideas')}${check('Share the plan')}`, true)}
      ${pane('nook-databases', `${heading('title', 'Every list is a database', 3)}${body('Give each row its own fields, and see the same rows in a table, a board or a gallery.')}`, false)}
      ${pane('nook-templates', `<div class="nook-pane-cols"><ds-card tone="pink"><span slot="title">Meeting notes</span><p>Date, people and what was decided.</p></ds-card><ds-card tone="apple-green"><span slot="title">Project plan</span><p>Goals, dates and who does what.</p></ds-card><ds-card tone="sharp-blue"><span slot="title">Weekly review</span><p>What went well and what comes next.</p></ds-card></div>`, false)}
      ${pane('nook-widgets', `<div class="nook-pane-cols"><ds-stat literal label="Open tasks" figure="12" caption="Across 3 projects"></ds-stat><ds-stat literal label="Due this week" figure="4" caption="Two are yours"></ds-stat><ds-stat literal label="Pages" figure="86" caption="Added by 7 people"></ds-stat></div>`, false)}
    </div>
    <div class="nook-views">
      ${heading('title', 'See the same rows your way.', 3)}
      <div class="nook-window">
        ${tabs('Views', 'views', [['Table', 'nook-table'], ['Kanban', 'nook-kanban'], ['Gallery', 'nook-gallery']])}
        ${pane('nook-table', `<div class="nook-table">${tableRow('Book the venue', 'Done', '3 Nov')}${tableRow('Send the invites', 'Doing', '10 Nov')}${tableRow('Print the signs', 'To do', '17 Nov')}${tableRow('Thank the helpers', 'To do', '24 Nov')}</div>`, true)}
        ${pane('nook-kanban', `<div class="nook-board"><div class="nook-col">${small('To do', 'strong')}<div class="nook-card">${small('Print the signs')}</div><div class="nook-card">${small('Thank the helpers')}</div></div><div class="nook-col">${small('Doing', 'strong')}<div class="nook-card">${small('Send the invites')}</div></div><div class="nook-col">${small('Done', 'strong')}<div class="nook-card">${small('Book the venue')}</div></div></div>`, false)}
        ${pane('nook-gallery', `<div class="nook-gallery">${photo('room.jpg', 'A bright room with a table', '4 / 3')}${photo('cup.jpg', 'A cup on a desk', '4 / 3')}${photo('chair.jpg', 'A wooden chair by a wall', '4 / 3')}</div>`, false)}
      </div>
    </div>
  </div></section>

  <section class="nook-section nook-bloom-c" aria-labelledby="nook-fast"><div class="nook-wrap">
    <div class="nook-head">${small('Made to be quick', 'tone="muted"')}${heading('display', 'Think fast.', 2, 'id="nook-fast"')}</div>
    <div class="nook-fast">
      ${fast('Offline-first', 'Open, write and search on a plane or a train. Nook never waits for a connection.')}
      ${fast('Fast sync', 'When you are back online, changes find their way to your team in moments.')}
      ${fast('Native on phones', 'A real app for your phone, not a web page in a frame. It opens at once.')}
    </div>
  </div></section>

  <section class="nook-section" id="who" aria-labelledby="nook-who"><div class="nook-wrap">
    <div class="nook-head">${small('Who uses it', 'tone="muted"')}${heading('display', 'Teams who like quiet.', 2, 'id="nook-who"')}</div>
    <div class="nook-quotes">
      ${quote('We stopped worrying about where our notes go. They stay on our laptops.', 'Mina Okafor', 'Studio lead, Harbour Print')}
      ${quote('I write on the train with no signal, and everything is there when I get in.', 'Tomas Lindgren', 'Researcher, Fjord Labs')}
      ${quote('Our whole team moved in an afternoon. The templates did most of the work.', 'Aiko Tanaka', 'Operations, Little Mill')}
      ${quote('It feels like a calm room. Nothing pings, and nothing is lost.', 'Ruben Castillo', 'Founder, Paper Kite')}
    </div>
  </div></section>
</div>
</main>

<div data-band="dark">
<section class="nook-closing nook-rule" id="download"><div class="nook-wrap">
  ${heading('closing', 'Make your own corner of the web.', 2, 'class="nook-closing-title"')}
  ${download('data-size="large"')}
</div></section>
<ds-footer class="nook-footer" brand="nook" tagline="A private workspace for teams" literal year="2026" columns='${footer}'><span slot="legal">A fictional product, drawn by the Nook library.</span></ds-footer>
</div>
</div>
<div class="nook-float-wrap"><nav class="nook-float" aria-label="Sections"><a href="#what" aria-current="true">What</a><a href="#why">Why</a><a href="#who">Who</a></nav></div>`;

// A tab shows its panel; the first state is already in the markup, so this only adds switching.
const script = `document.querySelectorAll('ds-tabs[data-switch]').forEach(tabs => {
  tabs.addEventListener('click', event => {
    const target = event.target.closest('ds-button[role="tab"]');
    if (!target) return;
    tabs.querySelectorAll('ds-button[role="tab"]').forEach(tab => {
      const on = tab === target;
      tab.toggleAttribute('active', on);
      tab.setAttribute('aria-selected', String(on));
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  });
});
document.querySelectorAll('.nook-float a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nook-float a').forEach(item => item.toggleAttribute('aria-current', item === link));
  });
});`;

export const NOOK_EXAMPLE: LayoutExample = {
  name: 'Private workspace',
  use: 'A product home page for a private, local-first workspace: white paper, light display type, hairline page rules, soft blooms, black bands and a floating pill of places.',
  height: 900,
  library: library('nook'),
  html,
  script,
};
