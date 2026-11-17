import { createElement as h, forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { Notice as NoticeElement, NoticeTone } from "../2-core/ds-notice";

export type { NoticeTone } from "../2-core/ds-notice";
export type NoticeProps = Omit<HTMLAttributes<NoticeElement>, "title"> & {
  tone?: NoticeTone;
  heading?: ReactNode;
  text?: ReactNode;
  icon?: string;
  actions?: ReactNode;
  dismissible?: boolean;
  banner?: boolean;
  onDismiss?: () => void;
};

const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const title = (content: ReactNode) =>
  content == null || content === false || content === "" ? null : h("span", { slot: "heading" }, content);

export const Notice = forwardRef<NoticeElement, NoticeProps>(function Notice(
  { tone, heading, text, icon, actions, dismissible, banner, onDismiss, children, ...props }, ref,
) {
  const host = useRef<NoticeElement | null>(null);
  useCommitEffect(() => {
    const element = host.current;
    if (!element || !onDismiss) return;
    const dismiss = (event: Event) => {
      if (event.target !== element) return;
      event.preventDefault();
      onDismiss();
    };
    element.addEventListener("ds-notice-dismiss", dismiss);
    return () => element.removeEventListener("ds-notice-dismiss", dismiss);
  });
  return h("ds-notice", {
    role: tone === "danger" ? "alert" : "status",
    ...props, tone, icon, banner: banner || undefined, dismissible: (dismissible ?? Boolean(onDismiss)) || undefined,
    ref: (element: NoticeElement | null) => {
      host.current = element;
      if (typeof ref === "function") ref(element); else if (ref) ref.current = element;
    },
  },
  title(heading),
  children ?? text,
  actions == null || actions === false ? null : h("div", { slot: "actions", style: { display: "contents" } }, actions));
});
