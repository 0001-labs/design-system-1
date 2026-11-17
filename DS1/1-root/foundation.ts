import { measures } from './measures';

export const FOUNDATION_TOKENS: Readonly<Record<string, string>> = {
  '--ds-1': `${measures.square}px`,
  '--one-unit': `${measures.square}px`,
  '--ds-control-size': `${measures.control}px`,
  '--one-control-height': `${measures.control}px`,
  '--ds-row-size': `${measures.row}px`,
  '--ds-text-leading': `${measures.leading}px`,
  '--ds-08': 'calc(var(--ds-1) * 0.8)',
  '--ds-unit': 'calc(var(--ds-1, 20px) * var(--ds-sf, 1))',
  '--ds-control-height': 'calc(var(--ds-control-size, var(--ds-08, 16px)) * var(--ds-sf, 1))',
  '--ds-row-height': 'calc(var(--ds-row-size, var(--ds-1, 20px)) * var(--ds-sf, 1))',
  '--ds-type-lineheight-default': 'calc(var(--ds-text-leading, 16px) * var(--ds-sf, 1))',
};

export const SUPPORTED_UNITS = [10, measures.square, 30] as const;
const finest = Math.min(...SUPPORTED_UNITS);
const spare = measures.square - measures.control;

const onTens = (px: number) => px > 0 && px % finest === 0;
const controlOnTens = (px: number) => px >= measures.control && (onTens(px) || onTens(px + spare));
const leadingOnFours = (px: number) => px >= measures.leading && px % spare === 0;

const SCALES: Readonly<Record<string, { allows: (px: number) => boolean; words: string }>> = {
  '--ds-1': { allows: (px) => (SUPPORTED_UNITS as readonly number[]).includes(px), words: `one of ${SUPPORTED_UNITS.join(', ')}px` },
  '--one-unit': { allows: (px) => (SUPPORTED_UNITS as readonly number[]).includes(px), words: `one of ${SUPPORTED_UNITS.join(', ')}px` },
  '--ds-row-size': { allows: onTens, words: `a whole number of ${finest}px squares` },
  '--ds-control-size': { allows: controlOnTens, words: `whole ${finest}px squares, or those less ${spare}px, ${measures.control}px or more` },
  '--one-control-height': { allows: controlOnTens, words: `whole ${finest}px squares, or those less ${spare}px, ${measures.control}px or more` },
  '--ds-text-leading': { allows: leadingOnFours, words: `a multiple of ${spare}px, ${measures.leading}px or more` },
};

export const foundationScale = (name: string) => name in SCALES;

export function foundationTokenIssue(name: string, value: string): string | undefined {
  const expected = FOUNDATION_TOKENS[name];
  if (!expected) return;
  if (value.replace(/\s/g, '') === expected.replace(/\s/g, '')) return;
  if ((name === '--ds-1' && value.trim() === 'var(--one-unit)') ||
      (name === '--ds-control-size' && value.trim() === 'var(--one-control-height)')) return;
  const literal = /^([0-9]+(?:\.[0-9]+)?)px$/i.exec(value.trim());
  const scale = SCALES[name];
  if (literal && (scale ? scale.allows(Number(literal[1])) : Number(literal[1]) === Number.parseFloat(expected))) return;
  if (scale) return `${name} belongs to the shared foundation and must be ${scale.words}. Change colours, fonts and appearance within its constraints.`;
  return `${name} belongs to the shared foundation and must stay ${expected}. Change colours, fonts and appearance within its constraints.`;
}
