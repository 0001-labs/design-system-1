import { createElement as h, forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { Carousel as CarouselElement, CarouselChangeDetail } from "../3-unit/ds-carousel";

export type { CarouselChangeDetail } from "../3-unit/ds-carousel";
export type CarouselProps = Omit<HTMLAttributes<CarouselElement>, "onChange"> & {
  label: string;
  current?: number;
  buttons?: boolean;
  dots?: boolean;
  end?: boolean;
  slideWidth?: number | "auto";
  gap?: number;
  bleed?: "none" | "end" | "both";
  loop?: boolean;
  autoplay?: boolean | number;
  free?: boolean;
  onChange?: (index: number, previous: number) => void;
  children?: ReactNode;
};

const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const Carousel = forwardRef<CarouselElement, CarouselProps>(function Carousel(
  { label, current, buttons, dots = true, end, slideWidth, gap, bleed, loop, autoplay, free, onChange, children, ...props }, ref,
) {
  const host = useRef<CarouselElement | null>(null);
  useCommitEffect(() => {
    const element = host.current;
    if (!element || !onChange) return;
    const change = (event: Event) => {
      if (event.target !== element) return;
      const { index, previous } = (event as CustomEvent<CarouselChangeDetail>).detail;
      onChange(index, previous);
    };
    element.addEventListener("change", change);
    return () => element.removeEventListener("change", change);
  });
  return h("ds-carousel", {
    role: "region",
    "aria-label": label,
    ...props,
    label,
    literal: true,
    current,
    buttons: buttons || undefined,
    "no-dots": dots ? undefined : true,
    end: end || undefined,
    "slide-width": slideWidth,
    gap,
    bleed: bleed && bleed !== "none" ? bleed : undefined,
    loop: loop || undefined,
    autoplay: autoplay === true ? "" : typeof autoplay === "number" ? String(autoplay) : undefined,
    free: free || undefined,
    ref: (element: CarouselElement | null) => {
      host.current = element;
      if (typeof ref === "function") ref(element); else if (ref) ref.current = element;
    },
  }, children);
});
