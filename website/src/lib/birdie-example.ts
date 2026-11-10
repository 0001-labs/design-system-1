import type { LayoutExample } from './layout-examples';
import { choose, icon, library, photo, text } from './library-example-parts';
import { composition as site } from './library-sites';

// Birdie, a fictional bird guide kept by the people who watch, in the Birdie library: white paper,
// ink buttons, square photographs as covers, Metal green bands and Yellow under the figures that
// count. Seven pages that lead to each other: the front page, Discover, a species, a place, a
// watcher's life list, Field notes and one story. Tabs draw their first state in the markup, so
// every page reads the same with no script (the editor runs none).
//
// The photographs are from Unsplash under its licence, cropped square (public/examples/images/
// birdie-<bird>.jpg): robin 1742676915509-5700bf8a8c0a, blue tit 1704561970425-bc779c5f9777,
// great tit 1623771547547-098bf3d31c12, blackbird 1742676916561-88d56853cb8a, wren
// 1792919671247-6fb566a1c919, goldfinch 1775503079623-34454849041e, kingfisher
// 1444464666168-49d633b86797, barn owl 1467811884194-ae868cd3f090, puffin
// 1694407116765-b21b4e80e722, heron 1649287860345-975c45561ba3, swan 1567112098492-382825853bdd,
// woodpecker 1715424081094-c8ae410ca79c, jay 1743938155653-47ee73fd8b68, swallow
// 1717780523593-e56fafcef141, kestrel 1696096520234-9883837e2968, long-tailed tit
// 1698949171619-a55804ef6ac1, crane 1714639652143-926465a1da5f, oystercatcher
// 1658947969660-49437d905a75, starling 1635931908546-24a7d2bdf199, mallard
// 1715560016731-65dd8dba2819.

/** A Birdie page's address among the layout examples. */
const at = (page = '') => `/examples/layouts/birdie${page && `-${page}`}/`;

const composition = `${site}<style>
.birdie-hero { margin:0; max-width:calc(46 * var(--ds-unit)); font-family:var(--ds-typeface-medium, var(--typeface-medium)); font-weight:500; font-size:calc(2 * var(--ds-unit)); line-height:calc(2.5 * var(--ds-unit)); letter-spacing:-0.02em; text-wrap:balance; }
.birdie-hero mark { padding:0 calc(0.2 * var(--ds-unit)); border-radius:var(--ds-radius); background:var(--brand-highlight); color:var(--c9y-tone-highlight-ink); -webkit-box-decoration-break:clone; box-decoration-break:clone; }
.birdie-title { --ds-display-text-size:28px; }
.birdie-lede { --ds-sf:calc(1.3 * var(--sf, 1)); }
.birdie-cover { display:grid; grid-template-columns:minmax(0,1fr); gap:calc(var(--ds-unit) / 2); align-content:start; min-width:0; color:inherit; text-decoration:none; }
.birdie-cover > span, .birdie-words { display:grid; grid-template-columns:minmax(0,1fr); min-width:0; }
.birdie-cover ds-image, .birdie-mosaic ds-image { display:block; width:100%; }
.birdie-cover:focus-visible { outline:2px solid var(--ds-focus-ring); outline-offset:2px; border-radius:var(--ds-radius); }
.birdie-cover[data-seen] { width:calc(7 * var(--ds-unit)); }
.birdie-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:calc(2 * var(--ds-unit)) var(--ds-unit); }
.birdie-grid[data-columns="4"] { grid-template-columns:repeat(4,minmax(0,1fr)); }
.birdie-grid[data-columns="3"] { grid-template-columns:repeat(3,minmax(0,1fr)); }
.birdie-band { box-sizing:border-box; padding:calc(2 * var(--ds-unit)); border-radius:var(--ds-radius-card); color:var(--brand-band-ink); background:var(--brand-band); --ds-paper:var(--brand-band); --ds-text-color:var(--brand-band-ink); --ds-text-color-muted:color-mix(in srgb, var(--brand-band-ink) 86%, var(--brand-band)); --ds-border-color:color-mix(in srgb, var(--brand-band-ink) 30%, var(--brand-band)); --ds-fill:color-mix(in srgb, var(--brand-band-ink) 12%, var(--brand-band)); --ds-fill-hover:color-mix(in srgb, var(--brand-band-ink) 20%, var(--brand-band)); --ds-button-text-color:var(--brand-band-ink); --button-text-color:var(--brand-band-ink); --ds-button-secondary-fill:var(--ds-fill); }
.birdie-mosaic { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px; border-radius:var(--ds-radius); overflow:hidden; }
.birdie-mosaic ds-image { --ds-radius:0px; }
.birdie-person { display:flex; align-items:flex-end; gap:calc(4px * var(--ds-sf, 1)); min-height:var(--ds-unit); min-width:0; }
.birdie-feature { display:grid; grid-template-columns:minmax(0,3fr) minmax(0,2fr); gap:calc(2 * var(--ds-unit)); align-items:start; }
.birdie-stories { display:grid; grid-template-columns:minmax(0,1fr); }
.birdie-stories > a { display:grid; grid-template-columns:minmax(0,1fr); padding-block:var(--ds-unit); border-top:1px solid var(--ds-border-color); color:inherit; text-decoration:none; }
.birdie-stories > a:first-child { padding-top:0; border-top:0; }
.birdie-box { box-sizing:border-box; display:grid; grid-template-columns:minmax(0,1fr); gap:var(--ds-unit); align-content:start; padding:calc(2 * var(--ds-unit)); border:1px solid var(--ds-text-color); border-radius:var(--ds-radius-card); }
.birdie-record { display:grid; grid-template-columns:minmax(0,7fr) minmax(0,4fr); gap:calc(3 * var(--ds-unit)); align-items:start; }
/* A species: its picture beside the words on a computer, before them on a phone. */
.birdie-record[data-cover] { grid-template-areas:"main cover" "main aside"; grid-template-rows:auto 1fr; gap:calc(2 * var(--ds-unit)) calc(3 * var(--ds-unit)); }
.birdie-record[data-cover] > :nth-child(1) { grid-area:cover; }
.birdie-record[data-cover] > :nth-child(2) { grid-area:main; }
.birdie-record[data-cover] > :nth-child(3) { grid-area:aside; }
.birdie-player { display:grid; grid-template-columns:auto minmax(0,1fr); gap:0 calc(var(--ds-unit) / 2); align-items:end; padding:var(--ds-unit); border-radius:var(--ds-radius-card); background:var(--ds-fill); }
.birdie-player ds-progress { grid-column:1 / -1; }
.birdie-facts { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:var(--ds-unit); }
.birdie-tags { display:flex; flex-wrap:wrap; align-items:flex-end; gap:calc(4px * var(--ds-sf, 1)); }
.birdie-note { display:grid; grid-template-columns:minmax(0,1fr); gap:calc(var(--ds-unit) / 2); margin:0; padding-top:var(--ds-unit); border-top:1px solid var(--ds-border-color); }
.birdie-profile { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:calc(2 * var(--ds-unit)); align-items:end; }
.birdie-profile > ds-image { width:calc(6 * var(--ds-unit)); --ds-radius:50%; }
.birdie-read { max-width:calc(32 * var(--ds-unit)); }
/* Writing on the grid: a square a line, a square between blocks and two before a heading. */
.birdie-writing { display:grid; grid-template-columns:minmax(0,1fr); gap:var(--ds-unit); max-width:calc(32 * var(--ds-unit)); }
.birdie-writing > * { margin:0; line-height:var(--ds-unit); }
.birdie-writing h2 { margin-top:var(--ds-unit); font-family:var(--ds-typeface-medium, var(--typeface-medium)); font-weight:500; font-size:var(--ds-type-size-display); line-height:calc(2 * var(--ds-unit)); }
.birdie-writing ul { padding-inline-start:var(--ds-unit); }
.birdie-aside { display:grid; grid-template-columns:auto minmax(0,1fr); gap:var(--ds-unit); align-items:start; padding:var(--ds-unit); border-radius:var(--ds-radius-card); background:var(--ds-fill); color:inherit; text-decoration:none; }
.birdie-aside ds-image { width:calc(6 * var(--ds-unit)); }
@media(max-width:900px) {
 .birdie-grid, .birdie-grid[data-columns="4"] { grid-template-columns:repeat(3,minmax(0,1fr)); }
 .birdie-feature, .birdie-record { grid-template-columns:minmax(0,1fr); gap:calc(2 * var(--ds-unit)); }
 .birdie-facts { grid-template-columns:repeat(2,minmax(0,1fr)); }
 .birdie-record[data-cover] { grid-template-areas:"cover" "main" "aside"; grid-template-rows:none; }
}
@media(max-width:600px) {
 .birdie-hero { font-size:calc(1.3 * var(--ds-unit)); line-height:calc(1.75 * var(--ds-unit)); }
 .birdie-title { --ds-display-text-size:22px; }
 .birdie-lede { --ds-sf:var(--sf, 1); }
 .birdie-grid, .birdie-grid[data-columns="4"], .birdie-grid[data-columns="3"] { grid-template-columns:repeat(2,minmax(0,1fr)); }
 .birdie-band, .birdie-box { padding:var(--ds-unit); }
 .birdie-aside ds-image { width:calc(4 * var(--ds-unit)); }
 .birdie-when { display:none; }
 .birdie-profile { grid-template-columns:auto minmax(0,1fr); gap:var(--ds-unit); }
 .birdie-profile > ds-image { width:calc(4 * var(--ds-unit)); }
 .birdie-profile > :last-child { grid-column:1 / -1; }
}
</style>`;

// The birds: a name, its scientific name, its family, where it is mostly met and what its picture shows.
type Bird = { id: string; name: string; latin: string; family: string; habitat: string; alt: string; seen: string };
const BIRDS: Bird[] = [
  { id: 'robin', name: 'European robin', latin: 'Erithacus rubecula', family: 'Old World flycatchers', habitat: 'Garden', alt: 'A robin with an orange breast on a twig', seen: '4,812' },
  { id: 'blue-tit', name: 'Eurasian blue tit', latin: 'Cyanistes caeruleus', family: 'Tits', habitat: 'Garden', alt: 'A blue tit with a blue cap on a mossy branch', seen: '3,964' },
  { id: 'great-tit', name: 'Great tit', latin: 'Parus major', family: 'Tits', habitat: 'Garden', alt: 'A great tit with a black head and yellow belly', seen: '3,720' },
  { id: 'blackbird', name: 'Common blackbird', latin: 'Turdus merula', family: 'Thrushes', habitat: 'Garden', alt: 'A black bird with an orange bill and eye ring', seen: '3,518' },
  { id: 'goldfinch', name: 'European goldfinch', latin: 'Carduelis carduelis', family: 'Finches', habitat: 'Garden', alt: 'A goldfinch with a red face and a yellow wing bar', seen: '1,406' },
  { id: 'starling', name: 'Common starling', latin: 'Sturnus vulgaris', family: 'Starlings', habitat: 'Garden', alt: 'A glossy starling speckled with pale spots', seen: '2,233' },
  { id: 'wren', name: 'Eurasian wren', latin: 'Troglodytes troglodytes', family: 'Wrens', habitat: 'Woodland', alt: 'A small brown wren singing with its tail up', seen: '1,187' },
  { id: 'woodpecker', name: 'Great spotted woodpecker', latin: 'Dendrocopos major', family: 'Woodpeckers', habitat: 'Woodland', alt: 'A black and white woodpecker with a red patch, on a trunk', seen: '942' },
  { id: 'jay', name: 'Eurasian jay', latin: 'Garrulus glandarius', family: 'Crows', habitat: 'Woodland', alt: 'A pinkish-brown jay with a blue wing patch', seen: '803' },
  { id: 'long-tailed-tit', name: 'Long-tailed tit', latin: 'Aegithalos caudatus', family: 'Long-tailed tits', habitat: 'Woodland', alt: 'A round white long-tailed tit on a bare branch', seen: '1,025' },
  { id: 'kingfisher', name: 'Common kingfisher', latin: 'Alcedo atthis', family: 'Kingfishers', habitat: 'Wetland', alt: 'A blue and orange kingfisher on a perch', seen: '611' },
  { id: 'heron', name: 'Grey heron', latin: 'Ardea cinerea', family: 'Herons', habitat: 'Wetland', alt: 'A grey heron walking through mist', seen: '1,754' },
  { id: 'swan', name: 'Mute swan', latin: 'Cygnus olor', family: 'Ducks, geese and swans', habitat: 'Wetland', alt: 'A mute swan on dark water', seen: '2,087' },
  { id: 'mallard', name: 'Mallard', latin: 'Anas platyrhynchos', family: 'Ducks, geese and swans', habitat: 'Wetland', alt: 'A mallard drake with a green head on a pond', seen: '3,301' },
  { id: 'crane', name: 'Red-crowned crane', latin: 'Grus japonensis', family: 'Cranes', habitat: 'Wetland', alt: 'A red-crowned crane bending to the snow', seen: '148' },
  { id: 'puffin', name: 'Atlantic puffin', latin: 'Fratercula arctica', family: 'Auks', habitat: 'Coast', alt: 'A puffin with a striped bill against the sea', seen: '276' },
  { id: 'oystercatcher', name: 'Eurasian oystercatcher', latin: 'Haematopus ostralegus', family: 'Oystercatchers', habitat: 'Coast', alt: 'A black and white oystercatcher with a long orange bill', seen: '1,342' },
  { id: 'barn-owl', name: 'Western barn owl', latin: 'Tyto alba', family: 'Barn owls', habitat: 'Farmland', alt: 'A pale barn owl among yellow flowers', seen: '219' },
  { id: 'swallow', name: 'Barn swallow', latin: 'Hirundo rustica', family: 'Swallows', habitat: 'Farmland', alt: 'A swallow with a rust-red throat on a pipe', seen: '1,690' },
  { id: 'kestrel', name: 'Common kestrel', latin: 'Falco tinnunculus', family: 'Falcons', habitat: 'Farmland', alt: 'A kestrel looking over its shoulder', seen: '874' },
];
const bird = (id: string) => BIRDS.find(entry => entry.id === id)!;
const picture = (id: string, ratio = '1 / 1', extra = '') => photo(`birdie-${id}.jpg`, bird(id).alt, ratio, extra);

const muted = (words: string, attrs = '') => text(words, `tone="muted" ${attrs}`);
const small = (words: string, attrs = '') => text(words, `size="small" tone="muted" ${attrs}`);
const big = (words: string, level = 2) => text(words, `size="display" strong wrap class="birdie-title" role="heading" aria-level="${level}"`);
const lead = (words: string) => text(words, 'class="birdie-lede" tone="muted" wrap');
const title = (words: string, level = 3) => text(words, `strong wrap role="heading" aria-level="${level}"`);
const more = (words: string, href: string) => `<ds-button href="${href}"><span>${words}</span>${icon('right')}</ds-button>`;
const head = (words: string, note: string, link = '') => `<div class="site-between"><div class="site-tight">${big(words)}${note ? muted(note, 'wrap') : ''}</div>${link}</div>`;

/** A species as a cover: its picture, its name and one or two quiet lines, the whole of it one link to the species. */
const cover = (id: string, lines: string[] = [bird(id).latin], attrs = '') =>
  `<a class="birdie-cover" href="${at('species')}" ${attrs}>${picture(id)}<span>${text(bird(id).name, 'strong wrap')}${lines.map(line => muted(line, 'wrap')).join('')}</span></a>`;
const person = (name: string, colour: string, extra = '') => `<div class="birdie-person"><ds-avatar initial="${name[0]}" color="${colour}"></ds-avatar>${text(name)}${extra}</div>`;
const story = (kind: string, words: string, by: string, id: string) =>
  `<a class="birdie-cover" href="${at('story')}">${picture(id, '3 / 2')}<span><span class="birdie-tags"><ds-tag>${kind}</ds-tag></span>${text(words, 'strong wrap')}${muted(by, 'wrap')}</span></a>`;

const header = (current: string) => {
  const link = (page: string, words: string) => `<a href="${at(page)}"${page === current ? ' aria-current="page"' : ''}>${words}</a>`;
  return `<ds-header brand="Birdie" href="${at()}" literal>${link('discover', 'Discover')}${link('place', 'Places')}${link('notes', 'Field notes')}<ds-button slot="actions" href="${at('watcher')}">Log in</ds-button><ds-button slot="actions" primary href="${at('watcher')}">Log a sighting</ds-button></ds-header>`;
};
const footer = `<ds-footer slot="footer" brand="Birdie" tagline="Every bird, logged by the people who saw it" literal year="2026" preferences="theme" columns='${JSON.stringify([
  { heading: 'Birds', links: [{ label: 'Discover', href: at('discover') }, { label: 'European robin', href: at('species') }, { label: 'Greylag Marsh', href: at('place') }] },
  { heading: 'Watchers', links: [{ label: 'Life lists', href: at('watcher') }, { label: 'Log a sighting', href: at('watcher') }] },
  { heading: 'Field notes', links: [{ label: 'All stories', href: at('notes') }, { label: 'The cranes that dance on snow', href: at('story') }] },
])}'><span slot="legal" style="min-width:0">${text('A fictional bird guide, drawn by the Birdie library. Photographs from Unsplash.', 'size="small" tone="muted" wrap')}</span></ds-footer>`;
const page = (current: string, content: string) => `${composition}${header(current)}
<ds-page layout="column" measure="56" data-ds-surface>
<div class="site" id="top">
${content}
</div>
${footer}
</ds-page>`;

const letter = `<div class="birdie-box" id="letter">
  ${big('Field notes, every Friday.', 3)}
  ${muted('One bird, one place and the week in sightings. Nothing else.', 'wrap')}
  <ds-input id="letter-email" type="email" label="Email" placeholder="you@example.com"></ds-input>
  <div class="site-actions"><ds-button primary id="letter-join">Sign up</ds-button>${small('Free. Leave any time.')}</div>
  <ds-text id="letter-status" class="site-status" literal role="status" wrap></ds-text>
</div>`;

const home = page('', `
  <section class="site-section" aria-label="Birdie">
    <h1 class="birdie-hero">Watchers have logged <mark>1.82 million</mark> sightings on Birdie, and yesterday alone they met <mark>6,487</mark> birds.</h1>
    <div class="site-actions"><ds-button primary data-size="medium" href="${at('discover')}"><span>Discover birds</span></ds-button><ds-button secondary data-size="medium" href="${at('watcher')}"><span>Start a life list</span></ds-button></div>
  </section>
  <section class="site-section" aria-label="Seen right now">
    <div class="site-between">${title('Seen right now', 2)}${small('Updated as watchers log')}</div>
    <ds-carousel label="Seen right now" literal slide-width="auto" no-dots bleed="end">
      ${[['robin', 'Malmö', '9 seconds ago'], ['heron', 'Utrecht', '14 seconds ago'], ['starling', 'Aarhus', '21 seconds ago'], ['mallard', 'Kyoto', '26 seconds ago'], ['blue-tit', 'Leeds', '31 seconds ago'], ['oystercatcher', 'Bergen', '40 seconds ago'], ['blackbird', 'Lyon', '44 seconds ago'], ['swan', 'Gdańsk', '52 seconds ago'], ['kestrel', 'Porto', '1 minute ago'], ['great-tit', 'Sapporo', '1 minute ago']].map(([id, place, when]) => cover(id, [place, when], 'data-seen')).join('')}
    </ds-carousel>
  </section>
  <section class="site-section site-rule" id="notes">
    ${head('Field notes', 'Stories from hides, hedges and harbour walls, written by the people who were there.', more('All field notes', at('notes')))}
    <div class="birdie-feature">
      <a class="birdie-cover" href="${at('story')}">${photo('birdie-crane-wide.jpg', 'A red-crowned crane bending to the snow', '2 / 1', 'loading="eager"')}<span>${small('8 November 2026')}${text('The cranes that dance on snow', 'size="display" strong wrap role="heading" aria-level="3"')}${muted('Every winter the red-crowned cranes of eastern Hokkaido gather on frozen fields and leap at each other. We spent a week watching them warm up.', 'wrap')}${small('by Aiko Mori')}</span></a>
      <div class="birdie-stories">
        <a href="${at('story')}">${text('Why the robin sings under street lamps', 'strong wrap')}${muted('Light, not love, keeps it up at night.', 'wrap')}</a>
        <a href="${at('story')}">${text('Ten birds you can learn by ear this winter', 'strong wrap')}${muted('Start with the wren. It is louder than you think.', 'wrap')}</a>
        <a href="${at('story')}">${text('The swallows are late. Here is what the logs say', 'strong wrap')}${muted('Four thousand first sightings, drawn on one map.', 'wrap')}</a>
        <a href="${at('story')}">${text('A beginner at the estuary, at low tide', 'strong wrap')}${muted('What to bring, where to stand and when to give up.', 'wrap')}</a>
      </div>
    </div>
  </section>
  <section class="site-section birdie-band" id="lists">
    ${head('Life lists by watchers', 'A life list is every bird one person has met. These three are worth following.', more('See a life list', at('watcher')))}
    <div class="site-three">
      ${[
        ['Balcony birds', '31 species from one fourth-floor balcony', 'Proof that you do not need a forest. Counted with coffee, mostly before nine.', 'Jonas Lind', 'var(--one-orange-pastel)', ['blue-tit', 'great-tit', 'starling', 'blackbird']],
        ['A year on the estuary', '118 species over 46 visits', 'The same mile of mud in every month of the year. February is better than it sounds.', 'Nadia Rahman', 'var(--one-pink-pastel)', ['oystercatcher', 'heron', 'swan', 'mallard']],
        ['Hokkaido in winter', '54 species in nine days', 'Cranes, owls and a great deal of snow. Bring two pairs of gloves.', 'Aiko Mori', 'var(--one-zenith-blue)', ['crane', 'long-tailed-tit', 'great-tit', 'kestrel']],
      ].map(([name, count, words, by, colour, birds]) => `<a class="birdie-cover" href="${at('watcher')}"><div class="birdie-mosaic">${(birds as string[]).map(id => picture(id)).join('')}</div><span>${text(name as string, 'strong wrap')}${muted(count as string, 'wrap')}${muted(words as string, 'wrap')}</span>${person(by as string, colour as string)}</a>`).join('')}
    </div>
  </section>
  <section class="site-section" id="notable">
    ${head('New and notable', 'Birds that turned up somewhere unexpected this week, picked by our editors.', more('Discover more', at('discover')))}
    <div class="birdie-grid" data-columns="4">
      ${cover('kingfisher', ['Kingfishers', 'Back on the city canal for the first time in six years.'])}
      ${cover('barn-owl', ['Barn owls', 'Hunting in daylight over the meadows after a week of rain.'])}
      ${cover('puffin', ['Auks', 'The first birds are ashore on the north cliffs, two weeks early.'])}
      ${cover('long-tailed-tit', ['Long-tailed tits', 'Flocks of twenty are moving through gardens in the north.'])}
    </div>
  </section>
  <section class="site-section site-two site-rule">
    <div class="site-stack">
      ${head('Bird of the day', 'One bird, looked at properly.')}
      <a class="birdie-aside" href="${at('species')}">${picture('wren')}<span class="birdie-words">${small('10 November 2026')}${text('Eurasian wren', 'strong wrap')}${muted('Nine grams of bird and the loudest song in the hedge. Listen for a long trill that ends as if someone shut a door.', 'wrap')}</span></a>
    </div>
    ${letter}
  </section>
  <section class="site-section birdie-band" id="discover">
    ${head('Discover birds by habitat and place', '')}
    <div class="site-stack">
      <div class="birdie-tags">${['Garden', 'Woodland', 'Wetland', 'Coast', 'Farmland', 'Mountain', 'City park', 'Open sea'].map(name => `<ds-button secondary href="${at('discover')}">${name}</ds-button>`).join('')}</div>
      <div class="birdie-tags">${['Greylag Marsh', 'Wadden Sea', 'Hokkaido', 'Shetland', 'Camargue', 'Öland', 'Lake Biwa', 'Skagen'].map(name => `<ds-button secondary href="${at('place')}">${name}</ds-button>`).join('')}</div>
    </div>
  </section>`);

const discover = page('discover', `
  <section class="site-section">
    <div class="site-tight"><h1 class="birdie-hero">Discover</h1>${lead('Twenty birds to begin with, ordered by how often they were met this week.')}</div>
    <div class="site-between"><ds-tabs wrap role="group" aria-label="Habitat">${['All', 'Garden', 'Woodland', 'Wetland', 'Coast', 'Farmland'].map((name, index) => `<ds-button control="host" data-habitat="${name.toLowerCase()}" aria-pressed="${index === 0}"${index === 0 ? ' active' : ''}>${name}</ds-button>`).join('')}</ds-tabs><ds-select><select id="birdie-sort" aria-label="Order"><option selected>Most seen this week</option><option>Newly arrived</option><option>Rarest</option><option>A to Z</option></select></ds-select></div>
    <div class="birdie-grid" id="birdie-birds">
      ${[...BIRDS].sort((a, b) => Number(b.seen.replace(',', '')) - Number(a.seen.replace(',', ''))).map(entry => cover(entry.id, [entry.latin, `${entry.seen} sightings this week`], `data-bird="${entry.habitat.toLowerCase()}"`)).join('')}
    </div>
  </section>
  <section class="site-section birdie-band">
    ${head('Not sure what you saw?', 'Describe it to the people who will know. Most birds are named within the hour.', `<ds-button secondary href="${at('watcher')}"><span>Ask the watchers</span></ds-button>`)}
  </section>`);

const call = (number: number, name: string, when: string, length: string) =>
  `<ds-row interactive data-call="${name}" data-length="${length}">${muted(String(number), 'style="min-width:var(--ds-unit)"')}<ds-text class="ds-row__name" literal>${name}</ds-text>${muted(when, 'class="birdie-when"')}<ds-text class="ds-row__value" literal>${length}</ds-text></ds-row>`;
const note = (words: string, name: string, colour: string, where: string) => `<figure class="birdie-note">${text(words, 'wrap')}<figcaption>${person(name, colour, small(where))}</figcaption></figure>`;

const species = page('species', `
  <section class="birdie-record" data-cover>
    ${picture('robin', '1 / 1', 'loading="eager"')}
    <div class="site-section">
      <div class="site-tight"><h1 class="birdie-hero">European robin</h1>${muted('Erithacus rubecula, one of the Old World flycatchers', 'wrap')}</div>
      <div class="site-stack">
        <div class="birdie-player"><ds-button primary icon id="birdie-play" aria-label="Play" aria-pressed="false">${icon('play-alt')}</ds-button><div class="site-between">${text('Spring song', 'strong id="birdie-playing"')}${muted('0:42', 'id="birdie-length"')}</div><ds-progress id="birdie-progress" value="0" label="Played"></ds-progress></div>
        <ds-list heading="Songs and calls" literal id="birdie-calls">
          ${call(1, 'Spring song', 'March to June', '0:42')}
          ${call(2, 'Autumn song', 'September to December', '0:38')}
          ${call(3, 'Alarm, a dry tick', 'All year', '0:09')}
          ${call(4, 'Thin call for a hawk overhead', 'All year', '0:06')}
          ${call(5, 'Song at night under a lamp', 'Winter', '1:14')}
          ${call(6, 'Chicks begging in the nest', 'April to July', '0:21')}
        </ds-list>
        <div class="site-actions"><ds-button primary data-size="medium" id="birdie-add" aria-pressed="false"><span>Add to my life list</span></ds-button><ds-button secondary data-size="medium"><span>Want to see</span></ds-button></div>
        <ds-text id="birdie-added" class="site-status" literal role="status" wrap></ds-text>
      </div>
      <div class="birdie-writing">
        <p>The robin is the bird that comes to see what you are doing. Dig a bed, turn a compost heap or sit still on a bench, and one will arrive within minutes to check the ground you have disturbed.</p>
        <p>Both sexes wear the orange breast and both sing, the female mostly in autumn when each bird holds a winter territory alone. The song is thin, sweet and a little sad, and it is one of the few you can hear in December.</p>
        <p>Robins are fierce about their patch. The orange is a warning, and a stuffed robin put in a garden will be attacked by the owner within the hour.</p>
      </div>
      <div class="birdie-facts"><ds-stat figure="14 cm" label="Length" caption="Bill to tail" literal></ds-stat><ds-stat figure="21 cm" label="Wingspan" caption="About a hand" literal></ds-stat><ds-stat figure="18 g" label="Weight" caption="Two sheets of paper" literal></ds-stat><ds-stat figure="5 or 6" label="Eggs" caption="Two broods a year" literal></ds-stat></div>
      <div class="birdie-tags">${['Garden', 'Woodland', 'Resident', 'Songbird', 'Sings in winter', 'Easy to see'].map(name => `<ds-tag>${name}</ds-tag>`).join('')}</div>
    </div>
    <aside class="site-section">
      <div class="site-tight">${text('On 12,480 life lists', 'strong')}<ds-avatar-group role="group" aria-label="Watchers who have met a robin"><ds-avatar initial="I" color="var(--one-zenith-blue)" outlined></ds-avatar><ds-avatar initial="J" color="var(--one-orange-pastel)" outlined></ds-avatar><ds-avatar initial="N" color="var(--one-pink-pastel)" outlined></ds-avatar><ds-avatar initial="A" color="var(--one-apple-green-pastel)" outlined></ds-avatar><ds-avatar initial="T" color="var(--one-yellow-pastel)" outlined></ds-avatar></ds-avatar-group></div>
      <div class="site-stack">
        ${note('It sat on the fork handle while I dug the potatoes, and left when I did.', 'Ingrid Solberg', 'var(--one-zenith-blue)', 'Bergen')}
        ${note('Singing at four in the morning by the tram stop. I thought it was a nightingale.', 'Jonas Lind', 'var(--one-orange-pastel)', 'Gothenburg')}
        ${note('First bird on my list and still the one I look for.', 'Nadia Rahman', 'var(--one-pink-pastel)', 'Leeds')}
      </div>
      <ds-list heading="More garden birds" literal>
        ${['blue-tit', 'great-tit', 'blackbird', 'goldfinch'].map(id => `<ds-row href="${at('species')}"><ds-avatar shape="square" src="/examples/images/birdie-${id}.jpg" label="${bird(id).name}"></ds-avatar><ds-text class="ds-row__name" literal>${bird(id).name}</ds-text><ds-text class="ds-row__value" literal>${bird(id).seen}</ds-text></ds-row>`).join('')}
      </ds-list>
      <a class="birdie-aside" href="${at('place')}">${picture('heron')}<span class="birdie-words">${small('Seen most at')}${text('Greylag Marsh', 'strong wrap')}${muted('West Jutland, Denmark', 'wrap')}</span></a>
    </aside>
  </section>`);

const sighting = (id: string, who: string, when: string) => `<ds-row href="${at('species')}"><ds-avatar shape="square" src="/examples/images/birdie-${id}.jpg" label="${bird(id).name}"></ds-avatar><ds-text class="ds-row__name" literal>${bird(id).name}</ds-text>${muted(who, 'class="birdie-when"')}<ds-text class="ds-row__value" literal>${when}</ds-text></ds-row>`;

const place = page('place', `
  <section class="site-section">
    ${photo('birdie-marsh.jpg', 'A grey heron standing in shallow water, spoonbills behind it', '8 / 3', 'loading="eager"')}
    <div class="site-between"><div class="site-tight"><h1 class="birdie-hero">Greylag Marsh</h1>${muted('West Jutland, Denmark. Reedbed, wet meadow and a mile of sea wall.', 'wrap')}</div><div class="site-actions"><ds-button primary data-size="medium" id="birdie-follow" aria-pressed="false"><span>Follow this place</span></ds-button></div></div>
  </section>
  <section class="birdie-record">
    <div class="site-section">
      <div class="site-between">${title('Birds met here', 2)}${small('214 species since 2019')}</div>
      <div class="birdie-grid" data-columns="3">
        ${[['heron', '1,204 sightings'], ['swan', '986 sightings'], ['mallard', '2,310 sightings'], ['oystercatcher', '871 sightings'], ['swallow', '640 sightings'], ['starling', '1,518 sightings'], ['kestrel', '402 sightings'], ['barn-owl', '96 sightings'], ['kingfisher', '58 sightings']].map(([id, count]) => cover(id, [bird(id).latin, count])).join('')}
      </div>
    </div>
    <aside class="site-section">
      <div class="birdie-writing">
        <p>Greylag Marsh is flat, wet and open to the wind, which is why the birds like it. Come at dawn in late September, when the starlings leave the reeds in one long ribbon.</p>
        <p>Two hides, one path and no café. The sea wall is passable in ordinary shoes; the meadow is not.</p>
      </div>
      <div class="birdie-facts" style="grid-template-columns:repeat(2,minmax(0,1fr))"><ds-stat figure="214" label="Species" caption="Logged since 2019" literal></ds-stat><ds-stat figure="1,870" label="Watchers" caption="Have logged here" literal></ds-stat></div>
      <ds-list heading="Today" literal>
        ${sighting('heron', 'Ingrid Solberg', '07:12')}
        ${sighting('kestrel', 'Jonas Lind', '07:40')}
        ${sighting('oystercatcher', 'Nadia Rahman', '08:05')}
        ${sighting('kingfisher', 'Tomás Rivera', '08:31')}
      </ds-list>
      <ds-list heading="Best months" literal>
        <ds-row><ds-text class="ds-row__name" literal>April and May</ds-text><ds-text class="ds-row__value" literal>Waders passing north</ds-text></ds-row>
        <ds-row><ds-text class="ds-row__name" literal>September</ds-text><ds-text class="ds-row__value" literal>Starling roosts</ds-text></ds-row>
        <ds-row><ds-text class="ds-row__name" literal>January</ds-text><ds-text class="ds-row__value" literal>Geese and owls</ds-text></ds-row>
      </ds-list>
    </aside>
  </section>`);

const tab = (name: string, controls: string, active: boolean) => `<ds-button control="host" role="tab" aria-controls="${controls}" aria-selected="${active}"${active ? ' active' : ''}>${name}</ds-button>`;
const follow = (name: string, words: string, colour: string) => `<ds-row href="${at('watcher')}"><ds-avatar initial="${name[0]}" color="${colour}"></ds-avatar><ds-text class="ds-row__name" literal>${name}</ds-text><ds-text class="ds-row__value" literal>${words}</ds-text></ds-row>`;

const watcher = page('watcher', `
  <section class="site-section">
    <div class="birdie-profile">
      ${photo('birdie-long-tailed-tit.jpg', 'Ingrid’s picture: a long-tailed tit', '1 / 1', 'loading="eager"')}
      <div class="site-tight"><h1 class="birdie-hero">Ingrid Solberg</h1>${muted('Bergen, Norway. Watching since 2019, mostly before work and mostly in the rain.', 'wrap')}</div>
      <div class="site-actions"><ds-button primary data-size="medium" id="birdie-follow" aria-pressed="false"><span>Follow Ingrid</span></ds-button></div>
    </div>
    <ds-tabs text wrap aria-label="Ingrid’s pages" data-switch="watcher">${tab('Life list 214', 'birdie-life', true)}${tab('Want to see 37', 'birdie-want', false)}${tab('Following 58', 'birdie-following', false)}</ds-tabs>
    <div id="birdie-life" role="tabpanel" class="birdie-grid">
      ${[['robin', 'First met 3 March 2019', 'Bergen'], ['oystercatcher', '14 April 2019', 'Greylag Marsh'], ['heron', '14 April 2019', 'Greylag Marsh'], ['swallow', '2 May 2019', 'Voss'], ['wren', '19 October 2019', 'Bergen'], ['kestrel', '7 June 2020', 'Jæren'], ['goldfinch', '30 August 2020', 'Bergen'], ['woodpecker', '11 January 2021', 'Fana'], ['jay', '11 January 2021', 'Fana'], ['swan', '5 March 2022', 'Stavanger'], ['starling', '24 September 2023', 'Greylag Marsh'], ['kingfisher', '9 October 2025', 'Greylag Marsh']].map(([id, when, where]) => cover(id, [when, where])).join('')}
    </div>
    <div id="birdie-want" role="tabpanel" class="birdie-grid" hidden>
      ${cover('puffin', ['Runde, in June'])}${cover('crane', ['Hokkaido, one winter'])}${cover('barn-owl', ['Anywhere, at dusk'])}${cover('long-tailed-tit', ['The white-headed ones, up north'])}
    </div>
    <div id="birdie-following" role="tabpanel" class="birdie-read" hidden>
      <ds-list heading="Watchers" literal>${follow('Jonas Lind', '31 species', 'var(--one-orange-pastel)')}${follow('Nadia Rahman', '118 species', 'var(--one-pink-pastel)')}${follow('Aiko Mori', '402 species', 'var(--one-apple-green-pastel)')}${follow('Tomás Rivera', '266 species', 'var(--one-yellow-pastel)')}</ds-list>
    </div>
  </section>
  <section class="site-section site-two site-rule">
    <div class="site-stack">${title('What Ingrid wrote', 2)}
      ${note('Kingfisher, at last. Six years of looking at that ditch and it was there for four seconds.', 'Ingrid Solberg', 'var(--one-zenith-blue)', '9 October 2025')}
      ${note('The starlings left the reeds at 07:02. I counted until I could not.', 'Ingrid Solberg', 'var(--one-zenith-blue)', '24 September 2023')}
    </div>
    <div class="birdie-box">${big('Keep a list of your own.', 3)}${muted('Log the birds you meet, with the day and the place. Your list is yours, and it is free.', 'wrap')}<div class="site-actions"><ds-button primary data-size="medium" href="${at('discover')}"><span>Start with a robin</span></ds-button></div></div>
  </section>`);

const notes = page('notes', `
  <section class="site-section">
    <div class="site-tight"><h1 class="birdie-hero">Field notes</h1>${lead('Stories from hides, hedges and harbour walls.')}</div>
    <a class="birdie-cover" href="${at('story')}">${photo('birdie-crane-wide.jpg', 'A red-crowned crane bending to the snow', '2 / 1', 'loading="eager"')}<span><span class="birdie-tags"><ds-tag>Feature</ds-tag></span>${text('The cranes that dance on snow', 'size="display" strong wrap role="heading" aria-level="2"')}${muted('Every winter the red-crowned cranes of eastern Hokkaido gather on frozen fields and leap at each other. We spent a week watching them warm up.', 'wrap')}${small('by Aiko Mori, 8 November 2026')}</span></a>
  </section>
  <section class="site-section site-rule">
    ${head('This week', '')}
    <div class="birdie-grid" data-columns="3">
      ${story('Feature', 'Why the robin sings under street lamps', 'by Jonas Lind', 'robin')}
      ${story('List', 'Ten birds you can learn by ear this winter', 'by Nadia Rahman', 'wren')}
      ${story('Season', 'The swallows are late. Here is what the logs say', 'by Tomás Rivera', 'swallow')}
      ${story('Guide', 'A beginner at the estuary, at low tide', 'by Ingrid Solberg', 'oystercatcher')}
      ${story('Feature', 'The owl that hunts by day when it rains for a week', 'by Aiko Mori', 'barn-owl')}
      ${story('Guide', 'How to keep a life list you still like in ten years', 'by Nadia Rahman', 'goldfinch')}
    </div>
  </section>
  <section class="site-section site-two site-rule">
    <div class="site-stack">
      ${head('Bird of the day', 'One bird, looked at properly.')}
      <a class="birdie-aside" href="${at('species')}">${picture('wren')}<span class="birdie-words">${small('10 November 2026')}${text('Eurasian wren', 'strong wrap')}${muted('Nine grams of bird and the loudest song in the hedge.', 'wrap')}</span></a>
      <a class="birdie-aside" href="${at('species')}">${picture('kingfisher')}<span class="birdie-words">${small('9 November 2026')}${text('Common kingfisher', 'strong wrap')}${muted('A blue line over slow water, gone before you have said its name.', 'wrap')}</span></a>
    </div>
    ${letter}
  </section>`);

const storyPage = page('notes', `
  <article class="site-section">
    <div class="site-stack birdie-read">
      <span class="birdie-tags"><ds-tag>Feature</ds-tag></span>
      <h1 class="birdie-hero">The cranes that dance on snow</h1>
      ${lead('Every winter the red-crowned cranes of eastern Hokkaido gather on frozen fields and leap at each other. We spent a week watching them warm up.')}
      ${person('Aiko Mori', 'var(--one-apple-green-pastel)', small('8 November 2026, 7 minutes'))}
    </div>
    <figure class="site-slide">${photo('birdie-crane-wide.jpg', 'A red-crowned crane bending to the snow', '2 / 1', 'loading="eager"')}${muted('A crane feeding at first light, minus eighteen degrees.', 'wrap')}</figure>
    <div class="birdie-writing">
      <p>You hear them before you see them. A pair calls in unison, one bird starting and the other finishing the same phrase, and the sound carries a mile across the snow.</p>
      <p>By eight the field holds sixty cranes. They stand as tall as a ten-year-old, white with black necks and a small red cap that is bare skin, not feathers. In the cold they tuck one leg up and look, from a distance, like a field of tilted lamps.</p>
      <h2>Why they dance</h2>
      <p>The dance looks like joy and is partly that. A bird bows, jumps with its wings half open, lands, and throws a stick or a clump of snow in the air. Its partner answers. Pairs stay together for years, and the dance is how they keep it so.</p>
      <p>Young birds dance too, badly, with nobody in particular. It is how they learn, and it is the best thing on the field.</p>
      <h2>Almost gone</h2>
      <p>A century ago the cranes of Hokkaido were thought to be extinct. A few dozen had survived in a marsh, and in hard winters the farmers nearby began putting out grain. They have not stopped since, and well over a thousand cranes now live on the island.</p>
      <h2>If you go</h2>
      <ul><li>Come in January or February, and be at the field before sunrise.</li><li>Stand still. The birds mind movement far more than they mind people.</li><li>Dress for standing, not for walking. It is colder than you think.</li></ul>
    </div>
    <a class="birdie-aside birdie-read" href="${at('species')}">${picture('crane')}<span class="birdie-words">${small('In this story')}${text('Red-crowned crane', 'strong wrap')}${muted('Grus japonensis. On 148 life lists this week.', 'wrap')}</span></a>
  </article>
  <section class="site-section site-rule">
    ${head('More field notes', '', more('All field notes', at('notes')))}
    <div class="birdie-grid" data-columns="3">
      ${story('Feature', 'Why the robin sings under street lamps', 'by Jonas Lind', 'robin')}
      ${story('List', 'Ten birds you can learn by ear this winter', 'by Nadia Rahman', 'wren')}
      ${story('Season', 'The swallows are late. Here is what the logs say', 'by Tomás Rivera', 'swallow')}
    </div>
  </section>`);

// What a page does when it runs scripts: tabs show their panel, Discover narrows to a habitat, a
// call plays in the player, and the buttons that stay on say so. Each part looks for its own
// pieces, so the seven pages share one script.
const script = `${choose}
document.querySelectorAll('[data-habitat]').forEach(button => button.addEventListener('click', () => {
  choose('[data-habitat]', button);
  document.querySelectorAll('[data-bird]').forEach(cover => { cover.hidden = button.dataset.habitat !== 'all' && cover.dataset.bird !== button.dataset.habitat; });
}));
document.querySelectorAll('ds-tabs[data-switch]').forEach(tabs => tabs.addEventListener('click', event => {
  const target = event.target.closest('ds-button[role="tab"]');
  if (!target) return;
  tabs.querySelectorAll('ds-button[role="tab"]').forEach(tab => {
    const on = tab === target;
    tab.toggleAttribute('active', on);
    tab.setAttribute('aria-selected', String(on));
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
  });
}));
const play = document.querySelector('#birdie-play');
if (play) {
  const progress = document.querySelector('#birdie-progress');
  const set = on => { play.setAttribute('aria-pressed', String(on)); play.setAttribute('aria-label', on ? 'Pause' : 'Play'); play.querySelector('ds-icon').setAttribute('type', on ? 'pause' : 'play-alt'); progress.value = on ? 0.35 : 0; };
  play.addEventListener('click', () => set(play.getAttribute('aria-pressed') !== 'true'));
  document.querySelectorAll('[data-call]').forEach(row => row.addEventListener('ds-row-press', () => {
    document.querySelector('#birdie-playing').textContent = row.dataset.call;
    document.querySelector('#birdie-length').textContent = row.dataset.length;
    set(true);
  }));
}
const stay = (selector, on, off, status) => document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
  const pressed = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(pressed));
  button.querySelector('span').textContent = pressed ? on : off;
  if (status) document.querySelector(status).textContent = pressed ? 'On your life list, dated today. Nothing is saved in this demo.' : '';
}));
stay('#birdie-add', 'On my life list', 'Add to my life list', '#birdie-added');
stay('#birdie-follow', 'Following', document.querySelector('#birdie-follow span')?.textContent);
document.querySelector('#letter-join')?.addEventListener('click', () => {
  const email = document.querySelector('#letter-email').value.trim();
  document.querySelector('#letter-status').textContent = /.+@.+\\..+/.test(email) ? 'Thank you. The first notes arrive on Friday. Nothing is sent in this demo.' : 'Write an email address first.';
});`;

const example = (name: string, use: string, html: string): LayoutExample => ({ name, use, height: 900, library: library('birdie'), html, script });

/** Birdie's pages by their example id; the labels are in shared/doc-examples.ts. */
export const BIRDIE_EXAMPLES: Record<string, LayoutExample> = {
  birdie: example('Birdie', 'The front page of a bird guide kept by its watchers, in the Birdie library: a sentence of live figures, a strip of sightings, stories, life lists and green bands.', home),
  'birdie-discover': example('Birdie · Discover', 'Birdie’s catalogue: every species as a square cover, narrowed by habitat and ordered by sightings.', discover),
  'birdie-species': example('Birdie · Species', 'One species in Birdie: its songs and calls in a player, what it is like, its measures, and the watchers who met it.', species),
  'birdie-place': example('Birdie · Place', 'A place in Birdie: its banner, the birds met there, today’s sightings and its best months.', place),
  'birdie-watcher': example('Birdie · Watcher', 'A watcher’s page in Birdie: their life list as covers with the day and place of each first meeting.', watcher),
  'birdie-notes': example('Birdie · Field notes', 'Birdie’s editorial front: a feature, the week’s stories, the bird of the day and a letter to sign up for.', notes),
  'birdie-story': example('Birdie · Story', 'One story in Birdie’s Field notes: a headline, a wide photograph, the writing in a reading column and the bird it is about.', storyPage),
};
