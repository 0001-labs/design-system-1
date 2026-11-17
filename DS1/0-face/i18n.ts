import {
  LANGUAGES,
  LANGUAGE_METADATA,
  fallbackLanguages,
  isLanguage,
  languageOrder,
  normalizeLanguage,
} from "./languages";
import type { Language } from "./languages";
import { configureLanguageRouting, parseLanguagePath } from "./language-routing";
import type { LanguageRoutingOptions } from "./language-routing";
import { readLanguageFile, resolveText } from "./translations-format";
import type {
  TranslationParams,
  TranslationTable,
  TranslationsFile,
} from "./translations-format";

export type LanguageCode = string;

export type TranslationData = {
  [key: string]: string;
};

export type TranslationMap = Record<string, TranslationData>;

export type I18nOptions = {
  autoLoad?: boolean;
  persist?: boolean;
  languages?: readonly LanguageCode[];
  languageFile?: string | ((language: LanguageCode) => string) | null;
  translationsFile?: string;
  storageKey?: string;
  reportMissingKeys?: boolean | (() => boolean);
  sharedWords?: boolean;
  routing?: LanguageRoutingOptions;
  languageFromAddress?: boolean;
  langTarget?: HTMLElement | false;
};

export type SetLanguageOptions = {
  remember?: boolean;
};

let translationKeys: TranslationMap = {};

export const SUPPORTED_LANGUAGES: readonly Language[] = LANGUAGES;

const DISPLAY_NAME_CACHE = new Map<string, Intl.DisplayNames>();
let displayNameFallbackWarningShown = false;

declare global {
  interface Window {
    DS_ONE_TRANSLATIONS?: Record<string, TranslationData>;
    DS_ONE_TRANSLATIONS_FILE?: string;
    DS_ONE_I18N?: I18nOptions;
    DS_ONE_I18N_DEBUG?: boolean;
  }
}

const DEFAULT_TRANSLATION_FILE = "./translations.json";
const DEFAULT_STORAGE_KEY = "language";
const DEBUG_STORAGE_KEY = "ds-one:i18n-debug";

const defaultLanguage: LanguageCode = "en";

let i18nOptions: I18nOptions =
  typeof window !== "undefined" && window.DS_ONE_I18N
    ? { ...window.DS_ONE_I18N }
    : {};

let sharedWords: TranslationsFile | undefined;

function storage(): Storage | undefined {
  try {
    return typeof window !== "undefined"
      ? (window.localStorage ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
}

function storageKey(): string {
  return i18nOptions.storageKey || DEFAULT_STORAGE_KEY;
}

function readStoredLanguage(): LanguageCode | null {
  if (i18nOptions.persist === false) return null;
  try {
    return (storage()?.getItem(storageKey()) as LanguageCode | null) || null;
  } catch {
    return null;
  }
}

function storeLanguage(language: LanguageCode): void {
  if (i18nOptions.persist === false) return;
  try {
    storage()?.setItem(storageKey(), language);
  } catch {
  }
}

function extractPrimarySubtag(code: LanguageCode): string {
  if (!code) {
    return "";
  }
  return code.toLowerCase().split(/[-_]/)[0] ?? "";
}

function fileLanguage(language: LanguageCode): LanguageCode | null {
  const configured = i18nOptions.languages;
  if (!configured || configured.length === 0) {
    return extractPrimarySubtag(language) || null;
  }

  const normalized = (language || "").toLowerCase().replace("_", "-");
  const exact = configured.find((code) => code.toLowerCase() === normalized);
  if (exact) {
    return exact;
  }

  const primary = extractPrimarySubtag(language);
  return configured.find((code) => code.toLowerCase() === primary) ?? null;
}

function languageFileFor(language: LanguageCode): string | null {
  const pattern = i18nOptions.languageFile;
  if (!pattern) {
    return null;
  }
  const path =
    typeof pattern === "function"
      ? pattern(language)
      : pattern.split("{language}").join(language);
  return normalizeCandidate(path);
}

let loadAttempted = false;

function normalizeCandidate(path: string): string | null {
  if (!path) {
    return null;
  }
  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("/") ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }

  return `./${trimmed}`;
}

function findAttributeCandidate(): string | null {
  if (typeof document === "undefined" || !document.querySelector) {
    return null;
  }

  const scriptWithAttribute = document.querySelector(
    "script[data-ds-one-translations]"
  );
  const scriptCandidate = scriptWithAttribute?.getAttribute(
    "data-ds-one-translations"
  );
  if (scriptCandidate) {
    return scriptCandidate;
  }

  const metaCandidate = document
    .querySelector('meta[name="ds-one:translations"]')
    ?.getAttribute("content");
  if (metaCandidate) {
    return metaCandidate;
  }

  const linkCandidate = document
    .querySelector('link[rel="ds-one-translations"]')
    ?.getAttribute("href");
  if (linkCandidate) {
    return linkCandidate;
  }

  return null;
}

function resolveTableSources(): string[] {
  const candidates: string[] = [];

  const windowCandidate =
    typeof window !== "undefined" ? window.DS_ONE_TRANSLATIONS_FILE : null;
  const attributeCandidate = findAttributeCandidate();

  const windowNormalized = normalizeCandidate(windowCandidate ?? "");
  if (windowNormalized) {
    candidates.push(windowNormalized);
  }

  const attrNormalized = normalizeCandidate(attributeCandidate ?? "");
  if (attrNormalized && !candidates.includes(attrNormalized)) {
    candidates.push(attrNormalized);
  }

  if (candidates.length === 0) {
    candidates.push(
      normalizeCandidate(i18nOptions.translationsFile ?? "") ??
        DEFAULT_TRANSLATION_FILE
    );
  }

  return candidates;
}

function resolveTranslationSources(): string[] {
  const tables = resolveTableSources();
  const startLanguage =
    fileLanguage(currentLanguage.value) ?? defaultLanguage;
  const own = languageFileFor(startLanguage);
  return own ? [own, ...tables.filter((source) => source !== own)] : tables;
}

function languageOfSource(source: string): LanguageCode | undefined {
  const start = fileLanguage(currentLanguage.value) ?? defaultLanguage;
  return languageFileFor(start) === source ? start : undefined;
}

function validateTranslationMap(
  candidate: unknown
): candidate is TranslationMap {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  return Object.values(candidate).every(
    (entry) => entry && typeof entry === "object"
  );
}

const translationFiles = new Map<string, Promise<TranslationMap | null>>();

function fetchTranslationFile(
  source: string,
  language?: LanguageCode
): Promise<TranslationMap | null> {
  let pending = translationFiles.get(source);
  if (!pending) {
    pending = readTranslationFile(source, language).then((translations) => {
      if (!translations) {
        translationFiles.delete(source);
      }
      return translations;
    });
    translationFiles.set(source, pending);
  }
  return pending;
}

async function readTranslationFile(
  source: string,
  language?: LanguageCode
): Promise<TranslationMap | null> {
  try {
    const response = await fetch(source);

    if (!response.ok) {
      return null;
    }

    const json: unknown = await response.json();
    const translations = language
      ? (readLanguageFile(language, json) ?? json)
      : json;

    if (!validateTranslationMap(translations)) {
      console.warn(
        `[Design system 1] Invalid translation format in ${source}. Expected object with language codes as keys.`
      );
      return null;
    }

    const languages = Object.keys(translations);
    if (languages.length === 0) {
      console.warn(`[Design system 1] No languages found in ${source}`);
      return null;
    }

    return translations;
  } catch {
    return null;
  }
}

function mergeTranslations(translations: TranslationMap): void {
  if (typeof window === "undefined") {
    translationKeys = { ...translationKeys, ...translations };
    return;
  }
  window.DS_ONE_TRANSLATIONS = {
    ...window.DS_ONE_TRANSLATIONS,
    ...translations,
  };
}

async function loadExternalTranslations(): Promise<boolean> {
  if (loadAttempted) {
    return false;
  }
  loadAttempted = true;

  if (typeof window === "undefined") {
    return false;
  }

  if (
    window.DS_ONE_TRANSLATIONS &&
    Object.keys(window.DS_ONE_TRANSLATIONS).length > 0
  ) {
    debugLog(
      `Translations already loaded (${Object.keys(window.DS_ONE_TRANSLATIONS).length} languages), skipping auto-load`
    );
    return true;
  }

  const sources = resolveTranslationSources();

  for (const source of sources) {
    const translations = await fetchTranslationFile(
      source,
      languageOfSource(source)
    );
    if (!translations) {
      continue;
    }

    mergeTranslations(translations);

    const languages = Object.keys(translations);
    debugLog(
      `External translations loaded from ${source}: ${languages.length} language(s) – ${languages.join(", ")}`
    );

    window.dispatchEvent(new CustomEvent("translations-ready"));
    return true;
  }

  debugLog(
    `No external translations found at ${sources[0] ?? DEFAULT_TRANSLATION_FILE}. Using bundled translations.`
  );

  return false;
}

const languageLoads = new Map<string, Promise<void>>();

export function loadLanguage(language: LanguageCode): Promise<void> {
  if (typeof window === "undefined" || !i18nOptions.languageFile) {
    return Promise.resolve();
  }

  const code = fileLanguage(language) ?? defaultLanguage;
  if (getTranslationData()[code]) {
    return Promise.resolve();
  }

  let pending = languageLoads.get(code);
  if (!pending) {
    pending = (async () => {
      const own = languageFileFor(code);
      let translations = own ? await fetchTranslationFile(own, code) : null;
      for (const source of resolveTableSources()) {
        if (translations) {
          break;
        }
        translations = await fetchTranslationFile(source);
      }
      if (!translations) {
        return;
      }
      mergeTranslations(translations);
      window.dispatchEvent(new CustomEvent("translations-ready"));
    })();
    languageLoads.set(code, pending);
  }
  return pending;
}

function getTranslationData(): TranslationMap {
  if (typeof window !== "undefined" && window.DS_ONE_TRANSLATIONS) {
    return window.DS_ONE_TRANSLATIONS;
  }

  return translationKeys;
}

function sortLanguageCodes(codes: LanguageCode[]): LanguageCode[] {
  return [...codes].sort((a, b) => {
    const priorityA = languageOrder(a);
    const priorityB = languageOrder(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.localeCompare(b);
  });
}

function getDisplayNameForLocale(
  locale: string,
  code: LanguageCode
): string | undefined {
  const normalizedLocale = locale?.replace("_", "-");
  if (!normalizedLocale) {
    return undefined;
  }

  try {
    let displayNames = DISPLAY_NAME_CACHE.get(normalizedLocale);

    if (!displayNames) {
      displayNames = new Intl.DisplayNames([normalizedLocale], {
        type: "language",
      });
      DISPLAY_NAME_CACHE.set(normalizedLocale, displayNames);
    }

    const cleanedCode = code.replace("_", "-");

    const fullMatch = displayNames.of(cleanedCode);
    if (fullMatch && fullMatch !== cleanedCode) {
      return fullMatch;
    }

    const baseMatch = displayNames.of(extractPrimarySubtag(cleanedCode));
    if (baseMatch) {
      return baseMatch;
    }
  } catch {
    if (!displayNameFallbackWarningShown) {
      console.info(
        "[Design system 1] Intl.DisplayNames is not available, using fallback language names."
      );
      displayNameFallbackWarningShown = true;
    }
  }

  return undefined;
}

function getFallbackDisplayName(code: LanguageCode): string | undefined {
  const language = normalizeLanguage(code, null);
  return language ? LANGUAGE_METADATA[language].label : undefined;
}

export function getLanguageDisplayName(
  code: LanguageCode,
  options: { locale?: string } = {}
): string {
  if (!code) {
    return "";
  }

  const localesToTry: string[] = [];

  if (options.locale) {
    localesToTry.push(options.locale);
  }

  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) {
      localesToTry.push(...navigator.languages);
    }
    if (navigator.language) {
      localesToTry.push(navigator.language);
    }
  }

  localesToTry.push(defaultLanguage);
  localesToTry.push("en");

  const tried = new Set<string>();

  for (const locale of localesToTry) {
    if (!locale || tried.has(locale)) {
      continue;
    }
    tried.add(locale);

    const displayName = getDisplayNameForLocale(locale, code);
    if (displayName) {
      return displayName;
    }
  }

  const fallback = getFallbackDisplayName(code);
  if (fallback) {
    return fallback;
  }

  const primary = extractPrimarySubtag(code);
  return primary ? primary.toUpperCase() : code;
}

function configuredLanguages(): readonly LanguageCode[] | null {
  return i18nOptions.languages?.length ? i18nOptions.languages : null;
}

function resolvePreferredLanguage(languageTag: string): LanguageCode | null {
  if (!languageTag) {
    return null;
  }

  const configured = configuredLanguages();
  const members = configured
    ? configured.filter(isLanguage)
    : (LANGUAGES as readonly Language[]);

  const match = members.length
    ? normalizeLanguage(languageTag, null, members)
    : null;
  if (match) {
    return match;
  }

  return configured ? fileLanguage(languageTag) : null;
}

export function getBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined" || !navigator) {
    return defaultLanguage;
  }

  const candidates = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
  ].filter((tag): tag is string => Boolean(tag));

  for (const candidate of candidates) {
    const resolved = resolvePreferredLanguage(candidate);
    if (resolved) {
      return resolved;
    }
  }

  if (!configuredLanguages() && candidates[0]) {
    return candidates[0];
  }
  return defaultLanguage;
}

function dispatchLanguageChanged(language: LanguageCode): void {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("language-changed", {
      detail: { language },
      bubbles: true,
      composed: true,
    })
  );
}

function addressLanguage(): LanguageCode | null {
  if (!i18nOptions.languageFromAddress || typeof window === "undefined") {
    return null;
  }
  const path = window.location?.pathname;
  return path ? parseLanguagePath(path, routingOptions()).language : null;
}

function langElement(): HTMLElement | null {
  const target = i18nOptions.langTarget;
  if (target === false) {
    return null;
  }
  if (target) {
    return target;
  }
  return typeof document !== "undefined" ? (document.documentElement ?? null) : null;
}

export const currentLanguage = {
  value: addressLanguage() || readStoredLanguage() || getBrowserLanguage(),
  set: function (lang: LanguageCode, options: SetLanguageOptions = {}) {
    this.value = lang;
    if (options.remember !== false) {
      storeLanguage(lang);
    }
    void loadLanguage(lang);
    const element = langElement();
    if (element) {
      element.lang = lang;
    }
    dispatchLanguageChanged(lang);
  },
};

export function configureI18n(next: I18nOptions): void {
  const previousPersist = i18nOptions.persist;
  const previousKey = storageKey();
  const previousLanguages = i18nOptions.languages;
  const previousAddress = i18nOptions.languageFromAddress;
  const previousRouting = i18nOptions.routing;
  i18nOptions = { ...i18nOptions, ...next };

  applyRouting();

  if (
    i18nOptions.persist !== previousPersist ||
    storageKey() !== previousKey ||
    i18nOptions.languages !== previousLanguages ||
    i18nOptions.languageFromAddress !== previousAddress ||
    (i18nOptions.languageFromAddress && i18nOptions.routing !== previousRouting)
  ) {
    const stored = readStoredLanguage();
    let language: LanguageCode = stored || getBrowserLanguage();
    if (stored && configuredLanguages()) {
      language = resolvePreferredLanguage(stored) ?? defaultLanguage;
    }
    language = addressLanguage() ?? language;
    if (language !== currentLanguage.value) {
      currentLanguage.value = language;
      dispatchLanguageChanged(language);
    }
  }

  if (next.sharedWords) {
    void loadSharedWords();
  }

  if (loadAttempted && i18nOptions.languageFile) {
    void loadLanguage(currentLanguage.value);
  }
}

function applyRouting(): void {
  if (!i18nOptions.routing && !i18nOptions.languages) {
    return;
  }
  configureLanguageRouting(routingOptions());
}

function routingOptions(): LanguageRoutingOptions {
  return {
    ...(i18nOptions.languages ? { languages: i18nOptions.languages } : {}),
    ...i18nOptions.routing,
  };
}

let sharedWordsLoad: Promise<void> | null = null;

export function loadSharedWords(): Promise<void> {
  if (!sharedWordsLoad) {
    sharedWordsLoad = import("./shared-words").then(({ SHARED_WORDS }) => {
      sharedWords = SHARED_WORDS;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("translations-ready"));
      }
    });
  }
  return sharedWordsLoad;
}

const startupLoads: Promise<unknown>[] = [];
const STARTUP_WAIT = 1000;
let announcement: Promise<void> | null = null;
let announced = false;
const page: Window | undefined = typeof window !== "undefined" ? window : undefined;

function announceTranslations(): void {
  if (announcement) return;
  const wait = new Promise<void>((resolve) => setTimeout(resolve, STARTUP_WAIT));
  announcement = Promise.race([Promise.allSettled(startupLoads.splice(0)), wait]).then(() => {
    announcement = null;
    announced = true;
    if (!eventful() || !page) return;
    page.dispatchEvent(new CustomEvent("translations-loaded"));
    dispatchLanguageChanged(currentLanguage.value);
  });
}

applyRouting();
if (i18nOptions.sharedWords) {
  startupLoads.push(loadSharedWords());
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  let started: () => void = () => {};
  startupLoads.push(new Promise<void>((resolve) => (started = resolve)));
  const start = () => {
    if (i18nOptions.autoLoad !== false) void loadExternalTranslations().finally(started);
    else started();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    setTimeout(start, 0);
  }
}

const eventful = () => typeof window !== "undefined" && typeof window.addEventListener === "function" && typeof window.dispatchEvent === "function";
if (eventful()) {
  window.addEventListener("translations-ready", announceTranslations);

  setTimeout(() => {
    if (eventful() && !announced && window === page) announceTranslations();
  }, 100);
}

const REPORTED_MISSING_KEYS = new Set<string>();

function debugLog(message: string): void {
  if (!debugSwitchOn()) {
    return;
  }
  console.info(`[Design system 1] ${message}`);
}

function debugSwitchOn(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (window.DS_ONE_I18N_DEBUG === true) {
    return true;
  }
  try {
    return storage()?.getItem(DEBUG_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function missingKeyReportingOn(): boolean {
  const option = i18nOptions.reportMissingKeys;
  try {
    if (typeof option === "function" ? option() : option) {
      return true;
    }
  } catch {
  }

  return debugSwitchOn();
}

function reportMissingKey(key: string, language: LanguageCode): void {
  if (!missingKeyReportingOn()) {
    return;
  }
  const seen = `${language}:${key}`;
  if (REPORTED_MISSING_KEYS.has(seen)) {
    return;
  }
  REPORTED_MISSING_KEYS.add(seen);
  console.warn(
    `[Design system 1 (Internationalization)] No translation found for key "${key}" in "${language}"`
  );
}

export function translate(key: string, params?: TranslationParams): string {
  return textInLanguage(key, currentLanguage.value, params);
}

(globalThis as unknown as Record<symbol, unknown>)[Symbol.for("design-system-1.translate")] = translate;

export function textInLanguage(
  key: string,
  language: LanguageCode,
  params?: TranslationParams
): string {
  const data = getTranslationData();
  const resolved = resolveText(key, language, [data, sharedWords], params);
  if (resolved.language !== null) {
    return resolved.text;
  }

  const codes = fallbackLanguages(language);
  if (
    !codes.includes(defaultLanguage) &&
    !data?.[defaultLanguage] &&
    codes.some((code) => data?.[code])
  ) {
    void loadLanguage(defaultLanguage);
  }

  reportMissingKey(key, codes[codes.length - 1] ?? language);
  return resolved.text;
}

export function hasTranslation(
  key: string,
  language: LanguageCode = currentLanguage.value
): boolean {
  if (!key) {
    return false;
  }

  const codes = fallbackLanguages(language);
  if (!codes.includes(defaultLanguage)) {
    codes.push(defaultLanguage);
  }

  return [getTranslationData(), sharedWords].some((source) =>
    codes.some((code) => {
      const langData = source?.[code];
      return Boolean(
        langData && Object.prototype.hasOwnProperty.call(langData, key)
      );
    })
  );
}

export function getText(key: string, params?: TranslationParams): string {
  return translate(key, params);
}

export function getAvailableLanguages(): Promise<LanguageCode[]> {
  return Promise.resolve(getAvailableLanguagesSync());
}

export function getAvailableLanguagesSync(): LanguageCode[] {
  if (i18nOptions.languages && i18nOptions.languages.length > 0) {
    return sortLanguageCodes([...i18nOptions.languages]);
  }

  const currentData = getTranslationData();

  if (currentData && Object.keys(currentData).length > 0) {
    return sortLanguageCodes(Object.keys(currentData));
  }
  return [defaultLanguage];
}

export function loadTranslations(
  language: LanguageCode,
  translations: TranslationTable
): void;
export function loadTranslations(translations: TranslationsFile): void;
export function loadTranslations(
  languageOrMap: LanguageCode | TranslationsFile,
  translations?: TranslationTable
): void {
  const map: TranslationsFile =
    typeof languageOrMap === "string"
      ? { [languageOrMap]: translations ?? {} }
      : languageOrMap;

  if (!validateTranslationMap(map)) {
    console.warn(
      "[Design system 1] loadTranslations expects words keyed by language code."
    );
    return;
  }

  const data = getTranslationData();
  const merged: TranslationMap = {};
  for (const [code, words] of Object.entries(map)) {
    const defined: TranslationData = {};
    for (const [key, text] of Object.entries(words ?? {})) {
      if (typeof text === "string") {
        defined[key] = text;
      }
    }
    merged[code] = { ...data[code], ...defined };
  }
  mergeTranslations(merged);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("translations-ready"));
  }
}

export function setLanguage(language: LanguageCode, options?: SetLanguageOptions): void {
  currentLanguage.set(language, options);
}
