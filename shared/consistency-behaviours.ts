export interface Turn { kicker?: string; title: string; src?: string; alt?: string }
export type TurnOrder = 'shuffled' | 'in-order';

export function turnQueue(count: number, current: number, order: TurnOrder, random: () => number = Math.random): number[] {
  const rest = Array.from({ length: count }, (_, index) => index).filter(index => index !== current);
  if (order === 'in-order') return [...rest.filter(index => index > current), ...rest.filter(index => index < current)];
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [rest[i], rest[j]] = [rest[j]!, rest[i]!]; }
  return rest;
}

export function countingText(to: string, progress: number, random: () => number = Math.random): string {
  const settled = Math.floor(Math.min(1, Math.max(0, progress)) * to.length);
  return [...to].map((char, index) => index < settled || !/\d/.test(char) ? char : String(Math.floor(random() * 10))).join('');
}

export function readTurns(source: string | undefined): Turn[] {
  try {
    const value: unknown = JSON.parse(source ?? '');
    return Array.isArray(value) ? value.filter((turn): turn is Turn => Boolean(turn) && typeof turn === 'object' && typeof (turn as Turn).title === 'string') : [];
  } catch { return []; }
}

function leaf(slot: Element | null): HTMLElement | null {
  let node = slot as HTMLElement | null;
  while (node && node.children.length === 1 && !Array.from(node.childNodes).some(child => child.nodeType === 3 && child.textContent?.trim())) node = node.children[0] as HTMLElement;
  return node;
}

const COUNT_MS = 600;

export function restartTurnLine(hero: Pick<Element, 'getAnimations'>) {
  for (const animation of hero.getAnimations({ subtree: true })) if ((animation as CSSAnimation).animationName === 'c9y-turn') animation.currentTime = 0;
}

function bindHero(hero: HTMLElement) {
  const kicker = leaf(hero.querySelector('[data-slot="kicker"]')), title = leaf(hero.querySelector('[data-slot="title"]'));
  const picture = hero.querySelector<HTMLImageElement>('[data-slot="picture"] img');
  if (!title) return;
  const turns: Turn[] = [{ ...(kicker ? { kicker: kicker.textContent ?? '' } : {}), title: title.textContent ?? '', ...(picture ? { src: picture.getAttribute('src') ?? '', alt: picture.alt } : {}) }, ...readTurns(hero.dataset.turns)];
  if (turns.length < 2) return;
  const every = Math.max(2, Number(hero.dataset.turnEvery) || 8) * 1000, order: TurnOrder = hero.dataset.turnOrder === 'in-order' ? 'in-order' : 'shuffled';
  let current = 0, queue: number[] = [], timer = 0, counting = 0, shown = 0;
  hero.style.setProperty('--c9y-turn-every', `${every}ms`);
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
      const next = new Image();
      const swap = () => { if (ticket !== shown) return; picture.removeAttribute('srcset'); picture.src = turn.src!; picture.alt = turn.alt ?? ''; };
      next.src = turn.src;
      next.decode().then(swap, swap);
    }
  };
  const next = () => { if (!queue.length) queue = turnQueue(turns.length, current, order); show(queue.shift()!); };
  const wait = () => { clearTimeout(timer); restartTurnLine(hero); if (!document.hidden) timer = window.setTimeout(() => { next(); wait(); }, every); };
  const press = () => { next(); wait(); };
  title.tabIndex = 0;
  title.style.cursor = 'pointer';
  title.addEventListener('click', press);
  title.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); press(); } });
  document.addEventListener('visibilitychange', wait);
  wait();
}

interface ThemeRuntime { theme(): 'light' | 'dark'; set(mode: 'light' | 'dark' | 'system'): void }
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
