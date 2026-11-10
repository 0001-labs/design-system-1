// The design libraries the Examples page draws its library examples with (website/src/lib/
// library-example-parts.ts). Each starts as a new library does, from DS1's component tokens and
// measures, with its colours, corners and type edited. Writes each draft as <id>.css into the
// folder given (the site serves them until the libraries are published), and with --requests the
// library API's create request as <id>.json, for `ds1 create --json`.
//
//   node scripts/example-libraries.mjs website/public/examples/libraries
//
// Every colour is a palette colour, its pastel, its dark version, or a tint of the paper's own hue
// for fills and lines, except in a library that stands for a brand of its own (Voyage), as a
// client's library does. A library with a band (a coloured strip behind a header) also declares
// --brand-band, --brand-band-ink and --brand-highlight. Every library writes the section tones of
// Consistency's native pages (shared/consistency-vocabulary.ts TONES) as --c9y-tone-<name> and
// --c9y-tone-<name>-ink: paper, cream (`cream`, or the fill), dark (the text and the paper turned
// over), accent, highlight (`highlight`, or the cream), band (`band` and `bandInk`, or the dark tone)
// and six pastels (`pastels`, or Design system 1's: Sharp blue, Apple green, Orange, Pink, Yellow and
// Chartreuse, light and dim), each with the ink that reads on it. The run fails when a pair that
// carries words reads below 4.5:1, a tone included.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { faceCorrection } from '../DS1/0-face/face-correction.ts';

const root = fileURLToPath(new URL('..', import.meta.url));

const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const revision = /LIBRARY_REVISION = "([^"]+)"/.exec(readFileSync(join(root, 'DS1/1-root/library-tokens.ts'), 'utf8'))[1];
// A hosted stylesheet cannot reach a relative @import, so the drafts leave it out.
const withoutImports = css => css.replace(/^@import[^;]+;\s*/gm, '');
const metrics = withoutImports(readFileSync(join(root, 'DS1/1-root/component-metrics.css'), 'utf8'));
const tokens = withoutImports(readFileSync(join(root, 'DS1/1-root/component-tokens.css'), 'utf8'));
const template = `/* DS1 — version ${version}+${revision} */\n/* Design system 1 component library */\n${metrics}\n${tokens}`;

const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const ld = (light, dark) => `light-dark(${light}, ${dark})`;
const mono = '"Inter Arrows", "Iosevka", "Iosevka Extended", ui-monospace, "SF Mono", Menlo, monospace';

/** The six pastels a library's bento tiles turn through unless it names its own: palette pastels, light and dim (DS1/1-root/palette.css). */
export const PASTELS = [
  ['#ccccff', '#1d1a4c'], // Sharp blue
  ['#daffcc', '#284c1a'], // Apple green
  ['#fff2cc', '#4c3f1a'], // Orange
  ['#fad1e6', '#471f34'], // Pink
  ['#fbffcc', '#484c1a'], // Yellow
  ['#f2ffcf', '#3e4c1a'], // Chartreuse
];
/** The names of the section tones, as shared/consistency-vocabulary.ts lists them. */
export const TONES = ['paper', 'cream', 'dark', 'accent', 'highlight', 'band', 'pastel-1', 'pastel-2', 'pastel-3', 'pastel-4', 'pastel-5', 'pastel-6'];

/** The ink that reads on a surface: the library's text where it reaches 4.5:1, else its paper, else the slate or white. */
const inkOn = (surface, candidates) => candidates.find(ink => contrast(ink, surface) >= 4.5) ?? candidates.reduce((best, ink) => (contrast(ink, surface) > contrast(best, surface) ? ink : best));
const inkPair = (lib, surface) => [0, 1].map(i => inkOn(surface[i], [lib.text[i], lib.paper[i], '#1e1e1e', '#ffffff']));

/** A library's section tones, each `[surface, ink]` with `[light, dark]` values, by tone name. */
export function sectionTones(lib) {
  const cream = lib.cream ?? lib.fill;
  const highlight = lib.highlight ?? cream;
  const pastels = lib.pastels ?? PASTELS;
  if (pastels.length !== 6) throw new Error(`${lib.name}: six pastels, not ${pastels.length}`);
  return {
    paper: [lib.paper, lib.text],
    cream: [cream, inkPair(lib, cream)],
    dark: [lib.text, lib.paper],
    accent: [lib.accent, lib.onAccent],
    highlight: [highlight, inkPair(lib, highlight)],
    band: lib.band ? [lib.band, lib.bandInk ?? inkPair(lib, lib.band)] : [lib.text, lib.paper],
    ...Object.fromEntries(pastels.map((pastel, i) => [`pastel-${i + 1}`, [pastel, inkPair(lib, pastel)]])),
  };
}

// Tally's own roles, for a price list: its bands, its type, its package cards and its lists. The
// faces are corrected to the sixteen, which draws Funnel 1.05 times its size, so a size here is that
// much under the size it is seen at (16px reads as 17). The large roles follow the window on a phone
// and the rest take the device scale, none falling under its size on a computer.
const TALLY_RULES = `
/* One mode: white paper and night bands, whatever the reader's system says. */
html {
  color-scheme: light !important;
}

/* A band: a stretch of the page in a colour of its own. */
[data-band="night"] {
  --ds-paper: #0e0f11;
  --background: #0e0f11;
  --ds-text-color: #f4f4f2;
  --text-color: #f4f4f2;
  --ds-text-color-muted: #9ea2a9;
  --ds-title-color: #9ea2a9;
  --ds-border-color: #2e3036;
  --ds-fill: #1d1f23;
  --ds-fill-hover: #2a2c31;
  --ds-accent-color: #f4f4f2;
  --ds-button-primary-fill: #f4f4f2;
  --ds-button-primary-text: #0e0f11;
  --ds-button-text-color-on-accent: #0e0f11;
  --ds-button-secondary-fill: #1d1f23;
  --ds-button-background-color-secondary: #1d1f23;
  --ds-button-text-color: #f4f4f2;
  --ds-footer-line: #2e3036;
  background: #0e0f11;
  color: #f4f4f2;
}
[data-band="quiet"] {
  background: var(--ds-fill);
}

/* The site header on a band: its paper is the band's, its links at the row's end. */
ds-header[data-links="end"] {
  --ds-header-paper: transparent;
}
ds-header[data-links="end"]::part(header) {
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  gap: calc(1.5 * var(--ds-unit));
}
ds-header[data-links="end"]::part(nav) {
  justify-content: flex-end;
  gap: calc(1.5 * var(--ds-unit));
}
ds-header[data-links="end"] ds-button[slot="actions"]::part(control) {
  padding: 0;
  background: transparent;
  color: inherit;
  font-weight: 600;
}
[data-wordmark] {
  display: block;
  color: inherit;
  font-family: var(--ds-typeface-medium);
  font-size: calc(20px * var(--ds-sf, 1));
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: var(--ds-unit);
  text-decoration: none;
}
[data-wordmark] b {
  font-weight: 700;
}

/* Type. */
ds-text[data-type] {
  display: block;
  height: auto;
  min-height: 0;
  overflow: visible;
  white-space: normal;
  letter-spacing: 0;
}
ds-text:is([data-type="hero"], [data-type="display"], [data-type="closing"], [data-type="price"], [data-type="fee"], [data-type="title"], [data-type="name"], [data-type="subhead"], [data-type="question"]) {
  font-family: var(--ds-typeface-medium);
  font-weight: 600;
}
ds-text[data-type="hero"] {
  font-size: min(106px, 11.8vw);
  line-height: 0.98;
  letter-spacing: -0.04em;
}
ds-text[data-type="display"] {
  font-size: min(99px, 11.2vw);
  line-height: 1;
  letter-spacing: -0.03em;
}
ds-text[data-type="closing"] {
  font-size: min(68px, 11vw);
  line-height: 1.04;
  letter-spacing: -0.03em;
}
ds-text[data-type="price"] {
  font-size: clamp(46px, 12.4vw, 57px);
  line-height: 1;
  letter-spacing: -0.04em;
}
ds-text[data-type="fee"] {
  font-size: calc(30px * var(--ds-sf, 1));
  line-height: calc(32px * var(--ds-sf, 1));
  letter-spacing: -0.03em;
}
ds-text[data-type="title"] {
  font-size: calc(25px * var(--ds-sf, 1));
  line-height: calc(28px * var(--ds-sf, 1));
  letter-spacing: -0.03em;
}
ds-text[data-type="name"] {
  font-size: calc(21px * var(--ds-sf, 1));
  line-height: calc(24px * var(--ds-sf, 1));
  letter-spacing: -0.03em;
}
ds-text[data-type="name"][data-heavy] {
  font-weight: 800;
}
ds-text[data-type="subhead"] {
  font-size: calc(19px * var(--ds-sf, 1));
  line-height: calc(24px * var(--ds-sf, 1));
  letter-spacing: -0.02em;
}
ds-text[data-type="question"] {
  font-size: calc(27px * var(--ds-sf, 1));
  line-height: calc(32px * var(--ds-sf, 1));
  letter-spacing: -0.02em;
}
ds-text[data-type="body"] {
  font-size: calc(16px * var(--ds-sf, 1));
  line-height: calc(24px * var(--ds-sf, 1));
}
ds-text[data-type="small"] {
  font-size: calc(13px * var(--ds-sf, 1));
  line-height: calc(20px * var(--ds-sf, 1));
}
ds-text[data-type="small"][strong] {
  font-family: var(--ds-typeface-regular);
}

/* A package: padded a square and a half, its colours the card's own. */
ds-card[data-plan] {
  --ds-card-padding-override: calc(1.5 * var(--ds-unit));
  --ds-text-color: var(--ds-card-ink-override);
  --ds-text-color-muted: var(--ds-card-muted-override);
  --ds-title-color: var(--ds-card-muted-override);
  --ds-border-color: var(--plan-line);
}
/* The writing fills the card, so what ends a package can stand on its foot. */
ds-card[data-plan]::part(body) {
  display: flex;
  flex: 1;
  flex-direction: column;
}
ds-card[data-plan="night"] {
  --ds-card-fill-override: #1d1f23;
  --ds-card-ink-override: #f4f4f2;
  --ds-card-muted-override: #9ea2a9;
  --plan-line: #3a3c42;
}
ds-card[data-plan="paper"] {
  --ds-card-fill-override: #ffffff;
  --ds-card-ink-override: #0e0f11;
  --ds-card-muted-override: #5b5e64;
  --plan-line: #dddddb;
  --ds-accent-color: #0e0f11;
  --ds-button-primary-fill: #0e0f11;
  --ds-button-primary-text: #ffffff;
  --ds-button-text-color-on-accent: #ffffff;
}
ds-card[data-plan="accent"] {
  --ds-card-fill-override: #34b36e;
  --ds-card-ink-override: #0e0f11;
  --ds-card-muted-override: #163024;
  --plan-line: #1f7d4b;
  --ds-accent-color: #0e0f11;
  --ds-button-primary-fill: #0e0f11;
  --ds-button-primary-text: #ffffff;
  --ds-button-text-color-on-accent: #ffffff;
}
ds-card[data-plan="sheet"] {
  --ds-card-padding-override: var(--ds-unit);
  --ds-card-corner-size: 6px;
  --ds-card-fill-override: #ffffff;
  --ds-card-ink-override: #0e0f11;
  --ds-card-muted-override: #5b5e64;
  --plan-line: #dddddb;
}

/* A list of what is included: dots, or rules between the rows with data-list="rules". */
ul[data-list] {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ds-text-color-muted);
  font-family: var(--ds-typeface-regular);
  font-size: calc(15px * var(--ds-sf, 1));
  line-height: calc(24px * var(--ds-sf, 1));
}
ul[data-list="dots"] > li {
  position: relative;
  padding-block: calc(3px * var(--ds-sf, 1));
  padding-inline-start: calc(16px * var(--ds-sf, 1));
}
ul[data-list="dots"] > li::before {
  content: "";
  position: absolute;
  inset-block-start: calc(13px * var(--ds-sf, 1));
  inset-inline-start: 0;
  width: calc(4px * var(--ds-sf, 1));
  height: calc(4px * var(--ds-sf, 1));
  border-radius: 50%;
  background: currentColor;
}
ul[data-list="dots"] > li[data-strong] {
  color: var(--ds-text-color);
  font-weight: 600;
}
ul[data-list="rules"] > li {
  padding-block: calc(8px * var(--ds-sf, 1)) calc(7px * var(--ds-sf, 1));
  border-block-start: 1px solid var(--ds-border-color);
}

/* A large button says its words in the middle of whatever width it is given. */
ds-button[data-size="large"] {
  --ds-button-text-size: 16px;
}
ds-button[data-size="large"]::part(control) {
  justify-content: center;
  font-weight: 600;
  text-align: center;
}

/* A question: a large accordion on a rule, its plus at the end. */
ds-accordion[data-size="large"] {
  --ds-accordion-width: 100%;
  --ds-title-color: var(--ds-text-color);
  border-block-end: 1px solid var(--ds-border-color);
}
ds-accordion[data-size="large"]::part(summary) {
  padding-block: calc(19px * var(--ds-sf, 1));
  border-radius: 0;
}
ds-accordion[data-size="large"]::part(row) {
  align-items: center;
}
ds-accordion[data-size="large"]::part(details) {
  max-width: calc(27 * var(--ds-unit));
  padding-block-end: var(--ds-unit);
}

/* Japanese: Funnel draws the Latin and the figures, the reader's own Japanese faces the rest, so
   nothing heavy loads. Kana and kanji take open lines and no tracking, and lines break at phrases. */
:lang(ja) {
  --ds-typeface-regular: "Inter Arrows", "Funnel Sans", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif;
  --ds-typeface-medium: "Inter Arrows", "Funnel Display", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif;
}
ds-text[data-type]:lang(ja) {
  letter-spacing: 0;
  line-break: strict;
  word-break: auto-phrase;
}
ds-text:is([data-type="hero"], [data-type="display"], [data-type="closing"]):lang(ja) {
  letter-spacing: -0.03em;
  line-height: 1.16;
}
ds-text[data-type="price"]:lang(ja) {
  font-size: clamp(40px, 4.6vw, 47px);
  letter-spacing: -0.03em;
  white-space: nowrap;
}
ds-text[data-type="body"]:lang(ja), ul[data-list]:lang(ja) {
  line-height: 1.75;
}
ul[data-list]:lang(ja) {
  line-break: strict;
  word-break: auto-phrase;
}

@media (max-width: 600px) {
  ds-button[data-size="large"] { --ds-button-text-size: 12px; }
  ds-text[data-type="price"]:lang(ja) { font-size: 12.4vw; }
  ds-text[data-type="fee"] { font-size: max(30px, calc(22px * var(--ds-sf, 1))); line-height: max(32px, calc(24px * var(--ds-sf, 1))); }
  ds-text[data-type="title"] { font-size: max(25px, calc(18px * var(--ds-sf, 1))); line-height: max(28px, calc(20px * var(--ds-sf, 1))); }
  ds-text[data-type="name"] { font-size: max(21px, calc(16px * var(--ds-sf, 1))); line-height: max(24px, calc(18px * var(--ds-sf, 1))); }
  ds-text[data-type="subhead"] { font-size: max(19px, calc(14px * var(--ds-sf, 1))); line-height: max(24px, calc(18px * var(--ds-sf, 1))); }
  ds-text[data-type="question"] { font-size: max(19px, calc(14px * var(--ds-sf, 1))); line-height: max(24px, calc(18px * var(--ds-sf, 1))); }
  ds-text[data-type="body"] { font-size: max(16px, calc(12px * var(--ds-sf, 1))); line-height: max(24px, calc(18px * var(--ds-sf, 1))); }
  ds-text[data-type="small"] { font-size: max(13px, calc(10px * var(--ds-sf, 1))); line-height: max(20px, calc(15px * var(--ds-sf, 1))); }
  ul[data-list] { font-size: max(15px, calc(11px * var(--ds-sf, 1))); line-height: max(24px, calc(18px * var(--ds-sf, 1))); }
}
`;

// Each value is [light, dark].
export const LIBRARIES = {
  slate: {
    name: 'Slate', note: 'A dark issue workspace on a 10px unit, with readable 14px text and 30px control rows.',
    paper: ['#101112', '#101112'], text: ['#bfc2c8', '#bfc2c8'], muted: ['#8a8e95', '#8a8e95'],
    fill: ['#18191b', '#18191b'], hover: ['#222426', '#222426'], border: ['#292b2e', '#292b2e'], input: ['#18191b', '#18191b'],
    accent: ['#8589eb', '#8589eb'], onAccent: ['#101112', '#101112'], focus: ['#8589eb', '#8589eb'],
    chart: ['#8589eb', '#8589eb'], chartInk: ['#101112', '#101112'],
    corner: '4px', inset: '10px', card: '4px',
    componentRules: 'ds-text { --ds-1: 20px; --ds-control-size: 20px; }\nds-select { --ds-1: 20px; }',
    metrics: { '--ds-1': '10px', '--ds-row-size': '30px', '--ds-control-size': '26px', '--ds-text-leading': '20px', '--ds-small-text-size': '12px', '--ds-card-text-inset-min': '10px', '--ds-icon-size': '16px', '--slate-icon-color': '#737780', '--slate-milestone-color': '#6871d8', '--ds-warning-color': '#d9b900', '--ds-success-color': '#4ea56a', '--ds-danger-color': '#df626b', '--button-text-color': 'var(--ds-text-color)', '--button-color': 'var(--ds-text-color)', '--ds-input-height': 'calc(26px * var(--ds-sf))' },
  },
  lagoon: {
    name: 'Lagoon', note: 'Hysteric blue water and Sharp blue, every control a pill and soft pictures.',
    paper: ['#cdf2fe', '#1b3f4b'], text: ['#0d2c38', '#e3f7fe'], muted: ['#2f5868', '#a9d5e4'],
    fill: ['#b0e7f9', '#24505f'], hover: ['#a3e1f6', '#2a5868'], border: ['#93d6ec', '#2e5a69'], input: ['#e4f8ff', '#173743'],
    accent: ['#594dff', '#69d8fb'], onAccent: ['#ffffff', '#0d2c38'], focus: ['#594dff', '#69d8fb'],
    chart: ['#594dff', '#69d8fb'], chartInk: ['#ffffff', '#0d2c38'],
    corner: '8px', inset: '5px', card: '16px', pill: true,
  },
  bloom: {
    name: 'Bloom', note: 'Pink paper and Tuned red, with round cards.',
    paper: ['#fad1e6', '#471f34'], text: ['#3a0f26', '#fde6f2'], muted: ['#6e3a55', '#e0aac6'],
    fill: ['#f5bad8', '#5a2a43'], hover: ['#f2acd0', '#63304b'], border: ['#eaa0c6', '#6a3550'], input: ['#fde6f2', '#3d1a2d'],
    accent: ['#ff5f5f', '#ff5f5f'], onAccent: ['#3a0f26', '#3a0f26'], focus: ['#3a0f26', '#ff5f5f'],
    chart: ['#ff5f5f', '#ff5f5f'], chartInk: ['#3a0f26', '#3a0f26'],
    corner: '4px', inset: '2.5px', card: '12px',
  },
  grove: {
    name: 'Grove', note: 'Comfortable green paper and Metal green, every corner square.',
    paper: ['#f2ffcf', '#26300f'], text: ['#17260a', '#effcd2'], muted: ['#4a5a32', '#bccb9a'],
    fill: ['#e2f5b0', '#34411a'], hover: ['#d8ef9c', '#3c4a1f'], border: ['#c9e08a', '#455523'], input: ['#f8ffe4', '#1f280c'],
    accent: ['#026d5b', '#04cfad'], onAccent: ['#ffffff', '#0b221d'], focus: ['#026d5b', '#04cfad'],
    chart: ['#026d5b', '#04cfad'], chartInk: ['#ffffff', '#0b221d'],
    corner: '0px', inset: '0.5px', card: '0px',
  },
  signal: {
    name: 'Signal', note: 'Code type throughout, Egg paper and Drip yellow.',
    paper: ['#f9f6ef', '#1e1e1e'], text: ['#1e1e1e', '#f9f6ef'], muted: ['#5c5647', '#b8b2a2'],
    fill: ['#ece6d6', '#2c2b27'], hover: ['#e3dcc8', '#35332d'], border: ['#d9d1bb', '#3b3932'], input: ['#fffdf7', '#262521'],
    accent: ['#fde70c', '#fde70c'], onAccent: ['#1e1e1e', '#1e1e1e'], focus: ['#594dff', '#fde70c'],
    chart: ['#979441', '#fde70c'], chartInk: ['#1e1e1e', '#1e1e1e'],
    corner: '2px', inset: '2.5px', card: '2px', typeface: mono, tracking: '0px',
  },
  graphite: {
    name: 'Graphite', note: 'White paper and Sharp blue, pill buttons and big rounded tiles.',
    paper: ['#ffffff', '#141414'], text: ['#1e1e1e', '#f5f5f5'], muted: ['#5f5f5f', '#b3b3b3'],
    fill: ['#f2f2f2', '#262626'], hover: ['#e8e8e8', '#303030'], border: ['#e2e2e2', '#363636'], input: ['#f2f2f2', '#1f1f1f'],
    accent: ['#594dff', '#594dff'], onAccent: ['#ffffff', '#ffffff'], focus: ['#594dff', '#ccccff'],
    chart: ['#594dff', '#ccccff'], chartInk: ['#ffffff', '#1e1e1e'],
    corner: '8px', inset: '5px', card: '20px', pill: true,
  },
  voyage: {
    name: 'Voyage', note: 'A travel brand of its own: white paper, a deep blue band, bright blue buttons and a yellow highlight.',
    paper: ['#ffffff', '#141922'], text: ['#1a1a1a', '#f2f5fa'], muted: ['#595959', '#a8b3c4'],
    fill: ['#f2f4f7', '#1f2733'], hover: ['#e8ecf2', '#28323f'], border: ['#e0e4ea', '#2f3a49'], input: ['#ffffff', '#1a212c'],
    accent: ['#0a6fe0', '#4c9bf5'], onAccent: ['#ffffff', '#0b1a2e'], focus: ['#0a6fe0', '#4c9bf5'],
    chart: ['#0a6fe0', '#4c9bf5'], chartInk: ['#ffffff', '#0b1a2e'],
    band: ['#0b3a8c', '#0b2a5e'], bandInk: ['#ffffff', '#ffffff'], highlight: ['#fdbb2d', '#fdbb2d'],
    corner: '4px', inset: '2.5px', card: '8px',
  },
  studio: {
    name: 'Studio', note: 'Black on white, for a tool people make things in: ink buttons, hairline outlines and a quiet blue-grey strip.',
    paper: ['#ffffff', '#141414'], text: ['#1e1e1e', '#f5f5f5'], muted: ['#5f5f5f', '#b3b3b3'],
    fill: ['#f2f2f2', '#262626'], hover: ['#e8e8e8', '#303030'], border: ['#dcdcdc', '#3a3a3a'], input: ['#ffffff', '#1f1f1f'],
    accent: ['#1e1e1e', '#f5f5f5'], onAccent: ['#ffffff', '#1e1e1e'], focus: ['#594dff', '#ccccff'],
    chart: ['#594dff', '#ccccff'], chartInk: ['#ffffff', '#1e1e1e'],
    band: ['#c5d0dd', '#2b3542'], bandInk: ['#1e1e1e', '#f5f5f5'], highlight: ['#fde70c', '#fde70c'],
    corner: '4px', inset: '2.5px', card: '8px',
  },
  tally: {
    name: 'Tally', note: 'A price list of its own in one mode: night bands, big Funnel headings, white and green package cards, and buttons three squares high.',
    paper: ['#ffffff', '#ffffff'], text: ['#0e0f11', '#0e0f11'], muted: ['#5b5e64', '#5b5e64'],
    fill: ['#eeeeec', '#eeeeec'], hover: ['#e4e4e2', '#e4e4e2'], border: ['#dddddb', '#dddddb'], input: ['#ffffff', '#ffffff'],
    accent: ['#0e0f11', '#0e0f11'], onAccent: ['#ffffff', '#ffffff'], focus: ['#1f7d4b', '#1f7d4b'],
    chart: ['#34b36e', '#34b36e'], chartInk: ['#0e0f11', '#0e0f11'],
    band: ['#0e0f11', '#0e0f11'], bandInk: ['#f4f4f2', '#f4f4f2'], highlight: ['#34b36e', '#34b36e'],
    corner: '6px', inset: '4px', card: '14px', tracking: '0px',
    typeface: '"Inter Arrows", "Funnel Sans", "Helvetica Neue", Arial, sans-serif',
    typefaceMedium: '"Inter Arrows", "Funnel Display", "Funnel Sans", "Helvetica Neue", Arial, sans-serif',
    metrics: { '--ds-type-weight-bold': '600' },
    // Funnel's capitals are 0.675 of the em, measured by scripts/face-metrics.mjs; both faces are variable from 300 to 800.
    faces: [['Funnel Display', 'funneldisplay/v3/B50WF7FGv37QNVWgE0ga--4Pbb6dDYs0gnHA'], ['Funnel Sans', 'funnelsans/v3/OpNIno8Dg9bX6Bsp3Wq69TpyfhjoyU7d']].map(([family, file]) => ({ family, weight: '300 800', src: `https://fonts.gstatic.com/s/${file}.woff2`, metrics: { ascent: 1, descent: 0.25, capHeight: 0.675 } })),
    sizes: { large: { squares: 3, text: 16, leading: 24, inset: 30, corner: 6, weight: 600, phone: { size: 40, text: 12, leading: 20, inset: 20, corner: 4 } } },
    componentRules: TALLY_RULES,
  },
  atelier: {
    name: 'Atelier', note: 'A design studio: near-white paper, ink buttons with soft corners, big rounded cards and sections that turn over to black.',
    paper: ['#fafafa', '#0f0f10'], text: ['#18181b', '#fafafa'], muted: ['#5c5c62', '#a6a6ad'],
    fill: ['#f0f0f1', '#1c1c1f'], hover: ['#e6e6e8', '#26262a'], border: ['#e2e2e5', '#2e2e32'], input: ['#ffffff', '#161618'],
    accent: ['#18181b', '#fafafa'], onAccent: ['#fafafa', '#18181b'], focus: ['#594dff', '#ccccff'],
    chart: ['#594dff', '#ccccff'], chartInk: ['#ffffff', '#1e1e1e'],
    band: ['#0a0a0a', '#fafafa'], bandInk: ['#fafafa', '#18181b'], highlight: ['#fde70c', '#fde70c'],
    corner: '8px', inset: '5px', card: '16px',
    // Buttons in the code face, as a studio sets its labels apart from its prose; every size, the outlined face too.
    componentRules: 'ds-button { --ds-typeface-regular: var(--ds-typeface-mono); --ds-typeface-medium: var(--ds-typeface-mono); }',
  },
  birdie: {
    name: 'Birdie', note: 'A bird guide: white paper and slate ink, ink buttons, Metal green bands and Yellow under the figures that count.',
    paper: ['#ffffff', '#101413'], text: ['#1e1e1e', '#f1f5f3'], muted: ['#5f5f5f', '#b3bab7'],
    fill: ['#eef2f0', '#1e2422'], hover: ['#e3e9e6', '#28302d'], border: ['#dde4e0', '#333c38'], input: ['#eef2f0', '#191e1c'],
    accent: ['#1e1e1e', '#f1f5f3'], onAccent: ['#ffffff', '#1e1e1e'], focus: ['#594dff', '#ccccff'],
    chart: ['#026d5b', '#04cfad'], chartInk: ['#ffffff', '#0b221d'],
    band: ['#026d5b', '#0b3d34'], bandInk: ['#ffffff', '#e8fbf6'], highlight: ['#eaff00', '#eaff00'],
    corner: '4px', inset: '5px', card: '4px',
  },
};

// Button sizes beyond the one control high: medium two squares, large three. Each face stands on
// the foot of its squares with the spare four above, as the one-control face does in one square.
const SIZES = { medium: { squares: 2, text: 16, leading: 20, inset: 12 }, large: { squares: 3, text: 24, leading: 28, inset: 20 } };
const px = value => parseFloat(value);

export function draft(lib) {
  const values = {
    '--ds-accent-color': ld(...lib.accent),
    '--ds-paper': ld(...lib.paper),
    '--ds-text-color': ld(...lib.text),
    '--ds-text-color-muted': ld(...lib.muted),
    '--ds-title-color': ld(...lib.muted),
    '--ds-border-color': ld(...lib.border),
    '--ds-fill': ld(...lib.fill),
    '--ds-fill-hover': ld(...lib.hover),
    '--ds-focus-ring': ld(...lib.focus),
    '--ds-button-text-color-on-accent': ld(...lib.onAccent),
    '--ds-input-background': ld(...lib.input),
    '--ds-input-color': ld(...lib.text),
    '--ds-input-placeholder-color': ld(...lib.muted),
    '--ds-input-disabled-color': ld(...lib.muted),
    '--ds-input-reveal-color': ld(...lib.text),
  };
  if (lib.typeface) Object.assign(values, { '--ds-typeface-regular': lib.typeface, '--ds-typeface-medium': lib.typefaceMedium ?? lib.typeface });
  let css = template.replace('the accent is Apple green.', `the accent is ${lib.name}'s own.`);
  for (const [name, value] of Object.entries(values)) {
    const pattern = new RegExp(`(\\n  ${name}:)[^;]*;`);
    if (!pattern.test(css)) throw new Error(`${lib.name}: ${name} is not in the template`);
    css = css.replace(pattern, `$1 ${value};`);
  }
  const chart = ld(...lib.chart);
  const extra = [
    `/* ${lib.name}: ${lib.note} */`,
    // A face of the library's own, corrected at its @font-face so it stands on the sixteen.
    ...(lib.faces ?? []).map(face => `@font-face { font-family: "${face.family}"; src: url("${face.src}") format("woff2"); font-weight: ${face.weight}; font-style: normal; font-display: swap; ${faceCorrection(face.metrics).replaceAll(';', '; ')}; }`),
    ':root {',
    `  --ds-corner-size: ${lib.corner};`,
    `  --ds-card-corner-size: ${lib.card};`,
    `  --ds-button-inset: ${lib.inset};`,
    // The base's primary button hooks too, so the library's accent and ink stand over the base's.
    '  --ds-button-primary-fill: var(--ds-accent-color);',
    `  --ds-button-primary-text: ${ld(...lib.onAccent)};`,
    ...Object.entries(lib.metrics ?? {}).map(([name, value]) => `  ${name}: ${value};`),
    ...(lib.tracking ? [`  --ds-text-tracking: ${lib.tracking};`] : []),
    // The page's own paper and words, which prose and the page's background read.
    '  --background: var(--ds-paper);',
    '  --dialog-background: var(--ds-paper);',
    '  --text-color: var(--ds-text-color);',
    '  --ds-tag-accent: var(--ds-accent-color);',
    '  --ds-progress-color: var(--ds-accent-color);',
    '  --accent-color: var(--ds-accent-color);',
    '  --button-background-color-primary: var(--ds-accent-color);',
    '  --button-text-color-on-light: var(--ds-button-text-color-on-accent);',
    '  --button-background-color-secondary: var(--ds-fill);',
    ...(lib.typeface ? [`  --typeface-regular: ${lib.typeface};`, `  --typeface-medium: ${lib.typefaceMedium ?? lib.typeface};`] : []),
    ...(lib.band ? [`  --brand-band: ${ld(...lib.band)};`, `  --brand-band-ink: ${ld(...lib.bandInk)};`, `  --brand-highlight: ${ld(...lib.highlight)};`] : []),
    "  /* The section tones of Consistency's native pages: a surface and the ink that reads on it. */",
    ...Object.entries(sectionTones(lib)).flatMap(([tone, [surface, ink]]) => [`  --c9y-tone-${tone}: ${ld(...surface)};`, `  --c9y-tone-${tone}-ink: ${ld(...ink)};`]),
    '}',
    '',
    "/* The canvas behind the page is the library's paper too, over the paper the theme's head script paints. */",
    'html {',
    '  background-color: var(--background) !important;',
    '}',
    '',
    "/* Charts and the heat of a month take the library's colour; they set these on themselves, so the library names them. */",
    'ds-chart, ds-bars, ds-spark, ds-ratio {',
    `  --ds-chart-up: ${chart};`,
    '  --ds-chart-live: var(--ds-chart-up);',
    '  --ds-chart-ink: var(--ds-text-color);',
    '  --ds-chart-muted: var(--ds-text-color-muted);',
    '  --ds-chart-faint: var(--ds-border-color);',
    '  --ds-chart-fill: var(--ds-fill);',
    '}',
    '',
    '/* Button sizes: data-size="medium" (two squares) and "large" (three); the default is one control in one square. */',
    ...Object.entries({ ...SIZES, ...lib.sizes }).flatMap(([size, measure]) => {
      const height = measure.squares * 20 - 4;
      const corner = lib.pill ? height / 2 : measure.corner ?? px(lib.corner) * measure.squares;
      return [
        `ds-button[data-size="${size}"] {`,
        `  --ds-control-size: ${height}px;`,
        `  --ds-text-size: ${measure.text}px;`,
        `  --ds-text-leading: ${measure.leading}px;`,
        `  --ds-button-inset: ${measure.inset}px;`,
        `  --ds-corner-size: ${corner}px;`,
        ...(measure.weight ? [`  --ds-type-weight-default: ${measure.weight};`] : []),
        '  vertical-align: bottom;',
        '}',
        '',
      ];
    }),
    '/* On a phone a large button takes the medium measures, so a call to action keeps to the screen. */',
    '@media (max-width: 600px) {',
    '  ds-button[data-size="large"] {',
    `    --ds-control-size: ${lib.sizes?.large?.phone?.size ?? SIZES.medium.squares * 20 - 4}px;`,
    `    --ds-text-size: ${lib.sizes?.large?.phone?.text ?? SIZES.medium.text}px;`,
    `    --ds-text-leading: ${lib.sizes?.large?.phone?.leading ?? SIZES.medium.leading}px;`,
    `    --ds-button-inset: ${lib.sizes?.large?.phone?.inset ?? SIZES.medium.inset}px;`,
    `    --ds-corner-size: ${lib.sizes?.large?.phone?.corner ?? (lib.pill ? (SIZES.medium.squares * 20 - 4) / 2 : px(lib.corner) * SIZES.medium.squares)}px;`,
    '  }',
    '}',
    '',
    '/* An outlined face: no fill, a hairline inside its edge, the ink for words. */',
    'ds-button[data-face="outlined"]::part(control) {',
    '  background: transparent;',
    '  color: var(--ds-text-color);',
    '  box-shadow: inset 0 0 0 1px var(--ds-border-color);',
    '  padding: 0 calc(var(--ds-button-inset, 4px) * var(--ds-sf, 1));',
    '}',
    '',
    'ds-button[data-face="outlined"]:hover::part(control) {',
    '  background: var(--ds-fill);',
    '}',
    '',
    'ds-calendar {',
    `  --ds-calendar-heat-1: color-mix(in oklab, ${chart} 20%, var(--ds-paper));`,
    `  --ds-calendar-heat-2: color-mix(in oklab, ${chart} 40%, var(--ds-paper));`,
    `  --ds-calendar-heat-3: ${chart};`,
    `  --ds-calendar-heat-4: color-mix(in oklab, ${chart} 60%, var(--ds-text-color));`,
    '  --ds-calendar-heat-ink-1: var(--ds-text-color);',
    '  --ds-calendar-heat-ink-2: var(--ds-text-color);',
    `  --ds-calendar-heat-ink-3: ${ld(...lib.chartInk)};`,
    '  --ds-calendar-heat-ink-4: var(--ds-paper);',
    '}',
    '',
  ].join('\n');
  return `${css.trimEnd()}\n\n${extra}${lib.componentRules ? `\n${lib.componentRules}\n` : ''}`;
}

/** One library's pairs that carry words and read below 4.5:1, as "<library> <scheme> <pair>: <ratio>"; the section tones among them. */
export function lowContrastOf(lib, extra = {}) {
  const low = [];
  const tones = Object.fromEntries(Object.entries(sectionTones(lib)).map(([tone, [surface, ink]]) => [`tone ${tone}`, [ink, surface]]));
  for (const [i, scheme] of ['light', 'dark'].entries()) {
    const pairs = { text: [lib.text, lib.paper], muted: [lib.muted, lib.paper], 'text on fill': [lib.text, lib.fill], 'on accent': [lib.onAccent, lib.accent], 'input text': [lib.text, lib.input], 'heat ink': [lib.chartInk, lib.chart], ...(lib.band ? { 'on band': [lib.bandInk, lib.band] } : {}), ...tones, ...extra };
    for (const [what, [a, b]] of Object.entries(pairs)) {
      const ratio = contrast(a[i], b[i]);
      if (ratio < 4.5) low.push(`${lib.name} ${scheme} ${what}: ${ratio.toFixed(2)}`);
    }
  }
  return low;
}

/** The pairs of every example library that read below 4.5:1. */
export const lowContrast = () => Object.values(LIBRARIES).flatMap(lib => lowContrastOf(lib));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2];
  if (!out) throw new Error('Name the folder to write the drafts into.');
  const low = lowContrast();
  if (low.length) throw new Error(`Below 4.5:1:\n${low.join('\n')}`);
  mkdirSync(out, { recursive: true });
  for (const [id, lib] of Object.entries(LIBRARIES)) {
    const css = draft(lib);
    writeFileSync(join(out, `${id}.css`), css);
    if (process.argv[3] === '--requests') writeFileSync(join(out, `${id}.json`), JSON.stringify({ name: lib.name, css, config: JSON.stringify({ schema: 2 }), templateVersion: `${version}+${revision}` }));
  }
  console.log(`Wrote ${Object.keys(LIBRARIES).length} drafts to ${out}`);
}
