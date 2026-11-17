import { v } from "convex/values";
import type { VLiteral, VUnion } from "convex/values";
import { LANGUAGES, isLanguage } from "./languages";
import type { Language } from "./languages";

export type LanguageValidator<L extends Language = Language> = VUnion<
  L,
  VLiteral<L, "required">[],
  "required",
  never
>;

export function languageValidatorFor<L extends Language>(
  languages: readonly L[]
): LanguageValidator<L> {
  if (languages.length === 0) {
    throw new Error("languageValidatorFor needs at least one language.");
  }
  const unknown = languages.filter((code) => !isLanguage(code));
  if (unknown.length > 0) {
    throw new Error(
      `languageValidatorFor got codes that are not in the language list: ${unknown.join(", ")}`
    );
  }
  const unique = [...new Set(languages)];
  return v.union(...unique.map((code) => v.literal(code))) as LanguageValidator<L>;
}

export const languageValidator: LanguageValidator = languageValidatorFor(LANGUAGES);
