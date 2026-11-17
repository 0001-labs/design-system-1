import { currencySymbol, formatMoney } from "./format";
import type { MoneyOptions } from "./format";
import { currentLanguage } from "./i18n";
import type { LanguageCode } from "./i18n";

type PriceLabelOptions = {
  language?: LanguageCode;
  country?: string;
};

const LANGUAGE_CURRENCIES: Record<string, string> = {
  da: "DKK",
  de: "EUR",
  en: "USD",
  es: "EUR",
  fi: "EUR",
  fr: "EUR",
  is: "ISK",
  it: "EUR",
  ja: "JPY",
  ko: "KRW",
  nb: "NOK",
  nn: "NOK",
  no: "NOK",
  pt: "EUR",
  "pt-br": "BRL",
  sv: "SEK",
  zh: "CNY",
};

const COUNTRY_CURRENCIES: Record<string, string> = {
  US: "USD",
  USA: "USD",
  GB: "GBP",
  UK: "GBP",
  JP: "JPY",
  JPN: "JPY",
  CN: "CNY",
  CHN: "CNY",
  KR: "KRW",
  KOR: "KRW",
};

const PRICE_LABELS: Record<string, string> = {
  DKK: "kr.",
  NOK: "kr.",
  SEK: "kr.",
  ISK: "kr.",
  EUR: "€",
  USD: "$",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  BRL: "R$",
};

export function getPriceCurrency(options: PriceLabelOptions = {}): string {
  const country = options.country?.toUpperCase();
  if (country && COUNTRY_CURRENCIES[country]) {
    return COUNTRY_CURRENCIES[country];
  }

  const language = String(options.language || currentLanguage.value || "en")
    .toLowerCase()
    .replace(/_/g, "-");
  const primary = language.split("-")[0] ?? "";
  return LANGUAGE_CURRENCIES[language] ?? LANGUAGE_CURRENCIES[primary] ?? "USD";
}

export function getPriceLabel(options: PriceLabelOptions = {}): string {
  const currency = getPriceCurrency(options);
  return (
    PRICE_LABELS[currency] ??
    currencySymbol(currency, { language: options.language })
  );
}

export function formatPrice(
  amount: number,
  options: PriceLabelOptions & MoneyOptions & { currency?: string } = {}
): string {
  const { country, currency, ...money } = options;
  return formatMoney(
    amount,
    currency ?? getPriceCurrency({ language: options.language, country }),
    money
  );
}
