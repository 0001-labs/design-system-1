import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { App as AppElement } from "../4-page/ds-app";

export type AppProps = HTMLAttributes<AppElement> &
  Partial<Pick<AppElement, "name" | "home" | "layout" | "navWidth" | "asideWidth" | "resizeKey" | "drawerLabel" | "fixedScale" | "flush" | "apps">>;
export const App = forwardRef<AppElement, AppProps>(function App(props, ref) {
  return createElement("ds-app", { ...props, ref });
});
