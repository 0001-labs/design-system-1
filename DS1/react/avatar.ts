import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { Avatar as AvatarElement } from "../2-core/ds-avatar";

export type AvatarProps = Omit<HTMLAttributes<AvatarElement>, "children"> &
  Partial<
    Pick<
      AvatarElement,
      | "label"
      | "initial"
      | "initials"
      | "src"
      | "icon"
      | "shape"
      | "size"
      | "fit"
      | "mask"
      | "outlined"
      | "pending"
      | "plain"
      | "color"
      | "ink"
    >
  >;
export const Avatar = forwardRef<AvatarElement, AvatarProps>(function Avatar(props, ref) {
  return createElement("ds-avatar", { ...props, ref });
});

export type LogoProps = Omit<AvatarProps, "size" | "fit" | "mask" | "plain" | "shape">;
export const Logo = forwardRef<AvatarElement, LogoProps>(function Logo(props, ref) {
  return createElement("ds-avatar", {
    size: "fill",
    logo: true,
    fit: "contain",
    mask: true,
    plain: true,
    initial: "",
    ...props,
    ref,
  });
});
