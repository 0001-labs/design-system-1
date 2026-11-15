import type { LayoutExample } from './layout-examples';

// Workbenches: the examples that are whole tools rather than pages. Each fills a computer's window
// edge to edge, drawn Desktop aligned: the window is a whole number of squares wide and the
// height's leftover sits above it, so every pane, row and grid line ends on a square.

// Multitrack: an arrangement of loops on tracks, one beat a square at the middle zoom, with a
// transport, a loop browser, a mixer and the selected clip's inspector. It plays without sound,
// apart from an optional metronome made in the page; nothing is loaded or sent.

const tracks = [
  { id: 'drums', name: 'Drums', kind: 'audio', tone: 'var(--ds-orange)', vol: -3, pan: 0 },
  { id: 'bass', name: 'Bass', kind: 'midi', tone: 'var(--ds-apple-green)', vol: -6, pan: 0 },
  { id: 'keys', name: 'Keys', kind: 'audio', tone: 'var(--ds-sharp-blue)', vol: -8, pan: -20 },
  { id: 'pad', name: 'Pad', kind: 'audio', tone: 'var(--ds-pink)', vol: -12, pan: 20 },
  { id: 'vocal', name: 'Vocal', kind: 'audio', tone: 'var(--ds-yellow)', vol: -4, pan: 0, arm: true },
  { id: 'perc', name: 'Percussion', kind: 'midi', tone: 'var(--ds-tuned-red)', vol: -10, pan: 30 },
  { id: 'fx', name: 'Effects', kind: 'audio', tone: 'var(--one-purple)', vol: -14, pan: 0 },
];

// The loop library: [name, folder, kind, beats, key, shape].
const library = [
  ['Breaks 01', 'Drums', 'audio', 4, '—', 'drum'], ['Breaks 02', 'Drums', 'audio', 8, '—', 'drum'],
  ['Brush kit', 'Drums', 'audio', 4, '—', 'drum'], ['Four floor', 'Drums', 'audio', 4, '—', 'drum'],
  ['Half time', 'Drums', 'audio', 8, '—', 'drum'], ['Rimshot shuffle', 'Drums', 'audio', 4, '—', 'drum'],
  ['Sub walk', 'Bass', 'midi', 8, 'A minor', 'bassline'], ['Octave pump', 'Bass', 'midi', 4, 'A minor', 'bassline'],
  ['Rubber line', 'Bass', 'midi', 8, 'C major', 'bassline'], ['Low drone', 'Bass', 'audio', 16, 'A', 'pad'],
  ['Electric chords', 'Keys', 'audio', 16, 'A minor', 'keys'], ['Felt piano', 'Keys', 'audio', 16, 'C major', 'keys'],
  ['Organ stabs', 'Keys', 'audio', 4, 'A minor', 'keys'], ['Arp up', 'Keys', 'midi', 4, 'A minor', 'bassline'],
  ['Night air', 'Pads', 'audio', 16, 'A minor', 'pad'], ['Glass pad', 'Pads', 'audio', 16, 'E minor', 'pad'],
  ['Tape swell', 'Pads', 'audio', 8, 'A', 'pad'],
  ['Hum phrase', 'Vocals', 'audio', 16, 'A minor', 'vox'], ['Ooh stack', 'Vocals', 'audio', 8, 'A minor', 'vox'],
  ['Spoken line', 'Vocals', 'audio', 8, '—', 'vox'],
  ['Shaker 16ths', 'Percussion', 'midi', 4, '—', 'perc'], ['Clap and snap', 'Percussion', 'midi', 4, '—', 'perc'],
  ['Conga run', 'Percussion', 'midi', 8, '—', 'perc'],
  ['Riser 8', 'Effects', 'audio', 32, '—', 'rise'], ['Downlifter', 'Effects', 'audio', 16, '—', 'fall'],
  ['Vinyl dust', 'Effects', 'audio', 16, '—', 'dust'],
].map(([name, folder, kind, beats, key, shape], index) => ({ name, folder, kind, beats, key, shape, seed: 7 + index * 13 }));

// The song's opening arrangement: [track, source, start beat, length in beats].
const clips = [
  ['drums', 'Breaks 01', 16, 32], ['drums', 'Four floor', 64, 32], ['drums', 'Half time', 96, 16],
  ['bass', 'Sub walk', 16, 48], ['bass', 'Octave pump', 64, 32],
  ['keys', 'Electric chords', 0, 48], ['keys', 'Felt piano', 96, 32],
  ['pad', 'Night air', 0, 32], ['pad', 'Glass pad', 64, 64],
  ['vocal', 'Hum phrase', 32, 16], ['vocal', 'Ooh stack', 80, 16],
  ['perc', 'Shaker 16ths', 48, 16], ['perc', 'Clap and snap', 64, 32],
  ['fx', 'Vinyl dust', 0, 16], ['fx', 'Riser 8', 32, 32], ['fx', 'Downlifter', 96, 16],
].map(([track, source, start, len], index) => ({ id: `c${index + 1}`, track, source, start, len, gain: 0, pitch: 0 }));

const markers = [[0, 'Intro'], [16, 'Verse'], [48, 'Build'], [64, 'Drop'], [96, 'Break'], [112, 'Outro']];

export const MULTITRACK_EXAMPLE: LayoutExample = {
  name: 'Multitrack',
  use: 'A workbench that fills the window: tracks of looping clips on a beat grid of whole squares, with a transport, a loop browser, a mixer and an inspector.',
  height: 760,
  html: `<style>
.wb { --u:var(--ds-unit); --zoom:1; --b:calc(var(--zoom) * var(--u)); --song:128; --head:calc(13 * var(--u)); --lane:calc(3 * var(--u)); --pos:0; --ls:64; --le:96;
  --line:color-mix(in oklab, var(--ds-border-color) 70%, transparent); --bar-line:var(--ds-border-color); --hair:1px solid var(--ds-border-color);
  display:grid;
  --top:var(--ds-grid-top, 0px); margin-top:calc(-1 * var(--top)); grid-template-rows:calc(2 * var(--u) + var(--top)) minmax(calc(8 * var(--u)), 1fr) calc(2 * var(--u)) calc(12 * var(--u));
  height:calc(var(--ds-grid-rows, 0) * var(--ds-grid-unit, var(--u)) + var(--top)); min-height:100%; box-sizing:border-box; overflow:hidden;
  background:var(--ds-paper); color:var(--ds-text-color); font-size:var(--ds-type-size-default); line-height:var(--u); }
.wb *, .wb *::before, .wb *::after { box-sizing:border-box; }
.wb [hidden] { display:none !important; }
.wb button { font:inherit; color:inherit; }
.wb :focus-visible { outline:2px solid var(--ds-focus-ring); outline-offset:-2px; }
.wb-mono { font-family:var(--ds-typeface-mono); font-variant-numeric:tabular-nums; }

/* The bar and the transport: two squares high, their controls on the middle line. The bar also
   takes the height's leftover above its squares, so the workbench meets the window's top edge. */
.wb-bar, .wb-transport { display:flex; align-items:center; gap:var(--u); min-width:0; padding-inline:var(--u); }
.wb-bar { padding-top:var(--top); border-bottom:var(--hair); }
.wb-brand { display:flex; align-items:center; gap:calc(var(--u) / 2); }
.wb-brand ds-icon { color:var(--ds-accent-color); }
.wb-bar .wb-end, .wb-transport .wb-end { margin-left:auto; display:flex; align-items:center; gap:var(--u); }
.wb-transport { border-block:var(--hair); background:var(--ds-fill); }
.wb-clock { display:flex; gap:calc(var(--u) / 2); }
.wb-clock span { min-width:calc(6 * var(--u)); height:var(--u); padding-inline:calc(var(--u) / 4); line-height:var(--u); background:var(--ds-paper); box-shadow:inset 0 0 0 1px var(--ds-border-color); text-align:center; }
.wb-clock span + span { min-width:calc(4 * var(--u)); }
.wb-rec-dot { width:calc(10px * var(--ds-sf)); height:calc(10px * var(--ds-sf)); border-radius:50%; background:var(--ds-danger-color); display:block; }
#wb-rec[active] .wb-rec-dot { box-shadow:0 0 0 calc(3px * var(--ds-sf)) color-mix(in srgb, var(--ds-danger-color) 30%, transparent); }
.wb-playing #wb-rec[active] .wb-rec-dot { animation:wb-blink 1s steps(2) infinite; }
@keyframes wb-blink { 50% { opacity:.35; } }
@media (prefers-reduced-motion:reduce) { .wb-playing #wb-rec[active] .wb-rec-dot { animation:none; } }

/* The arrangement: track heads stay on the left and the ruler on top while the lanes scroll under them. */
.wb-arrange { position:relative; overflow:auto; display:grid; grid-template-columns:var(--head) max-content; grid-auto-rows:var(--lane); grid-template-rows:calc(2 * var(--u)); align-content:start; overscroll-behavior:contain; }
.wb-corner { position:sticky; top:0; left:0; z-index:4; display:flex; align-items:center; justify-content:space-between; padding-inline:var(--u); background:var(--ds-paper); border-right:var(--hair); border-bottom:var(--hair); }
.wb-ruler { position:sticky; top:0; z-index:3; width:calc(var(--song) * var(--b)); background:var(--ds-paper); border-bottom:var(--hair); cursor:text; touch-action:none; user-select:none; }
.wb-markers, .wb-bars { position:relative; height:var(--u); }
.wb-markers button { position:absolute; top:0; left:calc(var(--at) * var(--b)); height:var(--u); padding:0 calc(var(--u) / 4); border:0; border-left:2px solid var(--ds-text-color); background:color-mix(in oklab, var(--ds-text-color) 8%, transparent); font-size:var(--ds-type-size-small); white-space:nowrap; cursor:pointer; }
.wb-bars { background:repeating-linear-gradient(to right, var(--bar-line) 0 1px, transparent 1px calc(4 * var(--b))) bottom / 100% 50% no-repeat, repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px var(--b)) bottom / 100% 25% no-repeat; }
.wb-bars span { position:absolute; top:0; left:calc(var(--at) * var(--b)); padding-left:calc(3px * var(--ds-sf)); font-size:var(--ds-type-size-small); line-height:calc(14px * var(--ds-sf)); color:var(--ds-text-color-muted); pointer-events:none; }
.wb[data-zoom="0.5"] .wb-bars span:nth-of-type(even) { visibility:hidden; }
.wb-loop { position:absolute; inset-block:0; left:calc(var(--ls) * var(--b)); width:calc((var(--le) - var(--ls)) * var(--b)); background:color-mix(in srgb, var(--ds-accent-color) 35%, transparent); border-inline:2px solid var(--ds-accent-color); pointer-events:none; }
.wb:not([data-loop]) .wb-loop { background:color-mix(in oklab, var(--ds-text-color) 10%, transparent); border-color:var(--ds-border-color); }
.wb-cursor { position:absolute; top:0; bottom:0; left:calc(var(--pos) * var(--b)); width:0; pointer-events:none; }
.wb-cursor::before { content:''; position:absolute; bottom:0; left:calc(-5px * var(--ds-sf)); border:calc(5px * var(--ds-sf)) solid transparent; border-top:calc(7px * var(--ds-sf)) solid var(--ds-text-color); border-bottom:0; }
.wb-cursor::after { content:''; position:absolute; top:0; bottom:0; left:0; width:1px; background:var(--ds-text-color); }

.wb-head { position:sticky; left:0; z-index:2; display:grid; grid-template-rows:repeat(3, var(--u)); grid-template-columns:calc(var(--u) / 4) var(--u) minmax(0, 1fr) repeat(3, var(--u)); padding-right:calc(var(--u) / 2); background:var(--ds-paper); border-right:var(--hair); border-bottom:var(--hair); }
.wb-head::before { content:''; grid-row:1 / -1; grid-column:1; background:var(--tone); }
.wb-head[data-selected] { background:color-mix(in oklab, var(--tone) 12%, var(--ds-paper)); }
.wb-head-num { grid-row:1; grid-column:2; text-align:center; color:var(--ds-text-color-muted); font-size:var(--ds-type-size-small); }
.wb-head-name { grid-row:1; grid-column:3; min-width:0; padding:0 calc(var(--u) / 4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border:0; background:none; text-align:left; cursor:pointer; }
.wb-toggle { grid-row:1; width:var(--u); height:var(--u); padding:0; border:0; background:none; font-size:var(--ds-type-size-small); line-height:var(--u); color:var(--ds-text-color-muted); cursor:pointer; box-shadow:inset 0 0 0 1px var(--ds-border-color); }
.wb-toggle:hover { color:var(--ds-text-color); }
.wb-toggle[aria-pressed="true"][data-act="mute"] { background:var(--ds-yellow); color:#000; }
.wb-toggle[aria-pressed="true"][data-act="solo"] { background:var(--ds-sharp-blue); color:#fff; }
.wb-toggle[aria-pressed="true"][data-act="arm"] { background:var(--ds-danger-color); color:#fff; }
.wb-head-mix { grid-row:2; grid-column:2 / -1; display:flex; gap:var(--u); }
.wb-head-mix ds-number { flex:none; }
.wb-head-meta { grid-row:3; grid-column:2 / -1; display:flex; align-items:center; gap:calc(var(--u) / 2); font-size:var(--ds-type-size-small); color:var(--ds-text-color-muted); }
.wb-head-meta span { flex:none; width:calc(2 * var(--u)); }
.wb-meter { position:relative; flex:1; height:calc(6px * var(--ds-sf)); background:color-mix(in oklab, var(--ds-text-color) 10%, transparent); overflow:hidden; }
.wb-meter i, .wb-vu i { position:absolute; inset:0; transition:transform .08s linear; }
.wb-meter i { background:linear-gradient(to right, var(--ds-apple-green) 0 70%, var(--ds-yellow) 70% 88%, var(--ds-tuned-red) 88%); transform-origin:left; transform:scaleX(var(--level, 0)); }

.wb-lane { position:relative; width:calc(var(--song) * var(--b)); border-bottom:var(--hair); background:repeating-linear-gradient(to right, var(--bar-line) 0 1px, transparent 1px calc(4 * var(--b))), repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px var(--b)); }
.wb-lane::before { content:''; position:absolute; inset-block:0; left:calc(var(--ls) * var(--b)); width:calc((var(--le) - var(--ls)) * var(--b)); background:color-mix(in srgb, var(--ds-accent-color) 9%, transparent); pointer-events:none; }
.wb:not([data-loop]) .wb-lane::before { display:none; }
.wb-lane::after { content:''; position:absolute; inset-block:0; left:calc(var(--pos) * var(--b)); width:1px; background:var(--ds-text-color); z-index:2; pointer-events:none; }
.wb-lane[data-drop] { box-shadow:inset 0 0 0 2px var(--ds-focus-ring); }

.wb-clip { position:absolute; top:0; left:calc(var(--start) * var(--b)); width:calc(var(--len) * var(--b)); height:calc(var(--lane) - 1px); display:grid; grid-template-rows:calc(16px * var(--ds-sf)) minmax(0, 1fr); padding:0; border:0; border-left:2px solid var(--tone); text-align:left; overflow:hidden; cursor:grab; touch-action:none; user-select:none;
  background:repeating-linear-gradient(to right, transparent 0 calc(var(--loop) * var(--b) - 1px), color-mix(in oklab, var(--tone) 60%, var(--ds-text-color)) calc(var(--loop) * var(--b) - 1px) calc(var(--loop) * var(--b))), color-mix(in oklab, var(--tone) 22%, var(--ds-paper)); }
.wb-clip::after { content:''; position:absolute; top:0; right:0; bottom:0; width:calc(6px * var(--ds-sf)); cursor:ew-resize; }
.wb-clip-name { padding-inline:calc(4px * var(--ds-sf)); font-size:var(--ds-type-size-small); line-height:calc(16px * var(--ds-sf)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; background:color-mix(in oklab, var(--tone) 45%, var(--ds-paper)); }
.wb-clip svg { display:block; width:100%; height:100%; }
.wb-clip path, .wb-preview path { fill:color-mix(in oklab, var(--tone) 55%, var(--ds-text-color)); }
.wb-clip rect, .wb-preview rect { fill:color-mix(in oklab, var(--tone) 50%, var(--ds-text-color)); }
.wb-clip[aria-pressed="true"] { outline:2px solid var(--ds-focus-ring); outline-offset:-2px; z-index:1; }
.wb-clip.wb-moving { cursor:grabbing; opacity:.85; z-index:3; }
.wb-lane[data-muted] .wb-clip, .wb-lane[data-silent] .wb-clip { filter:grayscale(1); opacity:.5; }
.wb-ghost, .wb-take { position:absolute; top:0; height:calc(var(--lane) - 1px); left:calc(var(--start) * var(--b)); width:calc(var(--len) * var(--b)); pointer-events:none; }
.wb-ghost { border:2px dashed var(--ds-focus-ring); background:color-mix(in srgb, var(--ds-focus-ring) 12%, transparent); }
.wb-take { background:color-mix(in srgb, var(--ds-danger-color) 30%, transparent); border-left:2px solid var(--ds-danger-color); }

/* The dock: a browser, a mixer and an inspector, side by side on a wide window. */
.wb-dock { display:grid; grid-template-columns:calc(24 * var(--u)) minmax(0, 1fr) calc(20 * var(--u)); grid-template-rows:minmax(0, 1fr); min-height:0; }
.wb-docktabs { display:none; }
.wb-pane { display:grid; grid-template-rows:calc(2 * var(--u)) minmax(0, 1fr); min-width:0; min-height:0; }
.wb-pane + .wb-pane { box-shadow:inset 1px 0 var(--ds-border-color); }
.wb-pane-head { display:flex; align-items:center; gap:var(--u); padding-inline:var(--u); border-bottom:var(--hair); min-width:0; }
.wb-pane-head .wb-end { margin-left:auto; display:flex; align-items:center; gap:var(--u); min-width:0; }
.wb-pane-body { overflow:auto; min-height:0; }

.wb-browser-body { display:grid; grid-template-columns:calc(8 * var(--u)) minmax(0, 1fr); overflow:hidden; }
.wb-folders { display:flex; flex-direction:column; padding-block:calc(var(--u) / 2); border-right:var(--hair); overflow:auto; }
.wb-folders button, .wb-file { display:flex; align-items:center; gap:calc(var(--u) / 2); min-height:var(--u); padding:0 calc(var(--u) / 2); border:0; background:none; text-align:left; white-space:nowrap; cursor:pointer; }
.wb-folders button[aria-current="true"] { background:var(--ds-fill); box-shadow:inset 2px 0 var(--ds-accent-color); }
.wb-folders button:hover, .wb-file:hover { background:var(--ds-fill); }
.wb-files { margin:0; padding:calc(var(--u) / 2) 0; list-style:none; overflow:auto; }
.wb-files li > ds-text { padding-inline:calc(var(--u) / 2); }
.wb-file { width:100%; cursor:grab; }
.wb-file ds-icon { color:var(--ds-text-color-muted); flex:none; }
.wb-file-name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
.wb-file-meta { flex:none; color:var(--ds-text-color-muted); font-size:var(--ds-type-size-small); }
.wb-file[aria-selected="true"] { background:color-mix(in srgb, var(--ds-focus-ring) 16%, transparent); }
.wb-search { width:calc(10 * var(--u)); max-width:100%; }

.wb-strips { display:flex; height:100%; overflow-x:auto; overflow-y:hidden; }
.wb-strip { flex:none; width:calc(5 * var(--u)); display:grid; grid-template-rows:var(--u) var(--u) var(--u) minmax(calc(3 * var(--u)), 1fr) var(--u); padding:calc(var(--u) / 2) calc(var(--u) / 2) 0; border-right:var(--hair); }
.wb-strip-name { display:flex; align-items:center; gap:calc(var(--u) / 4); min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:var(--ds-type-size-small); }
.wb-strip-name::before { content:''; flex:none; width:calc(var(--u) / 4); height:calc(var(--u) / 2); background:var(--tone); }
.wb-strip-acts { display:flex; }
.wb-strip-acts .wb-toggle { flex:1; width:auto; }
.wb-strip[data-master] { width:calc(6 * var(--u)); background:var(--ds-fill); }
.wb-fader-row { display:flex; justify-content:center; gap:calc(var(--u) / 2); padding-block:calc(var(--u) / 2); min-height:0; }
.wb-fader { position:relative; width:var(--u); height:100%; cursor:ns-resize; touch-action:none; }
.wb-fader::before { content:''; position:absolute; inset-block:0; left:calc(50% - 1px); width:2px; background:var(--ds-border-color); }
.wb-fader i { position:absolute; left:0; right:0; height:calc(var(--u) / 2); bottom:calc(var(--f) * (100% - var(--u) / 2)); background:var(--ds-text-color); box-shadow:inset 0 -2px var(--ds-paper), inset 0 2px var(--ds-paper); }
.wb-vu { display:flex; gap:2px; }
.wb-vu b { position:relative; width:calc(4px * var(--ds-sf)); height:100%; background:color-mix(in oklab, var(--ds-text-color) 10%, transparent); overflow:hidden; }
.wb-vu i { background:linear-gradient(to top, var(--ds-apple-green) 0 70%, var(--ds-yellow) 70% 88%, var(--ds-tuned-red) 88%); transform-origin:bottom; transform:scaleY(var(--level, 0)); }
.wb-strip-db { text-align:center; font-size:var(--ds-type-size-small); color:var(--ds-text-color-muted); }

.wb-inspect { display:flex; flex-direction:column; gap:var(--u); padding:var(--u); }
.wb-preview { flex:none; height:calc(4 * var(--u)); background:color-mix(in oklab, var(--tone) 18%, var(--ds-paper)); box-shadow:inset 0 0 0 1px var(--ds-border-color); }
.wb-preview svg { display:block; width:100%; height:100%; }
.wb-props { display:grid; grid-template-columns:repeat(2, calc(4 * var(--u))); gap:var(--u) calc(2 * var(--u)); }
.wb-facts { display:grid; grid-template-columns:calc(4 * var(--u)) minmax(0, 1fr); margin:0; }
.wb-facts dt { color:var(--ds-title-color); }
.wb-facts dd { margin:0; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wb-actions { display:flex; gap:var(--u); flex-wrap:wrap; }

/* A narrower window keeps one dock pane at a time. */
@media (max-width:1099px) {
  .wb-dock { grid-template-columns:minmax(0, 1fr); grid-template-rows:calc(2 * var(--u)) minmax(0, 1fr); }
  .wb-docktabs { display:flex; align-items:center; padding-inline:var(--u); border-bottom:var(--hair); }
  .wb-pane + .wb-pane { box-shadow:none; }
  .wb-dock[data-pane="browser"] .wb-pane:not(.wb-browser), .wb-dock[data-pane="mixer"] .wb-pane:not(.wb-mixer), .wb-dock[data-pane="clip"] .wb-pane:not(.wb-inspector) { display:none; }
  .wb-wide { display:none; }
}
/* A phone: the window's height no longer holds the tool, so it runs down the page. */
@media (max-width:700px) {
  .wb { height:auto; margin-top:0; grid-template-rows:auto calc(17 * var(--u)) auto calc(14 * var(--u)); --head:calc(7 * var(--u)); }
  .wb-bar, .wb-transport { flex-wrap:wrap; min-height:calc(2 * var(--u)); padding-block:calc(var(--u) / 2); row-gap:var(--u); }
  .wb-head { grid-template-columns:calc(var(--u) / 4) minmax(0, 1fr) repeat(3, var(--u)); padding-right:0; }
  .wb-head-num, .wb-head-mix ds-number + ds-number, .wb-head-meta span { display:none; }
  .wb-head-name { grid-column:2; }
  .wb-head-mix, .wb-head-meta { grid-column:2 / -1; padding-left:calc(var(--u) / 4); }
  .wb-clock span { min-width:calc(5 * var(--u)); }
  .wb-transport .wb-end { margin-left:0; }
}
</style>
<div class="wb" id="wb" data-loop data-zoom="1">
  <header class="wb-bar">
    <div class="wb-brand"><ds-icon type="audio" aria-hidden="true"></ds-icon><ds-text literal strong>Tapeline</ds-text></div>
    <ds-text literal tone="muted" class="wb-wide">Night bus · sketch 4</ds-text>
    <div class="wb-end">
      <ds-text literal tone="muted" class="wb-wide wb-mono" id="wb-grid"></ds-text>
      <ds-text literal tone="muted" class="wb-mono" id="wb-cpu">CPU 3%</ds-text>
      <ds-button split actions literal compact aria-label="History" id="wb-history"></ds-button>
    </div>
  </header>
  <div class="wb-arrange" id="wb-arrange" aria-label="Arrangement">
    <div class="wb-corner"><ds-text literal strong>Tracks</ds-text><ds-text literal tone="muted" id="wb-count"></ds-text></div>
    <div class="wb-ruler" id="wb-ruler">
      <div class="wb-markers" id="wb-markers"></div>
      <div class="wb-bars" id="wb-bars" title="Click to move the playhead, drag to set the loop"><div class="wb-loop"></div></div>
      <div class="wb-cursor"></div>
    </div>
  </div>
  <div class="wb-transport" role="toolbar" aria-label="Transport">
    <ds-button icon label="Go to start" id="wb-start"><ds-icon type="rewind" aria-hidden="true"></ds-icon></ds-button>
    <ds-button icon choice label="Play" id="wb-play" aria-pressed="false"><ds-icon type="play-alt" aria-hidden="true"></ds-icon></ds-button>
    <ds-button icon label="Stop" id="wb-stop"><ds-icon type="stop" aria-hidden="true"></ds-icon></ds-button>
    <ds-button icon choice label="Record onto the armed track" id="wb-rec" aria-pressed="false"><span class="wb-rec-dot" aria-hidden="true"></span></ds-button>
    <ds-button icon choice active label="Loop" id="wb-loopbtn" aria-pressed="true"><ds-icon type="loop" aria-hidden="true"></ds-icon></ds-button>
    <div class="wb-clock wb-mono"><span id="wb-time" aria-label="Time">00:00:00.000</span><span id="wb-beat" aria-label="Bar, beat and tick">1.1.000</span></div>
    <ds-number drag="value" id="wb-bpm" value="124" min="60" max="200" default="124" unit="BPM" width="5" aria-label="Tempo in beats per minute"></ds-number>
    <ds-button icon choice label="Metronome" id="wb-click" aria-pressed="false"><ds-icon type="music" aria-hidden="true"></ds-icon></ds-button>
    <div class="wb-end">
      <ds-select><select id="wb-snap" aria-label="Snap to"><option value="4">Snap to bars</option><option value="1" selected>Snap to beats</option><option value="0.5">Snap to half beats</option><option value="0.25">Snap to sixteenths</option></select></ds-select>
      <ds-button split literal aria-label="Zoom" id="wb-zoom" options="0.5:Song,1:Bars,2:Beats" value="1"></ds-button>
    </div>
  </div>
  <div class="wb-dock" id="wb-dock" data-pane="mixer">
    <div class="wb-docktabs"><ds-button split literal aria-label="Panel" id="wb-docktabs" options="browser:Browser,mixer:Mixer,clip:Clip" value="mixer"></ds-button></div>
    <section class="wb-pane wb-browser" aria-label="Loop browser">
      <header class="wb-pane-head"><ds-text literal strong>Loops</ds-text><div class="wb-end"><ds-input variant="field" class="wb-search" id="wb-search" type="search" placeholder="Search loops" aria-label="Search loops"></ds-input></div></header>
      <div class="wb-pane-body wb-browser-body"><nav class="wb-folders" id="wb-folders" aria-label="Folders"></nav><ul class="wb-files" id="wb-files" aria-label="Loops: drag one onto a track, or double-click to add it at the playhead"></ul></div>
    </section>
    <section class="wb-pane wb-mixer" aria-label="Mixer">
      <header class="wb-pane-head"><ds-text literal strong>Mixer</ds-text><div class="wb-end"><ds-text literal tone="muted">44.1 kHz · 24-bit</ds-text></div></header>
      <div class="wb-pane-body"><div class="wb-strips" id="wb-strips"></div></div>
    </section>
    <section class="wb-pane wb-inspector" aria-label="Clip">
      <header class="wb-pane-head"><ds-text literal strong>Clip</ds-text><div class="wb-end"><ds-text literal tone="muted" id="wb-clip-name"></ds-text></div></header>
      <div class="wb-pane-body" id="wb-inspect"></div>
    </section>
  </div>
</div>`,
  script: `
const TRACKS = ${JSON.stringify(tracks)};
const LIBRARY = ${JSON.stringify(library)};
const MARKERS = ${JSON.stringify(markers)};
let clips = ${JSON.stringify(clips)};
const SONG = 128, STEPS = 12;
const root = document.getElementById('wb');
const arrange = document.getElementById('wb-arrange');
const el = id => document.getElementById('wb-' + id);
const escape = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
const sourceOf = clip => clip.take || LIBRARY.find(item => item.name === clip.source);
const trackOf = id => TRACKS.find(track => track.id === id);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const dbGain = db => Math.pow(10, db / 20);
let bpm = 124, pos = 21, playing = false, loopOn = true, loopStart = 64, loopEnd = 96, snap = 1;
let selected = 'c2', selectedTrack = 'drums', recording = false, recStart = 0, takes = 1, metronome = false, nextId = clips.length + 1;
let folder = 'All', query = '', chosenFile = null, dragFile = null;
const undoStack = [], redoStack = [];
TRACKS.forEach(track => { track.mute = false; track.solo = false; track.arm = Boolean(track.arm); track.level = 0; });
const master = { id: 'master', name: 'Master', tone: 'var(--ds-text-color)', vol: 0, level: 0 };

// A loop's sound, drawn: amplitudes at twelve steps a beat, the same every time for the same loop.
function random(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const waves = new Map(), noteSets = new Map();
function wave(source) {
  if (waves.has(source.name)) return waves.get(source.name);
  const rnd = random(source.seed), out = [];
  let last = 0;
  for (let i = 0; i < source.beats * STEPS; i++) {
    const t = i / STEPS, beat = t % 1, n = rnd();
    let a;
    if (source.shape === 'drum') a = Math.max(Math.exp(-beat * 7) * 0.95, Math.floor(t) % 2 ? Math.exp(-beat * 5) * 0.75 : 0, Math.exp(-((t * 2) % 1) * 12) * 0.35) * (0.85 + 0.15 * n);
    else if (source.shape === 'keys') a = (0.3 + 0.45 * Math.exp(-(t % 2) * 1.2)) * (0.9 + 0.1 * n);
    else if (source.shape === 'pad') a = 0.28 + 0.32 * Math.sin(Math.PI * t / source.beats) + 0.05 * n;
    else if (source.shape === 'vox') a = (t % 4) < 3 ? (0.25 + 0.5 * Math.abs(Math.sin(t * 1.7 + source.seed))) * (0.8 + 0.2 * n) : 0.03 * n;
    else if (source.shape === 'rise') a = Math.pow(t / source.beats, 2) * 0.9 + 0.06 * n;
    else if (source.shape === 'fall') a = Math.pow(1 - t / source.beats, 2) * 0.9 + 0.06 * n;
    else a = 0.12 + 0.1 * n;
    last = source.shape === 'drum' ? a : (a + last * 2) / 3;
    out.push(Math.min(1, last));
  }
  waves.set(source.name, out);
  return out;
}
function notes(source) {
  if (noteSets.has(source.name)) return noteSets.get(source.name);
  const rnd = random(source.seed), out = [], scale = [0, 3, 5, 7, 10];
  for (let t = 0; t < source.beats; t += source.shape === 'perc' ? 0.25 : 0.5) {
    if (source.shape === 'perc') {
      out.push({ t, len: 0.2, p: 9 });
      if (t % 2 === 1) out.push({ t, len: 0.25, p: 4 });
      if (rnd() > 0.8) out.push({ t, len: 0.25, p: 6 });
    } else if (t % 1 === 0 || rnd() > 0.6) out.push({ t, len: 0.4, p: scale[Math.floor(rnd() * scale.length)] + (rnd() > 0.8 ? 5 : 0) });
  }
  noteSets.set(source.name, out);
  return out;
}
function drawing(clip, len) {
  const source = sourceOf(clip), width = len * STEPS;
  if (source.kind === 'midi') {
    let rects = '';
    for (let rep = 0; rep * source.beats < len; rep++) notes(source).forEach(note => {
      const t = rep * source.beats + note.t;
      if (t < len) rects += '<rect x="' + (t * STEPS).toFixed(1) + '" y="' + ((11 - note.p) * 100 / 12).toFixed(1) + '" width="' + Math.max(1, note.len * STEPS).toFixed(1) + '" height="7"/>';
    });
    return '<svg viewBox="0 0 ' + width + ' 100" preserveAspectRatio="none" aria-hidden="true">' + rects + '</svg>';
  }
  const amps = wave(source), top = [], bottom = [];
  for (let i = 0; i <= width; i++) {
    const a = amps[i % amps.length] * 46;
    top.push(i + ' ' + (50 - a).toFixed(1));
    bottom.unshift(i + ' ' + (50 + a).toFixed(1));
  }
  return '<svg viewBox="0 0 ' + width + ' 100" preserveAspectRatio="none" aria-hidden="true"><path d="M' + top.join('L') + 'L' + bottom.join('L') + 'Z"/></svg>';
}

// Positions, times and snapping. One beat is a square at the middle zoom.
const barBeat = beat => (Math.floor(beat / 4) + 1) + '.' + (Math.floor(beat % 4) + 1);
function clock(beat) {
  const seconds = beat * 60 / bpm, minutes = Math.floor(seconds / 60), rest = seconds - minutes * 60;
  return '00:' + String(minutes).padStart(2, '0') + ':' + rest.toFixed(3).padStart(6, '0');
}
const snapTo = (value, step = snap) => Math.round(value / step) * step;
const beatWidth = () => el('ruler').getBoundingClientRect().width / SONG;
const beatAt = clientX => (clientX - el('ruler').getBoundingClientRect().left) / beatWidth();

// The arrangement.
function toggles(track, acts) {
  return acts.map(([act, letter, label]) =>
    '<button type="button" class="wb-toggle" data-act="' + act + '" data-track="' + track.id + '" aria-pressed="' + Boolean(track[act]) + '" aria-label="' + label + ' ' + track.name + '" title="' + label + '">' + letter + '</button>').join('');
}
const MUTE_SOLO = [['mute', 'M', 'Mute'], ['solo', 'S', 'Solo']], ALL_ACTS = [...MUTE_SOLO, ['arm', 'R', 'Arm for recording']];
function renderTracks() {
  el('count').textContent = TRACKS.length + ' tracks';
  el('markers').innerHTML = MARKERS.map(([at, name]) => '<button type="button" style="--at:' + at + '" data-at="' + at + '">' + name + '</button>').join('');
  el('bars').insertAdjacentHTML('beforeend', Array.from({ length: SONG / 4 }, (_, bar) => '<span style="--at:' + bar * 4 + '">' + (bar + 1) + '</span>').join(''));
  arrange.insertAdjacentHTML('beforeend', TRACKS.map((track, index) => '<div class="wb-head" data-head="' + track.id + '" style="--tone:' + track.tone + '">'
    + '<span class="wb-head-num">' + (index + 1) + '</span><button type="button" class="wb-head-name" data-pick="' + track.id + '">' + track.name + '</button>'
    + toggles(track, ALL_ACTS)
    + '<div class="wb-head-mix"><ds-number icon="audio" data-vol="' + track.id + '" value="' + track.vol + '" min="-60" max="6" step="0.5" default="0" unit="dB" width="4" aria-label="' + track.name + ' volume"></ds-number>'
    + '<ds-number label="Pan" data-pan="' + track.id + '" value="' + track.pan + '" min="-100" max="100" default="0" width="4" aria-label="' + track.name + ' pan"></ds-number></div>'
    + '<div class="wb-head-meta"><span>' + (track.kind === 'midi' ? 'MIDI' : 'Audio') + '</span><div class="wb-meter"><i data-meter="' + track.id + '"></i></div></div></div>'
    + '<div class="wb-lane" data-lane="' + track.id + '" data-kind="' + track.kind + '" style="--tone:' + track.tone + '"><div class="wb-clips"></div><div class="wb-ghost" hidden></div><div class="wb-take" hidden></div></div>').join(''));
}
function renderClips() {
  const focused = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.clip;
  TRACKS.forEach(track => {
    const lane = arrange.querySelector('[data-lane="' + track.id + '"]');
    lane.querySelector('.wb-clips').innerHTML = clips.filter(clip => clip.track === track.id).map(clip => {
      const source = sourceOf(clip);
      return '<button type="button" class="wb-clip" data-clip="' + clip.id + '" aria-pressed="' + (clip.id === selected) + '" style="--start:' + clip.start + ';--len:' + clip.len + ';--loop:' + source.beats + '"'
        + ' aria-label="' + escape(clip.source + ', ' + track.name + ', bar ' + barBeat(clip.start) + ' for ' + clip.len + ' beats') + '">'
        + '<span class="wb-clip-name">' + escape(clip.source) + '</span>' + drawing(clip, clip.len) + '</button>';
    }).join('');
  });
  if (focused) arrange.querySelector('[data-clip="' + focused + '"]')?.focus();
  updateHistory();
}
function syncTracks() {
  const soloing = TRACKS.some(track => track.solo);
  TRACKS.forEach(track => {
    root.querySelectorAll('[data-track="' + track.id + '"]').forEach(button => button.setAttribute('aria-pressed', String(Boolean(track[button.dataset.act]))));
    const lane = arrange.querySelector('[data-lane="' + track.id + '"]');
    lane.toggleAttribute('data-muted', track.mute);
    lane.toggleAttribute('data-silent', soloing && !track.solo);
    arrange.querySelector('[data-head="' + track.id + '"]').toggleAttribute('data-selected', track.id === selectedTrack);
  });
}

// History: every change to the clips can be taken back.
function commit() { undoStack.push(JSON.stringify(clips)); if (undoStack.length > 100) undoStack.shift(); redoStack.length = 0; }
function updateHistory() {
  el('history').segments = [{ value: 'undo', label: 'Undo', icon: 'undo', disabled: !undoStack.length }, { value: 'redo', label: 'Redo', icon: 'redo', disabled: !redoStack.length }];
}
function travel(from, to) {
  if (!from.length) return;
  to.push(JSON.stringify(clips));
  clips = JSON.parse(from.pop());
  if (!clips.some(clip => clip.id === selected)) selected = null;
  renderClips(); renderInspector();
}

// The transport.
let frame = 0, lastTime = 0, lastBeat = -1, audio = null, cpuAt = 0;
function tick(now) {
  const step = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  pos += step * bpm / 60;
  if (loopOn && !recording && pos >= loopEnd) pos = loopStart + (pos - loopEnd);
  if (pos >= SONG) { pos = SONG; pause(); }
  if (metronome && Math.floor(pos) !== lastBeat) beep(Math.floor(pos) % 4 === 0);
  lastBeat = Math.floor(pos);
  showPosition(true);
  meters();
  if (now - cpuAt > 600) { cpuAt = now; el('cpu').textContent = 'CPU ' + (12 + Math.floor(Math.random() * 9)) + '%'; }
  if (playing) frame = requestAnimationFrame(tick);
}
function setPressed(button, on) { button.toggleAttribute('active', on); button.setAttribute('aria-pressed', String(on)); }
function setPlayButton(on) {
  setPressed(el('play'), on);
  el('play').label = on ? 'Pause' : 'Play';
  el('play').querySelector('ds-icon').setAttribute('type', on ? 'pause' : 'play-alt');
}
function play() {
  if (playing) return;
  if (pos >= SONG) pos = 0;
  playing = true;
  if (recording) recStart = snapTo(pos, 1);
  lastTime = performance.now(); lastBeat = Math.floor(pos);
  root.classList.add('wb-playing');
  setPlayButton(true);
  frame = requestAnimationFrame(tick);
}
function pause() {
  if (!playing) return;
  playing = false;
  cancelAnimationFrame(frame);
  root.classList.remove('wb-playing');
  setPlayButton(false);
  keepTake();
  meters(true);
  el('cpu').textContent = 'CPU 3%';
}
function keepTake() {
  const track = TRACKS.find(item => item.arm);
  arrange.querySelectorAll('.wb-take').forEach(take => { take.hidden = true; });
  if (!recording || !track) return;
  const len = Math.round(pos - recStart);
  if (len < 1) return;
  commit();
  const name = 'Take ' + takes++;
  clips.push({ id: 'c' + nextId++, track: track.id, source: name, start: recStart, len: Math.min(len, SONG - recStart), gain: 0, pitch: 0, take: { name, kind: 'audio', beats: len, key: '—', shape: 'vox', seed: 101 + takes * 17 } });
  selected = clips[clips.length - 1].id;
  renderClips(); renderInspector();
}
function beep(accent) {
  audio = audio || new AudioContext();
  const osc = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime;
  osc.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(0.2, at); gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  osc.connect(gain).connect(audio.destination); osc.start(at); osc.stop(at + 0.06);
}
function showPosition(follow) {
  root.style.setProperty('--pos', pos.toFixed(3));
  el('time').textContent = clock(pos);
  el('beat').textContent = barBeat(pos) + '.' + String(Math.floor((pos % 1) * 960)).padStart(3, '0');
  if (recording && playing) {
    const track = TRACKS.find(item => item.arm);
    const take = track && arrange.querySelector('[data-lane="' + track.id + '"] .wb-take');
    if (take) { take.hidden = false; take.style.setProperty('--start', recStart); take.style.setProperty('--len', Math.max(0, pos - recStart).toFixed(2)); }
  }
  if (!follow) return;
  const unit = beatWidth(), x = pos * unit, view = arrange.clientWidth - arrange.querySelector('.wb-head').offsetWidth;
  if (x < arrange.scrollLeft || x > arrange.scrollLeft + view - unit * 2) arrange.scrollLeft = Math.max(0, x - unit * 2);
}
function level(track) {
  const soloing = TRACKS.some(item => item.solo);
  if (!playing || track.mute || (soloing && !track.solo)) return 0;
  const clip = clips.find(item => item.track === track.id && item.start <= pos && pos < item.start + item.len);
  if (!clip) return 0;
  const source = sourceOf(clip), at = (pos - clip.start) % source.beats;
  const amp = source.kind === 'midi' ? (notes(source).some(note => note.t <= at && at < note.t + note.len) ? 0.75 : 0.08) : wave(source)[Math.floor(at * STEPS)] || 0;
  return Math.min(1, amp * dbGain(track.vol) * dbGain(clip.gain) * 1.4);
}
function meters(reset) {
  let loudest = 0;
  TRACKS.forEach(track => {
    track.level = reset ? 0 : Math.max(level(track), track.level * 0.86);
    loudest = Math.max(loudest, track.level);
  });
  master.level = reset ? 0 : Math.min(1, loudest * dbGain(master.vol));
  [...TRACKS, master].forEach(track => root.querySelectorAll('[data-meter="' + track.id + '"]').forEach((meter, index) => meter.style.setProperty('--level', clamp(track.level * (index % 2 ? 0.94 : 1), 0, 1).toFixed(3))));
}

// The ruler: a click moves the playhead, a drag along the bar numbers sets the loop.
function showLoop() {
  root.style.setProperty('--ls', loopStart); root.style.setProperty('--le', loopEnd);
  root.toggleAttribute('data-loop', loopOn);
  setPressed(el('loopbtn'), loopOn);
}
el('ruler').addEventListener('pointerdown', event => {
  const marker = event.target.closest('[data-at]');
  if (marker) { pos = Number(marker.dataset.at); showPosition(false); return; }
  const from = clamp(snapTo(beatAt(event.clientX), 1), 0, SONG);
  if (!event.target.closest('#wb-bars')) { pos = from; showPosition(false); return; }
  let dragged = false;
  el('ruler').setPointerCapture(event.pointerId);
  const move = moveEvent => {
    const to = clamp(snapTo(beatAt(moveEvent.clientX), snap >= 4 ? 4 : 1), 0, SONG);
    if (Math.abs(to - from) < 1) return;
    dragged = true;
    loopStart = Math.min(from, to); loopEnd = Math.max(from, to); loopOn = true;
    showLoop();
  };
  el('ruler').addEventListener('pointermove', move);
  el('ruler').addEventListener('pointerup', () => {
    el('ruler').removeEventListener('pointermove', move);
    if (!dragged) { pos = from; showPosition(false); }
  }, { once: true });
});

// Clips: a press selects; a drag moves along the beats and onto another track of the same kind; the right edge resizes.
arrange.addEventListener('pointerdown', event => {
  const pick = event.target.closest('[data-pick]');
  if (pick) { selectedTrack = pick.dataset.pick; syncTracks(); return; }
  const button = event.target.closest('.wb-clip');
  if (!button || event.button !== 0) return;
  const clip = clips.find(item => item.id === button.dataset.clip);
  select(clip.id);
  const box = button.getBoundingClientRect(), unit = beatWidth();
  const resizing = event.clientX > box.right - 8;
  const start = { x: event.clientX, begin: clip.start, len: clip.len, track: clip.track };
  button.setPointerCapture(event.pointerId);
  button.classList.add('wb-moving');
  const move = moveEvent => {
    const shift = (moveEvent.clientX - start.x) / unit;
    if (resizing) {
      clip.len = clamp(snapTo(start.len + shift) || snap, Math.min(snap, 1), SONG - clip.start);
      button.style.setProperty('--len', clip.len);
      return;
    }
    clip.start = clamp(snapTo(start.begin + shift), 0, SONG - clip.len);
    button.style.setProperty('--start', clip.start);
    const lane = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY).map(node => node.closest && node.closest('.wb-lane')).find(Boolean);
    if (lane && lane.dataset.lane !== clip.track && lane.dataset.kind === sourceOf(clip).kind) {
      clip.track = lane.dataset.lane;
      lane.querySelector('.wb-clips').append(button);
    }
  };
  const up = () => {
    button.removeEventListener('pointermove', move);
    button.classList.remove('wb-moving');
    if (clip.start === start.begin && clip.len === start.len && clip.track === start.track) return;
    const moved = { start: clip.start, len: clip.len, track: clip.track };
    Object.assign(clip, { start: start.begin, len: start.len, track: start.track });
    commit();
    Object.assign(clip, moved);
    selectedTrack = clip.track;
    renderClips(); renderInspector(); syncTracks();
  };
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerup', up, { once: true });
  button.addEventListener('pointercancel', up, { once: true });
});
function select(id) {
  selected = id;
  const clip = clips.find(item => item.id === id);
  if (clip) selectedTrack = clip.track;
  arrange.querySelectorAll('.wb-clip').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.clip === id)));
  syncTracks(); renderInspector();
}
function change(clip, values) {
  commit();
  Object.assign(clip, values);
  renderClips(); fillInspector(clip);
}
function duplicate() {
  const clip = clips.find(item => item.id === selected);
  if (!clip) return;
  commit();
  const copy = { ...clip, id: 'c' + nextId++, start: Math.min(SONG - clip.len, clip.start + clip.len) };
  clips.push(copy);
  selected = copy.id;
  renderClips(); renderInspector();
}
function remove() {
  if (!selected) return;
  commit();
  clips = clips.filter(item => item.id !== selected);
  selected = null;
  renderClips(); renderInspector();
}

// Heads and mixer strips share one state for every track.
root.addEventListener('click', event => {
  const toggle = event.target.closest('.wb-toggle');
  if (!toggle) return;
  const track = trackOf(toggle.dataset.track);
  if (toggle.dataset.act === 'arm') TRACKS.forEach(item => { item.arm = item === track ? !item.arm : false; });
  else track[toggle.dataset.act] = !track[toggle.dataset.act];
  syncTracks();
});
function takeField(target) {
  if (target.dataset.vol) { trackOf(target.dataset.vol).vol = target.value; showFader(trackOf(target.dataset.vol)); }
  if (target.dataset.pan) { trackOf(target.dataset.pan).pan = target.value; showPan(trackOf(target.dataset.pan)); }
}
arrange.addEventListener('input', event => takeField(event.target));
arrange.addEventListener('change', event => takeField(event.target));
function renderMixer() {
  el('strips').innerHTML = [...TRACKS, master].map(track => '<div class="wb-strip" style="--tone:' + track.tone + '"' + (track === master ? ' data-master' : '') + '>'
    + '<div class="wb-strip-name">' + track.name + '</div>'
    + '<div class="wb-strip-acts">' + (track === master ? '' : toggles(track, MUTE_SOLO)) + '</div>'
    + '<div class="wb-strip-db wb-mono" data-pan-text="' + track.id + '">' + (track === master ? 'Stereo' : '') + '</div>'
    + '<div class="wb-fader-row"><div class="wb-fader" role="slider" tabindex="0" data-fader="' + track.id + '" aria-label="' + track.name + ' level" aria-valuemin="-60" aria-valuemax="6"><i></i></div>'
    + '<div class="wb-vu" aria-hidden="true"><b><i data-meter="' + track.id + '"></i></b><b><i data-meter="' + track.id + '"></i></b></div></div>'
    + '<div class="wb-strip-db wb-mono" data-db="' + track.id + '"></div></div>').join('');
  [...TRACKS, master].forEach(showFader);
  TRACKS.forEach(showPan);
}
function showPan(track) {
  root.querySelector('[data-pan-text="' + track.id + '"]').textContent = track.pan === 0 ? 'C' : (track.pan < 0 ? 'L' : 'R') + Math.abs(track.pan);
}
function showFader(track) {
  const fader = root.querySelector('[data-fader="' + track.id + '"]');
  fader.style.setProperty('--f', ((track.vol + 60) / 66).toFixed(3));
  fader.setAttribute('aria-valuenow', track.vol);
  fader.setAttribute('aria-valuetext', track.vol + ' dB');
  root.querySelector('[data-db="' + track.id + '"]').textContent = (track.vol > 0 ? '+' : '') + track.vol.toFixed(1) + ' dB';
  const field = root.querySelector('[data-vol="' + track.id + '"]');
  if (field && field.value !== track.vol) field.value = track.vol;
}
const faderTrack = fader => fader.dataset.fader === 'master' ? master : trackOf(fader.dataset.fader);
function setFader(fader, clientY) {
  const box = fader.getBoundingClientRect(), share = clamp((box.bottom - clientY) / box.height, 0, 1), track = faderTrack(fader);
  track.vol = Math.round((share * 66 - 60) * 2) / 2;
  showFader(track);
}
el('strips').addEventListener('pointerdown', event => {
  const fader = event.target.closest('.wb-fader');
  if (!fader) return;
  fader.setPointerCapture(event.pointerId);
  setFader(fader, event.clientY);
  const move = moveEvent => setFader(fader, moveEvent.clientY);
  fader.addEventListener('pointermove', move);
  fader.addEventListener('pointerup', () => fader.removeEventListener('pointermove', move), { once: true });
});
el('strips').addEventListener('dblclick', event => { const fader = event.target.closest('.wb-fader'); if (fader) { faderTrack(fader).vol = 0; showFader(faderTrack(fader)); } });
el('strips').addEventListener('keydown', event => {
  const fader = event.target.closest('.wb-fader');
  if (!fader || !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const track = faderTrack(fader), step = event.shiftKey || event.key.startsWith('Page') ? 3 : 0.5;
  track.vol = event.key === 'Home' ? -60 : event.key === 'End' ? 6 : clamp(track.vol + (event.key.endsWith('Up') ? step : -step), -60, 6);
  showFader(track);
});

// The inspector shows and edits the selected clip.
function renderInspector() {
  const clip = clips.find(item => item.id === selected);
  el('clip-name').textContent = clip ? clip.source : '';
  if (!clip) { el('inspect').innerHTML = '<div class="wb-inspect"><ds-empty heading="No clip selected" text="Select a clip in the arrangement, or drag a loop in from the browser."></ds-empty></div>'; return; }
  el('inspect').innerHTML = '<div class="wb-inspect" style="--tone:' + trackOf(clip.track).tone + '">'
    + '<div class="wb-preview" id="wb-preview"></div>'
    + '<div class="wb-props">'
    + '<ds-number label="Bar" data-field="bar" min="1" max="32" step="1" width="4" aria-label="Starts at bar"></ds-number>'
    + '<ds-number label="Beats" data-field="len" min="1" max="128" step="1" width="4" aria-label="Length in beats"></ds-number>'
    + '<ds-number icon="audio" data-field="gain" min="-24" max="12" step="0.5" default="0" unit="dB" width="4" aria-label="Clip gain"></ds-number>'
    + '<ds-number label="Pitch" data-field="pitch" min="-12" max="12" step="1" default="0" unit="st" width="4" aria-label="Pitch in semitones"></ds-number>'
    + '</div><dl class="wb-facts"><dt>Track</dt><dd data-fact="track"></dd><dt>Loop</dt><dd data-fact="loop"></dd><dt>Key</dt><dd data-fact="key"></dd></dl>'
    + '<div class="wb-actions"><ds-button secondary data-do="duplicate">Duplicate</ds-button><ds-button secondary data-do="delete">Delete</ds-button></div></div>';
  fillInspector(clip);
}
function fillInspector(clip) {
  const source = sourceOf(clip), track = trackOf(clip.track), inspect = el('inspect'), preview = inspect.querySelector('#wb-preview');
  if (!preview) return;
  inspect.querySelector('.wb-inspect').style.setProperty('--tone', track.tone);
  preview.innerHTML = drawing(clip, source.beats);
  const set = (name, value) => { const field = inspect.querySelector('[data-field="' + name + '"]'); if (field.value !== value) field.value = value; };
  set('bar', Math.floor(clip.start / 4) + 1); set('len', clip.len); set('gain', clip.gain); set('pitch', clip.pitch);
  inspect.querySelector('[data-fact="track"]').textContent = track.name + ' · ' + (source.kind === 'midi' ? 'MIDI' : 'Audio');
  inspect.querySelector('[data-fact="loop"]').textContent = source.beats + ' beats, played ' + Math.round(clip.len / source.beats * 10) / 10 + ' times';
  inspect.querySelector('[data-fact="key"]').textContent = source.key === '—' ? 'None' : source.key + (clip.pitch ? (clip.pitch > 0 ? ' +' : ' ') + clip.pitch + ' st' : '');
  el('clip-name').textContent = clip.source;
}
el('inspect').addEventListener('change', event => {
  const clip = clips.find(item => item.id === selected), field = event.target.dataset.field;
  if (!clip || !field) return;
  const value = event.target.value;
  if (field === 'bar') change(clip, { start: clamp((value - 1) * 4 + (clip.start % 4), 0, SONG - clip.len) });
  if (field === 'len') change(clip, { len: clamp(value, 1, SONG - clip.start) });
  if (field === 'gain') change(clip, { gain: value });
  if (field === 'pitch') change(clip, { pitch: value });
});
el('inspect').addEventListener('click', event => {
  const action = event.target.closest('[data-do]');
  if (action?.dataset.do === 'duplicate') duplicate();
  if (action?.dataset.do === 'delete') remove();
});

// The browser: folders, a search, and loops to drag onto a track.
function renderBrowser() {
  const folders = ['All', ...new Set(LIBRARY.map(item => item.folder))];
  el('folders').innerHTML = folders.map(name => '<button type="button" data-folder="' + name + '" aria-current="' + (name === folder) + '"><ds-icon type="folder" aria-hidden="true"></ds-icon>' + name + '</button>').join('');
  const shown = LIBRARY.filter(item => (folder === 'All' || item.folder === folder) && item.name.toLowerCase().includes(query));
  el('files').innerHTML = shown.length ? shown.map(item => '<li><button type="button" class="wb-file" draggable="true" data-file="' + item.name + '" aria-selected="' + (item.name === chosenFile) + '">'
    + '<ds-icon type="' + (item.kind === 'midi' ? 'music' : 'audio') + '" aria-hidden="true"></ds-icon><span class="wb-file-name">' + item.name + '</span><span class="wb-file-meta">' + item.beats + ' beats</span></button></li>').join('')
    : '<li><ds-text literal tone="muted">No loops match.</ds-text></li>';
}
el('folders').addEventListener('click', event => { const button = event.target.closest('[data-folder]'); if (button) { folder = button.dataset.folder; renderBrowser(); } });
el('search').addEventListener('input', event => { query = String(event.target.value || '').trim().toLowerCase(); renderBrowser(); });
el('files').addEventListener('click', event => {
  const button = event.target.closest('[data-file]');
  if (!button) return;
  chosenFile = button.dataset.file;
  el('files').querySelectorAll('[data-file]').forEach(item => item.setAttribute('aria-selected', String(item === button)));
});
el('files').addEventListener('dblclick', event => { const button = event.target.closest('[data-file]'); if (button) addAtPlayhead(button.dataset.file); });
el('files').addEventListener('keydown', event => { const button = event.target.closest('[data-file]'); if (button && event.key === 'Enter') { event.preventDefault(); addAtPlayhead(button.dataset.file); } });
function addClip(name, trackId, start) {
  const source = LIBRARY.find(item => item.name === name), len = Math.min(Math.max(source.beats, 16), SONG - start);
  if (len < 1) return;
  commit();
  clips.push({ id: 'c' + nextId++, track: trackId, source: name, start, len, gain: 0, pitch: 0 });
  selected = clips[clips.length - 1].id; selectedTrack = trackId;
  renderClips(); renderInspector(); syncTracks();
}
function addAtPlayhead(name) {
  const source = LIBRARY.find(item => item.name === name), current = trackOf(selectedTrack);
  const track = current && current.kind === source.kind ? current : TRACKS.find(item => item.kind === source.kind);
  addClip(name, track.id, clamp(Math.floor(pos / 4) * 4, 0, SONG - 4));
}
el('files').addEventListener('dragstart', event => {
  const button = event.target.closest('[data-file]');
  if (!button) return;
  dragFile = LIBRARY.find(item => item.name === button.dataset.file);
  event.dataTransfer.setData('text/plain', dragFile.name);
  event.dataTransfer.effectAllowed = 'copy';
});
el('files').addEventListener('dragend', () => { dragFile = null; clearDrop(); });
function clearDrop() { arrange.querySelectorAll('[data-drop]').forEach(lane => { lane.removeAttribute('data-drop'); lane.querySelector('.wb-ghost').hidden = true; }); }
const dropStart = event => clamp(Math.floor(beatAt(event.clientX) / Math.max(snap, 1)) * Math.max(snap, 1), 0, SONG - 1);
arrange.addEventListener('dragover', event => {
  const lane = event.target.closest('.wb-lane');
  if (!lane || !dragFile || lane.dataset.kind !== dragFile.kind) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  if (!lane.hasAttribute('data-drop')) { clearDrop(); lane.setAttribute('data-drop', ''); }
  const ghost = lane.querySelector('.wb-ghost'), start = dropStart(event);
  ghost.hidden = false;
  ghost.style.setProperty('--start', start);
  ghost.style.setProperty('--len', Math.min(Math.max(dragFile.beats, 16), SONG - start));
});
arrange.addEventListener('dragleave', event => { if (!arrange.contains(event.relatedTarget)) clearDrop(); });
arrange.addEventListener('drop', event => {
  const lane = event.target.closest('.wb-lane');
  if (!lane || !dragFile || lane.dataset.kind !== dragFile.kind) return;
  event.preventDefault();
  const start = dropStart(event);
  clearDrop();
  addClip(dragFile.name, lane.dataset.lane, start);
  dragFile = null;
});

// Controls and keys.
el('play').addEventListener('click', () => (playing ? pause() : play()));
el('stop').addEventListener('click', () => { const was = playing; pause(); if (!was) pos = 0; showPosition(true); });
el('start').addEventListener('click', () => { pos = 0; showPosition(true); });
el('rec').addEventListener('click', () => { recording = !recording; setPressed(el('rec'), recording); if (recording && playing) recStart = snapTo(pos, 1); });
el('loopbtn').addEventListener('click', () => { loopOn = !loopOn; showLoop(); });
el('click').addEventListener('click', () => { metronome = !metronome; setPressed(el('click'), metronome); });
el('bpm').addEventListener('input', event => { bpm = event.target.value; showPosition(false); });
el('bpm').addEventListener('change', event => { bpm = event.target.value; showPosition(false); });
el('snap').addEventListener('change', event => { snap = Number(event.target.value); });
el('zoom').addEventListener('change', event => {
  const anchor = arrange.scrollLeft / beatWidth();
  root.style.setProperty('--zoom', event.detail.value);
  root.dataset.zoom = event.detail.value;
  requestAnimationFrame(() => { arrange.scrollLeft = anchor * beatWidth(); });
});
el('docktabs').addEventListener('change', event => { el('dock').dataset.pane = event.detail.value; });
el('history').addEventListener('press', event => (event.detail.value === 'undo' ? travel(undoStack, redoStack) : travel(redoStack, undoStack)));
document.addEventListener('keydown', event => {
  const typing = event.target.closest && event.target.closest('input, textarea, select, ds-number, ds-input, ds-select, [role="slider"]');
  const command = event.metaKey || event.ctrlKey;
  if (typing) return;
  if (command && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? travel(redoStack, undoStack) : travel(undoStack, redoStack); }
  else if (command && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicate(); }
  else if (event.key === ' ') { event.preventDefault(); playing ? pause() : play(); }
  else if ((event.key === 'Delete' || event.key === 'Backspace') && selected) { event.preventDefault(); remove(); }
  else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && event.target.closest('.wb-clip')) {
    event.preventDefault();
    const clip = clips.find(item => item.id === selected);
    if (clip) change(clip, { start: clamp(clip.start + (event.key === 'ArrowRight' ? snap : -snap), 0, SONG - clip.len) });
  }
});

// Desktop aligned: the workbench is the window's whole squares, and says how many.
function showGrid() {
  const style = getComputedStyle(document.documentElement);
  const across = style.getPropertyValue('--ds-grid-columns').trim(), down = style.getPropertyValue('--ds-grid-rows').trim();
  el('grid').textContent = document.documentElement.hasAttribute('data-desktop-aligned') && across ? across + ' × ' + down + ' squares' : '';
}
new ResizeObserver(() => requestAnimationFrame(showGrid)).observe(document.documentElement);

renderTracks(); renderClips(); renderMixer(); renderBrowser(); syncTracks(); showLoop(); renderInspector(); showPosition(false); requestAnimationFrame(showGrid);
`,
};

export const WORKBENCH_EXAMPLES: Record<string, LayoutExample> = {
  'workbench-multitrack': MULTITRACK_EXAMPLE,
};
