export function fenceWords<Field extends string>(fence: string, defaults: Readonly<Record<Field, string>>, limits: Readonly<Record<NoInfer<Field>, number>>, lines: readonly NoInfer<Field>[] = []) {
  const fields = Object.keys(defaults) as Field[];
  const pattern = new RegExp(`^\`\`\`${fence}\\r?\\n([\\s\\S]*)\\r?\\n\`\`\`$`);
  return {
    fields,
    empty: `\`\`\`${fence}\n{}\n\`\`\``,
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
    write(value: Readonly<Record<Field, string>>): string {
      const words = Object.fromEntries(fields.filter(field => value[field].trim() && value[field] !== defaults[field]).map(field => [field, value[field].slice(0, limits[field])]));
      return `\`\`\`${fence}\n${JSON.stringify(words).replaceAll('`', '\\u0060')}\n\`\`\``;
    },
  };
}

export const escapeWords = (text: string) => text.replace(/[&<>"']/g, mark => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[mark]!);
