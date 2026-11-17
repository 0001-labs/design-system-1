import { createElement as h, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import type { Kbd as KbdElement } from "../2-core/ds-kbd";
import type { KeyPlatform } from "../../../../DS1/0-face/keys";

export type KbdProps = HTMLAttributes<KbdElement> & {
  shortcut?: string;
  plain?: boolean;
  platform?: KeyPlatform;
  children?: ReactNode;
};

export const Kbd = forwardRef<KbdElement, KbdProps>(function Kbd({ shortcut, plain, platform, children, ...props }, ref) {
  return h("ds-kbd", { ...props, shortcut, plain: plain || undefined, platform, ref }, children);
});
