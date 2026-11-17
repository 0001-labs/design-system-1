import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { Header as HeaderElement } from "../4-page/ds-header";

export type HeaderProps = HTMLAttributes<HeaderElement> &
  Partial<Pick<HeaderElement, "variant" | "brand" | "href" | "label" | "literal" | "sticky">>;
export const Header = forwardRef<HeaderElement, HeaderProps>(function Header(props, ref) {
  return createElement("ds-header", { ...props, ref });
});
