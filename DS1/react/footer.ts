import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { Footer as FooterElement } from "../4-page/ds-footer";

export type { FooterColumn, FooterIcons, FooterLink, FooterPreference } from "../4-page/ds-footer";
export type FooterProps = Omit<HTMLAttributes<FooterElement>, "columns" | "policies"> &
  Partial<Pick<FooterElement, "brand" | "href" | "tagline" | "columns" | "label" | "owner" | "year" | "policies" | "preferences" | "literal">>;
export const Footer = forwardRef<FooterElement, FooterProps>(function Footer({ preferences, ...props }, ref) {
  return createElement("ds-footer", { ...props, preferences: preferences === undefined ? undefined : String(preferences), ref });
});
