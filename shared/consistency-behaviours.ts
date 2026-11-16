/**
 * What a published native page's blocks do by themselves. One small module with no imports, served by the platform
 * at `/_c9y/behaviours.js` and loaded only by a page whose document holds a behaviour. The editor's canvas runs no
 * script, and a reader without scripts gets none either: both see every block as it is written.
 *
 * A hero with turns (`data-turns`, written by the renderer) changes to the next one every `data-turn-every` seconds
 * and when its title is pressed: the kicker and the title take the turn's words, a kicker of digits counting to its
 * new number, and the picture follows once it has loaded. The hero as written is the first turn. Nothing changes
 * while the page is hidden, and reduced motion changes the words at once.
 *
 * A footer's theme control (`data-c9y-theme`) switches the page between light and dark through Design system 1's
 * theme runtime (`window.DS_ONE_THEME`, which the platform starts in the page's head before the first paint) and
 * names the theme the page is in. Without that runtime the control stays hidden.
 */
export interface Turn { kicker?: string; title: string; src?: string; alt?: string }
export type TurnOrder = 'shuffled' | 'in-order';

/** The turns to come after `current`: every other one, shuffled, or as written from the one after it. */
export function turnQueue(count: number, current: number, order: TurnOrder, random: () => number = Math.random): number[] {
  const rest = Array.from({ length: count }, (_, index) => index).filter(index => index !== current);
  if (order === 'in-order') return [...rest.filter(index => index > current), ...rest.filter(index => index < current)];
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [rest[i], rest[j]] = [rest[j]!, rest[i]!]; }
  return rest;
}

/** Digits on their way to `to`: its places settle from the left as `progress` goes from 0 to 1, the rest still counting. */
export function countingText(to: string, progress: number, random: () => number = Math.random): string {
  const settled = Math.floor(Math.min(1, Math.max(0, progress)) * to.length);
  return [...to].map((char, index) => index < settled || !/\d/.test(char) ? char : String(Math.floor(random() * 10))).join('');
}

/** The turns a hero carries, or none when the data is not a list of them. */
export function readTurns(source: string | undefined): Turn[] {
  try {
    const value: unknown = JSON.parse(source ?? '');
    return Array.isArray(value) ? value.filter((turn): turn is Turn => Boolean(turn) && typeof turn === 'object' && typeof (turn as Turn).title === 'string') : [];
  } catch { return []; }
}

/** The element that holds a slot's words: the deepest one that is its parent's only content, so a link or a heading stays. */
function leaf(slot: Element | null): HTMLElement | null {
  let node = slot as HTMLElement | null;
  while (node && node.children.length === 1 && !Array.from(node.childNodes).some(child => child.nodeType === 3 && child.textContent?.trim())) node = node.children[0] as HTMLElement;
  return node;
}

const COUNT_MS = 600;

function bindHero(hero: HTMLElement) {
  const kicker = leaf(hero.querySelector('[data-slot="kicker"]')), title = leaf(hero.querySelector('[data-slot="title"]'));
  const picture = hero.querySelector<HTMLImageElement>('[data-slot="picture"] img');
  if (!title) return;
  const turns: Turn[] = [{ ...(kicker ? { kicker: kicker.textContent ?? '' } : {}), title: title.textContent ?? '', ...(picture ? { src: picture.getAttribute('src') ?? '', alt: picture.alt } : {}) }, ...readTurns(hero.dataset.turns)];
  if (turns.length < 2) return;
  const every = Math.max(2, Number(hero.dataset.turnEvery) || 8) * 1000, order: TurnOrder = hero.dataset.turnOrder === 'in-order' ? 'in-order' : 'shuffled';
  let current = 0, queue: number[] = [], timer = 0, counting = 0, shown = 0;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = (to: string) => {
    cancelAnimationFrame(counting);
    if (!kicker) return;
    if (still() || !/\d/.test(to)) { kicker.textContent = to; return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = (now - start) / COUNT_MS;
      kicker.textContent = countingText(to, progress);
      if (progress < 1) counting = requestAnimationFrame(step); else kicker.textContent = to;
    };
    counting = requestAnimationFrame(step);
  };
  const show = (index: number) => {
    const turn = turns[index]!, ticket = ++shown; current = index;
    if (turn.kicker !== undefined) count(turn.kicker);
    title.textContent = turn.title;
    if (picture && turn.src && turn.src !== picture.getAttribute('src')) {
      // The picture follows once it can be drawn, and only if no later turn has been shown since.
      const next = new Image();
      const swap = () => { if (ticket !== shown) return; picture.removeAttribute('srcset'); picture.src = turn.src!; picture.alt = turn.alt ?? ''; };
      next.src = turn.src;
      next.decode().then(swap, swap);
    }
  };
  const next = () => { if (!queue.length) queue = turnQueue(turns.length, current, order); show(queue.shift()!); };
  const wait = () => { clearTimeout(timer); if (!document.hidden) timer = window.setTimeout(() => { next(); wait(); }, every); };
  const press = () => { next(); wait(); };
  title.tabIndex = 0;
  title.style.cursor = 'pointer';
  title.addEventListener('click', press);
  title.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); press(); } });
  document.addEventListener('visibilitychange', wait);
  wait();
}

/** Design system 1's theme runtime, as much of it as the control uses (`DS1/0-face/theme-bootstrap.js`). */
interface ThemeRuntime { theme(): 'light' | 'dark'; set(mode: 'light' | 'dark' | 'system'): void }
/** The theme a press goes to. */
export const otherTheme = (theme: 'light' | 'dark'): 'light' | 'dark' => theme === 'dark' ? 'light' : 'dark';

function bindTheme(button: HTMLElement) {
  const runtime = (window as unknown as { DS_ONE_THEME?: ThemeRuntime }).DS_ONE_THEME;
  if (!runtime) return;
  const paint = () => { const theme = runtime.theme(); button.textContent = (theme === 'dark' ? button.dataset.dark : button.dataset.light) ?? theme; button.setAttribute('aria-pressed', String(theme === 'dark')); };
  button.addEventListener('click', () => runtime.set(otherTheme(runtime.theme())));
  window.addEventListener('theme-changed', paint);
  paint();
  button.hidden = false;
}

/** Starts every behaviour the page holds; a block already started is left alone. */
export function startBehaviours(root: ParentNode = document) {
  for (const button of root.querySelectorAll<HTMLElement>('[data-c9y-theme]')) {
    if (button.dataset.c9yBehaving !== undefined) continue;
    button.dataset.c9yBehaving = '';
    bindTheme(button);
  }
  for (const hero of root.querySelectorAll<HTMLElement>('[data-section="hero"][data-turns]')) {
    if (hero.dataset.c9yBehaving !== undefined) continue;
    hero.dataset.c9yBehaving = '';
    bindHero(hero);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => startBehaviours(), { once: true });
  else startBehaviours();
}
