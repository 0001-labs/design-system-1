import { createElement as h, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import type { Empty as EmptyElement } from "../2-core/ds-empty";

export type EmptyProps = Omit<HTMLAttributes<EmptyElement>, "title"> & {
  heading?: ReactNode;
  text?: ReactNode;
  icon?: string;
  actions?: ReactNode;
  centered?: boolean;
  level?: number;
  tone?: "done";
};

const title = (content: ReactNode) =>
  content == null || content === false || content === "" ? null : h("span", { slot: "heading" }, content);

export const Empty = forwardRef<EmptyElement, EmptyProps>(function Empty(
  { heading, text, icon, actions, centered, level, tone, children, ...props }, ref,
) {
  return h("ds-empty", { ...props, icon, centered: centered ?? true, level, tone, ref },
    title(heading),
    children ?? text,
    actions == null || actions === false ? null : h("div", { slot: "actions", style: { display: "contents" } }, actions));
});
