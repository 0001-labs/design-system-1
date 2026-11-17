import { DEFAULT_LANGUAGE, LANGUAGES } from "./languages";

export type LanguageRoutingOptions = {
  languages?: readonly string[];
  defaultLanguage?: string;
  prefixDefaultLanguage?: boolean;
};

export type LanguagePath = {
  language: string | null;
  restPath: string;
};

let routing: LanguageRoutingOptions = {};

export function configureLanguageRouting(options: LanguageRoutingOptions): void {
  routing = { ...routing, ...options };
}

export function getLanguageRoutingOptions(): Required<LanguageRoutingOptions> {
  return resolve();
}

function resolve(options?: LanguageRoutingOptions): Required<LanguageRoutingOptions> {
  const merged = { ...routing, ...options };
  return {
    languages: merged.languages?.length ? merged.languages : LANGUAGES,
    defaultLanguage: merged.defaultLanguage || DEFAULT_LANGUAGE,
    prefixDefaultLanguage: merged.prefixDefaultLanguage ?? false,
  };
}

export function languageSlug(language: string): string {
  return String(language ?? "").toLowerCase().replace(/_/g, "-");
}

export function languageFromSlug(
  segment: string,
  languages: readonly string[] = resolve().languages
): string | null {
  const slug = languageSlug(segment);
  if (!slug) {
    return null;
  }
  return languages.find((code) => languageSlug(code) === slug) ?? null;
}

export function isLanguageSlug(segment: string, languages?: readonly string[]): boolean {
  return languageFromSlug(segment, languages) !== null;
}

function splitSuffix(path: string): [string, string] {
  const index = path.search(/[?#]/);
  return index === -1 ? [path, ""] : [path.slice(0, index), path.slice(index)];
}

export function parseLanguagePath(
  pathname: string,
  options?: LanguageRoutingOptions
): LanguagePath {
  const { languages } = resolve(options);
  const [path, suffix] = splitSuffix(pathname || "/");
  const absolute = path.startsWith("/") ? path : `/${path}`;
  const first = absolute.split("/")[1] ?? "";
  const language = languageFromSlug(first, languages);

  if (!language) {
    return { language: null, restPath: `${absolute}${suffix}` };
  }

  const rest = absolute.slice(first.length + 1) || "/";
  return { language, restPath: `${rest}${suffix}` };
}

export function stripLanguagePrefix(path: string, options?: LanguageRoutingOptions): string {
  return parseLanguagePath(path, options).restPath;
}

export function withLanguagePrefix(
  path: string,
  language: string,
  options?: LanguageRoutingOptions
): string {
  const resolved = resolve(options);
  const rest = stripLanguagePrefix(path, options);
  const configured = languageFromSlug(language, resolved.languages);
  const isDefault = languageSlug(language) === languageSlug(resolved.defaultLanguage);

  if (!configured || (isDefault && !resolved.prefixDefaultLanguage)) {
    return rest;
  }

  const [restPath, suffix] = splitSuffix(rest);
  const tail = restPath === "/" ? "" : restPath;
  return `/${languageSlug(configured)}${tail}${suffix}`;
}
