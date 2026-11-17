export const LANGUAGES = [
  "da",
  "de",
  "en",
  "es",
  "fi",
  "fr",
  "is",
  "it",
  "ja",
  "ko",
  "nb",
  "nn",
  "no",
  "pt",
  "pt-BR",
  "sv",
  "zh",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export type LanguageMetadata = {
  code: Language;
  label: string;
  nativeLabel: string;
  aliases: readonly string[];
};

export const LANGUAGE_METADATA: Readonly<Record<Language, LanguageMetadata>> = {
  da: { code: "da", label: "Danish", nativeLabel: "Dansk", aliases: ["da-dk"] },
  de: {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    aliases: ["de-de", "de-at", "de-ch"],
  },
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    aliases: ["en-us", "en-gb", "en-ca", "en-au", "en-nz", "en-ie"],
  },
  es: {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    aliases: ["es-es", "es-mx", "es-ar", "es-cl", "es-co"],
  },
  fi: { code: "fi", label: "Finnish", nativeLabel: "Suomi", aliases: ["fi-fi"] },
  fr: {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    aliases: ["fr-fr", "fr-ca", "fr-be", "fr-ch"],
  },
  is: { code: "is", label: "Icelandic", nativeLabel: "Íslenska", aliases: ["is-is"] },
  it: { code: "it", label: "Italian", nativeLabel: "Italiano", aliases: ["it-it", "it-ch"] },
  ja: { code: "ja", label: "Japanese", nativeLabel: "日本語", aliases: ["ja-jp"] },
  ko: { code: "ko", label: "Korean", nativeLabel: "한국어", aliases: ["ko-kr"] },
  nb: {
    code: "nb",
    label: "Norwegian Bokmål",
    nativeLabel: "Norsk bokmål",
    aliases: ["nb-no"],
  },
  nn: {
    code: "nn",
    label: "Norwegian Nynorsk",
    nativeLabel: "Norsk nynorsk",
    aliases: ["nn-no"],
  },
  no: { code: "no", label: "Norwegian", nativeLabel: "Norsk", aliases: ["no-no"] },
  pt: { code: "pt", label: "Portuguese", nativeLabel: "Português", aliases: ["pt-pt"] },
  "pt-BR": {
    code: "pt-BR",
    label: "Brazilian Portuguese",
    nativeLabel: "Português (Brasil)",
    aliases: ["pt-br"],
  },
  sv: { code: "sv", label: "Swedish", nativeLabel: "Svenska", aliases: ["sv-se", "sv-fi"] },
  zh: {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    aliases: ["zh-cn", "zh-tw", "zh-hk", "zh-sg", "zh-hans", "zh-hant"],
  },
};

const RELATED_LANGUAGES: Readonly<Partial<Record<Language, readonly Language[]>>> = {
  nb: ["no", "nn"],
  no: ["nb", "nn"],
  nn: ["nb", "no"],
  pt: ["pt-BR"],
  "pt-BR": ["pt"],
};

const ALIASES = new Map<string, Language>();
for (const code of LANGUAGES) {
  ALIASES.set(code.toLowerCase(), code);
  for (const alias of LANGUAGE_METADATA[code].aliases) {
    ALIASES.set(alias, code);
  }
}

const ORDER = new Map<string, number>(LANGUAGES.map((code, index) => [code, index]));

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && ORDER.has(value);
}

function primarySubtag(tag: string): string {
  return tag.split("-")[0] ?? "";
}

function within(language: Language, allowed: ReadonlySet<Language>): Language | null {
  if (allowed.has(language)) {
    return language;
  }
  return RELATED_LANGUAGES[language]?.find((related) => allowed.has(related)) ?? null;
}

export function normalizeLanguage(
  input: string | null | undefined,
  fallback?: Language,
  languages?: readonly Language[]
): Language;
export function normalizeLanguage(
  input: string | null | undefined,
  fallback: null,
  languages?: readonly Language[]
): Language | null;
export function normalizeLanguage(
  input: string | null | undefined,
  fallback: Language | null = DEFAULT_LANGUAGE,
  languages: readonly Language[] = LANGUAGES
): Language | null {
  const allowed = new Set(languages);
  const tokens = String(input ?? "")
    .split(",")
    .map((token) => token.split(";")[0]?.trim().toLowerCase().replace(/_/g, "-") ?? "")
    .filter(Boolean);

  for (const token of tokens) {
    const exact = ALIASES.get(token);
    const match = exact ? within(exact, allowed) : null;
    if (match) {
      return match;
    }
    const base = ALIASES.get(primarySubtag(token));
    const baseMatch = base ? within(base, allowed) : null;
    if (baseMatch) {
      return baseMatch;
    }
  }

  return fallback;
}

export function pickLanguages(subset: Iterable<string>): Language[] {
  const wanted = new Set<Language>();
  for (const code of subset) {
    const member = ALIASES.get(String(code).toLowerCase().replace(/_/g, "-"));
    if (member && member.toLowerCase() === String(code).toLowerCase().replace(/_/g, "-")) {
      wanted.add(member);
    }
  }
  return LANGUAGES.filter((code) => wanted.has(code));
}

export function languageOrder(code: string): number {
  const normalized = String(code ?? "").toLowerCase().replace(/_/g, "-");
  const member = ALIASES.get(normalized) ?? ALIASES.get(primarySubtag(normalized));
  return member ? (ORDER.get(member) ?? LANGUAGES.length) : LANGUAGES.length;
}

export function fallbackLanguages(language: string): string[] {
  const codes: string[] = [];
  const add = (code: string | undefined) => {
    if (code && !codes.includes(code)) {
      codes.push(code);
    }
  };

  add(language);
  const normalized = String(language ?? "").toLowerCase().replace(/_/g, "-");
  const member = ALIASES.get(normalized);
  add(member);
  add(primarySubtag(normalized));
  const related = member ?? ALIASES.get(primarySubtag(normalized));
  for (const code of related ? (RELATED_LANGUAGES[related] ?? []) : []) {
    add(code);
  }
  return codes;
}
