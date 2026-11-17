import { foundationTokenIssue } from '../DS1/1-root/foundation';

export const TOKENS_START = '/* ds1:tokens:start */';
export const TOKENS_END = '/* ds1:tokens:end */';

const NAME = /^--[a-zA-Z0-9_-]{1,80}$/;
const UNSAFE = /[;{}<>\\@]|url\s*\(|image-set\s*\(|expression\s*\(|\/\*|\*\//i;
export const MAX_BASE_BYTES = 512 * 1024;

export type BaseOverride = [name: string, value: string];

export function baseOverrides(css: string): { overrides: BaseOverride[] } | { error: string } {
  const from = css.lastIndexOf(TOKENS_START);
  if (from < 0) return { overrides: [] };
  const to = css.indexOf(TOKENS_END, from);
  if (to < 0) return { error: 'The token block is not closed.' };
  const block = css.slice(from + TOKENS_START.length, to);
  const body = /^\s*:root\s*\{([\s\S]*)\}\s*$/.exec(block);
  if (!body) return block.trim() ? { error: 'The token block holds something other than :root.' } : { overrides: [] };
  const overrides: BaseOverride[] = [];
  for (const declaration of body[1]!.split(';')) {
    if (!declaration.trim()) continue;
    const colon = declaration.indexOf(':');
    const name = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (colon < 0 || !NAME.test(name)) return { error: `"${declaration.trim().slice(0, 40)}" is not a token.` };
    if (!value || value.length > 400 || UNSAFE.test(value)) return { error: `${name} has a value the live sheet cannot carry.` };
    const issue = foundationTokenIssue(name, value);
    if (issue) return { error: issue };
    overrides.push([name, value]);
  }
  return { overrides };
}

export function baseSheet(overrides: BaseOverride[], version: number): string {
  const lines = overrides.map(([name, value]) => `  ${name}: ${value};`);
  return `/* Design system 1 base, version ${version} */\n:root {\n${lines.join('\n')}${lines.length ? '\n' : ''}}\n`;
}
