import { createElement as h, forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { Message as MessageElement, MessageTone } from "../2-core/ds-message";

export type { MessageTone } from "../2-core/ds-message";
export type MessageProps = Omit<HTMLAttributes<MessageElement>, "title"> & {
  failure?: import("../0-face/failures").Failure;
  expand?: boolean;
  visibleToasts?: number;
  richColors?: boolean;
  contained?: boolean;
  label?: string;
  closeLabel?: string;
  form?: "inline" | "banner" | "toast" | "assistant" | "app";
  src?: string;
  appId?: string;
  appUrl?: string;
  open?: string;
  remember?: string;
  preview?: boolean;
  position?: import("../0-face/toast-queue").ToastPosition;
  duration?: number;
  closeButton?: boolean;
  tone?: MessageTone;
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

export const Message = forwardRef<MessageElement, MessageProps>(function Message(
  { failure, expand, visibleToasts, richColors, contained, label, closeLabel, form, position, duration, closeButton, tone, heading, text, icon, actions, dismissible, banner, onDismiss, src, appId, appUrl, open, remember, preview, children, ...props }, ref,
) {
  const host = useRef<MessageElement | null>(null);
  useCommitEffect(() => {
    const element = host.current;
    if (!element || !onDismiss) return;
    const dismiss = (event: Event) => {
      if (event.target !== element) return;
      event.preventDefault();
      onDismiss();
    };
    element.addEventListener("ds-message-dismiss", dismiss);
    return () => element.removeEventListener("ds-message-dismiss", dismiss);
  });
  return h("ds-message", {
    failure, expand: expand || undefined, "visible-toasts": visibleToasts, "rich-colors": richColors || undefined, contained: contained || undefined, label, "close-label": closeLabel,
    form, position, duration, "close-button": closeButton || undefined,
    src, "app-id": appId, "app-url": appUrl, open, remember, preview: preview || undefined,
    role: form === "toast" ? "presentation" : form === "app" ? "region" : tone === "danger" ? "alert" : "status",
    ...props, tone, icon, banner: banner || undefined, dismissible: (dismissible ?? Boolean(onDismiss)) || undefined,
    ref: (element: MessageElement | null) => {
      host.current = element;
      if (typeof ref === "function") ref(element); else if (ref) ref.current = element;
    },
  },
  title(heading),
  children ?? text,
  actions == null || actions === false ? null : h("div", { slot: "actions", style: { display: "contents" } }, actions));
});

export { toast as message } from "./toast";
