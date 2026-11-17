export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (value: number, most: number) => Math.min(Math.max(value, 0), most);

function channel(part: string, scale: number): number | null {
  if (part === 'none') return 0;
  const number = Number.parseFloat(part);
  if (!Number.isFinite(number)) return null;
  return clamp(part.endsWith('%') ? (number / 100) * scale : number, scale);
}

function parts(inside: string): { channels: string[]; alpha: string | null } {
  const [main, slashed] = inside.split('/');
  const channels = main.trim().split(/[\s,]+/).filter(Boolean);
  const alpha = slashed !== undefined ? slashed.trim() : channels.length > 3 ? channels.pop() ?? null : null;
  return { channels, alpha };
}

export function parseColour(value: string): Rgba | null {
  const colour = value.trim().toLowerCase();
  if (colour === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = colour.match(/^#([0-9a-f]{3,8})$/)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const long = hex.length <= 4 ? [...hex].map(digit => digit + digit).join('') : hex;
    const byte = (index: number) => Number.parseInt(long.slice(index * 2, index * 2 + 2), 16);
    return { r: byte(0), g: byte(1), b: byte(2), a: long.length === 8 ? byte(3) / 255 : 1 };
  }
  const rgb = colour.match(/^rgba?\((.*)\)$/)?.[1];
  if (rgb !== undefined) {
    const { channels, alpha } = parts(rgb);
    if (channels.length !== 3) return null;
    const [r, g, b] = channels.map(part => channel(part, 255));
    const a = alpha === null ? 1 : channel(alpha, 1);
    return r === null || g === null || b === null || a === null ? null : { r, g, b, a };
  }
  const srgb = colour.match(/^color\(srgb\s+(.*)\)$/)?.[1];
  if (srgb !== undefined) {
    const { channels, alpha } = parts(srgb);
    if (channels.length !== 3) return null;
    const [r, g, b] = channels.map(part => channel(part, 1));
    const a = alpha === null ? 1 : channel(alpha, 1);
    return r === null || g === null || b === null || a === null ? null : { r: r * 255, g: g * 255, b: b * 255, a };
  }
  return null;
}

export function hexOf(colour: Rgba): string | null {
  const alpha = Math.round(colour.a * 255);
  if (alpha <= 0) return null;
  const two = (value: number) => Math.round(clamp(value, 255)).toString(16).padStart(2, '0');
  return `#${two(colour.r)}${two(colour.g)}${two(colour.b)}${alpha < 255 ? two(alpha) : ''}`;
}

export function tallyColours(elements: Iterable<Iterable<string>>): { hex: string; elements: number }[] {
  const counts = new Map<string, number>();
  for (const colours of elements) for (const hex of new Set(colours)) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  return [...counts].map(([hex, elements]) => ({ hex, elements })).sort((a, b) => b.elements - a.elements || a.hex.localeCompare(b.hex));
}

export function addTallies(into: Map<string, number>, tally: { hex: string; elements: number }[]): Map<string, number> {
  for (const { hex, elements } of tally) into.set(hex, (into.get(hex) ?? 0) + elements);
  return into;
}

const ORDER = ['--ds-', '--one-'];
const rank = (name: string) => {
  const index = ORDER.findIndex(prefix => name.startsWith(prefix));
  return index < 0 ? ORDER.length : index;
};

export function namesOf(hex: string, tokens: Iterable<[name: string, hex: string]>): string[] {
  const names: string[] = [];
  for (const [name, value] of tokens) if (value === hex) names.push(name);
  return names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function shareOf(count: number, total: number): string {
  if (!total || !count) return '0%';
  const percent = (count / total) * 100;
  return percent < 1 ? 'under 1%' : `${Math.round(percent)}%`;
}
