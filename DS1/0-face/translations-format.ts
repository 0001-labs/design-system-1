import { DEFAULT_LANGUAGE, LANGUAGES, fallbackLanguages } from "./languages";

export type TranslationTable = { readonly [key: string]: string | undefined };

export type TranslationsFile = { readonly [language: string]: TranslationTable | undefined };

export type TranslationParams = { readonly [name: string]: string | number | boolean };

export const FALLBACK_LANGUAGE = DEFAULT_LANGUAGE;

const PLACEHOLDER = /\{\{\s*([\w.-]+)\s*\}\}|\{([\w.-]+)\}/g;

export function placeholdersIn(text: string): string[] {
  const names: string[] = [];
  for (const match of String(text ?? "").matchAll(PLACEHOLDER)) {
    const name = match[1] ?? match[2];
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

export function fillPlaceholders(text: string, params?: TranslationParams): string {
  if (!params) {
    return text;
  }
  return text.replace(PLACEHOLDER, (whole, double: string | undefined, single: string | undefined) => {
    const name = (double ?? single) as string;
    return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole;
  });
}

export function englishText(file: TranslationsFile, key: string): string {
  return file[FALLBACK_LANGUAGE]?.[key] || key;
}

export type ResolvedText = {
  text: string;
  language: string | null;
};

export function resolveText(
  key: string,
  language: string,
  sources: readonly (TranslationsFile | undefined)[],
  params?: TranslationParams
): ResolvedText {
  const order = fallbackLanguages(language);
  if (!order.includes(FALLBACK_LANGUAGE)) {
    order.push(FALLBACK_LANGUAGE);
  }

  for (const code of order) {
    for (const source of sources) {
      const text = source?.[code]?.[key];
      if (text) {
        return { text: fillPlaceholders(text, params), language: code };
      }
    }
  }
  return { text: fillPlaceholders(key, params), language: null };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readLanguageFile(language: string, value: unknown): TranslationsFile | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const wrapped = value[language];
  if (isPlainObject(wrapped)) {
    return value as TranslationsFile;
  }
  const values = Object.values(value);
  if (values.length > 0 && values.every((text) => typeof text === "string")) {
    return { [language]: value as TranslationTable };
  }
  if (values.length > 0 && values.every(isPlainObject)) {
    return value as TranslationsFile;
  }
  return null;
}

export type TranslationsCheck = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type TranslationsCheckOptions = {
  languages?: readonly string[];
};

const ID_KEY = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/;

export function validateTranslations(
  value: unknown,
  options: TranslationsCheckOptions = {}
): TranslationsCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPlainObject(value)) {
    return {
      valid: false,
      errors: ["Expected an object keyed by language code."],
      warnings,
    };
  }

  const known = new Set((options.languages ?? LANGUAGES).map((code) => code.toLowerCase()));
  const file = value as Record<string, unknown>;
  const english = isPlainObject(file[FALLBACK_LANGUAGE])
    ? (file[FALLBACK_LANGUAGE] as Record<string, unknown>)
    : {};

  for (const [language, table] of Object.entries(file)) {
    if (!isPlainObject(table)) {
      errors.push(`"${language}" should hold an object of words.`);
      continue;
    }
    if (!known.has(language.toLowerCase())) {
      warnings.push(`"${language}" is not in the language list.`);
    }

    for (const [key, text] of Object.entries(table)) {
      if (text === undefined) {
        continue;
      }
      if (typeof text !== "string") {
        errors.push(`"${language}" → "${key}" should be a string.`);
        continue;
      }
      if (language === FALLBACK_LANGUAGE) {
        continue;
      }

      const source = typeof english[key] === "string" ? (english[key] as string) : undefined;
      if (source === undefined && ID_KEY.test(key)) {
        warnings.push(`"${key}" has no English text, so English readers see the key.`);
      }
      const expected = placeholdersIn(source ?? key).sort().join(", ");
      const found = placeholdersIn(text).sort().join(", ");
      if (expected !== found) {
        warnings.push(
          `"${language}" → "${key}" has placeholders [${found}] where English has [${expected}].`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings: [...new Set(warnings)] };
}

export function isTranslationsFile(value: unknown): value is TranslationsFile {
  return validateTranslations(value).valid;
}
