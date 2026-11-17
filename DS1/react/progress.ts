import { createElement as h, forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { Progress as ProgressElement, ProgressSelectDetail, Step } from "../2-core/ds-progress";
import { meterAria, type FigureFormat } from "../2-core/figures";

export type { Step, StepState } from "../2-core/ds-progress";
export type ProgressProps = Omit<HTMLAttributes<ProgressElement>, "title" | "children" | "onSelect"> & {
  value?: number;
  min?: number;
  max?: number;
  squares?: number;
  over?: boolean;
  valuetext?: string;
  format?: FigureFormat;
  currency?: string;
  minor?: boolean;
  whole?: boolean;
  digits?: number;
  language?: string;
  steps?: Step[];
  current?: number;
  vertical?: boolean;
  bodies?: ReactNode[];
  dots?: number;
  active?: number;
  end?: boolean;
  dotLabel?: string;
  onSelect?: (index: number, previous: number) => void;
  label?: string;
  literal?: boolean;
};

const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const Progress = forwardRef<ProgressElement, ProgressProps>(function Progress(
  { value, min = 0, max = 1, squares, over, valuetext, format, currency, minor, whole, digits, language,
    steps, current, vertical, bodies, dots, active, end, dotLabel, onSelect, label, literal = true, ...props }, ref,
) {
  const host = useRef<ProgressElement | null>(null);
  useCommitEffect(() => {
    const element = host.current;
    if (!element || !onSelect) return;
    const select = (event: Event) => {
      if (event.target !== element) return;
      const { index, previous } = (event as CustomEvent<ProgressSelectDetail>).detail;
      onSelect(index, previous);
    };
    element.addEventListener("select", select);
    return () => element.removeEventListener("select", select);
  });
  const attach = (element: ProgressElement | null) => {
    host.current = element;
    if (typeof ref === "function") ref(element); else if (ref) ref.current = element;
  };
  if (steps) {
    return h("ds-progress", { ...props, steps, current, vertical: vertical || undefined, label, literal: literal || undefined, ref: attach },
      vertical ? bodies?.map((body, index) => body == null || body === false
        ? null
        : h("div", { key: index, slot: `step-${index + 1}`, style: { display: "contents" } }, body)) : null);
  }
  if (dots !== undefined) {
    return h("ds-progress", { role: "group", "aria-label": label, ...props, dots, active, end: end || undefined, "dot-label": dotLabel, label, literal: literal || undefined, ref: attach });
  }
  const aria = meterAria(value ?? 0, min, max, { over, format, currency, minor, whole, digits, language });
  return h("ds-progress", {
    role: "meter", "aria-valuenow": aria.now, "aria-valuemin": aria.min, "aria-valuemax": aria.max,
    "aria-valuetext": valuetext || aria.text, "aria-label": label,
    ...props, value: value ?? 0, min, max, squares, over: over || undefined, label, valuetext, format, currency,
    minor: minor || undefined, whole: whole || undefined, digits, literal: literal || undefined, ref: attach,
  });
});
