import { createElement as h, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { Stat as StatElement, StatTone } from "../2-core/ds-stat";
import { figureCells, formatFigure, type FigureFormat } from "../2-core/figures";

export type { StatTone } from "../2-core/ds-stat";
export type { FigureFormat } from "../2-core/figures";
export type StatProps = Omit<HTMLAttributes<StatElement>, "title"> & {
  label?: ReactNode;
  value?: number;
  figure?: ReactNode;
  format?: FigureFormat;
  currency?: string;
  minor?: boolean;
  whole?: boolean;
  digits?: number;
  change?: number;
  changeFormat?: FigureFormat;
  changeTone?: StatTone;
  caption?: ReactNode;
  icon?: string;
  tone?: StatTone;
  cells?: boolean;
  language?: string;
};

const hiddenWords: CSSProperties = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" };
const digitCell: CSSProperties = { display: "inline-block", width: "var(--ds-stat-digit, 1ch)", textAlign: "center" };
const slot = (name: string, content: ReactNode) =>
  content == null || content === false || content === "" ? null : h("span", { slot: name }, content);

function drawn(text: string, cells: boolean | undefined): ReactNode {
  if (!cells) return text;
  return [
    h("span", { key: "words", style: hiddenWords }, text),
    h("span", { key: "cells", "aria-hidden": "true" }, figureCells(text).map((cell, index) =>
      cell.digit ? h("span", { key: index, style: digitCell }, cell.text) : cell.text)),
  ];
}

export const Stat = forwardRef<StatElement, StatProps>(function Stat(
  { label, value, figure, format, currency, minor, whole, digits, change, changeFormat, changeTone, caption, icon, tone, cells, language, children, ...props }, ref,
) {
  const text = figure ?? (typeof value === "number" ? formatFigure(value, { format, currency, minor, whole, digits, language }) : null);
  return h("ds-stat", {
    ...props, format, currency, minor: minor || undefined, whole: whole || undefined, digits, change,
    "change-format": changeFormat, "change-tone": changeTone, icon, tone, cells: cells || undefined, ref,
  },
  slot("label", label),
  slot("figure", typeof text === "string" ? drawn(text, cells) : text),
  children,
  slot("caption", caption));
});
