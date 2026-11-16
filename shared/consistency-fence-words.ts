/**
 * A block written as a closed fence that holds only its words, ```c9y-name {…}```: what the block is and does is
 * fixed in code, never in the page, so a page can only say what its labels read. Shared by the blocks made this way
 * (`consistency-signup.ts`, `consistency-meetings.ts`), by editing and by publication. No DOM.
 */
export function fenceWords<Field extends string>(fence: string, defaults: Readonly<Record<Field, string>>, limits: Readonly<Record<NoInfer<Field>, number>>, lines: readonly NoInfer<Field>[] = []) {
  const fields = Object.keys(defaults) as Field[];
  const pattern = new RegExp(`^\`\`\`${fence}\\r?\\n([\\s\\S]*)\\r?\\n\`\`\`$`);
  return {
    fields,
    /** The fence of a block that keeps every default. */
    empty: `\`\`\`${fence}\n{}\n\`\`\``,
    /** The words from a fence, defaults for those it leaves out; null for anything that is not this block. A word of one line never holds a line break; only those named in `lines` may. */
    read(source: string): Record<Field, string> | null {
      if (source.length > 4_000) return null;
      const match = pattern.exec(source); if (!match) return null;
      try {
        const data = JSON.parse(match[1]!) as unknown;
        if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
        const value: Record<Field, string> = { ...defaults };
        for (const [key, words] of Object.entries(data)) {
          if (!(fields as string[]).includes(key)) return null;
          const field = key as Field;
          if (typeof words !== 'string' || words.length > limits[field] || (!lines.includes(field) && /[\r\n]/.test(words))) return null;
          if (words.trim()) value[field] = words;
        }
        return value;
      } catch { return null; }
    },
    /** The fence for the words, keeping only those that differ from the defaults. */
    write(value: Readonly<Record<Field, string>>): string {
      const words = Object.fromEntries(fields.filter(field => value[field].trim() && value[field] !== defaults[field]).map(field => [field, value[field].slice(0, limits[field])]));
      return `\`\`\`${fence}\n${JSON.stringify(words).replaceAll('`', '\\u0060')}\n\`\`\``;
    },
  };
}

export const escapeWords = (text: string) => text.replace(/[&<>"']/g, mark => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[mark]!);
