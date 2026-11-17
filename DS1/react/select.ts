import { createElement as h, forwardRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { MenuHost, type MenuElement, type MenuProps } from "./menu-engine";
import { Button, ButtonLink, type ButtonLinkProps, type ButtonProps } from "./button";
import { shortcutLabel } from "../0-face/keys";

export type SelectEntry =
  | {
    label: ReactNode;
    textValue?: string;
    details?: ReactNode;
    icon?: string;
    shortcut?: string;
    href?: string;
    danger?: boolean;
    disabled?: boolean;
    checked?: boolean;
    keepOpen?: boolean;
    onSelect?: (event: Event) => void;
    items?: SelectEntry[];
  }
  | { separator: true }
  | { heading: ReactNode };

type FieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  fit?: boolean;
  chip?: boolean;
  primary?: boolean;
  swatch?: string;
  native?: boolean;
};
type MenuOnly = Omit<MenuProps, "tag" | "onChange"> & { items?: SelectEntry[] };
export type SelectProps = (FieldProps & { trigger?: undefined; items?: undefined }) | (MenuOnly & { trigger?: HTMLElement | null; open?: boolean });

const isMenu = (props: SelectProps): props is MenuOnly & { trigger?: HTMLElement | null } =>
  "trigger" in props || "items" in props || ("open" in props && typeof (props as { open?: unknown }).open === "boolean") || "onOpenChange" in props;

function Entry({ entry, menu }: { entry: SelectEntry; menu: { current: MenuElement | null } }): ReactNode {
  if ("separator" in entry) return h("hr", { "data-ds-menu-separator": "" });
  if ("heading" in entry) return h("ds-text", { literal: true, tone: "muted", "data-ds-menu-label": "" }, entry.heading);
  if (entry.items) return h(Nested, { entry });
  const shared = {
    menuItem: true, danger: entry.danger, disabled: entry.disabled,
    role: entry.checked === undefined ? "menuitem" : "menuitemcheckbox", "aria-checked": entry.checked, "data-keep-open": "",
    "data-text-value": entry.textValue ?? (typeof entry.label === "string" ? entry.label : undefined),
  };
  const choose = () => {
    const select = new Event("ds-menu-select", { cancelable: true });
    entry.onSelect?.(select);
    return !select.defaultPrevented && !entry.keepOpen;
  };
  if (entry.href !== undefined) return h(ButtonLink, {
    ...shared, href: entry.href,
    onClick: () => { const host = menu.current; if (choose()) setTimeout(() => host?.select()); },
    onKeyDown: event => { if (event.key === " " && !entry.disabled) { event.preventDefault(); event.currentTarget.click(); } },
  } as ButtonLinkProps, ...row(entry));
  return h(Button, {
    ...shared,
    onClick: () => { if (!entry.disabled && choose()) menu.current?.select(); },
  } as ButtonProps, ...row(entry));
}

function row(entry: Extract<SelectEntry, { label: ReactNode }>, end?: ReactNode): ReactNode[] {
  return [
    entry.icon ? h("ds-icon", { type: entry.icon, "aria-hidden": true, style: { flex: "none" } }) : null,
    h("span", { style: { minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" } }, entry.label),
    entry.details ? h("span", { style: { minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", color: "var(--ds-text-color-muted)" } }, entry.details) : null,
    entry.shortcut ? h("span", { "aria-hidden": true, style: { marginInlineStart: "auto", flex: "none", color: "var(--ds-text-color-muted)" } }, shortcutLabel(entry.shortcut)) : null,
    entry.checked ? h("ds-icon", { type: "check", "aria-hidden": true, style: { marginInlineStart: entry.shortcut ? 0 : "auto", flex: "none" } }) : null,
    end ?? null,
  ];
}

function Nested({ entry }: { entry: Extract<SelectEntry, { label: ReactNode }> }) {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const menu = { current: null as MenuElement | null };
  return h("div", { style: { display: "contents" } },
    h(Button, {
      ref: setTrigger, menuItem: true, role: "menuitem", disabled: entry.disabled, active: open, "data-keep-open": "",
      "data-text-value": entry.textValue ?? (typeof entry.label === "string" ? entry.label : undefined),
    } as ButtonProps, ...row(entry, h("ds-icon", { type: "right", "aria-hidden": true, style: { marginInlineStart: "auto", flex: "none" } }))),
    h(MenuHost, {
      tag: "ds-select", role: "menu", trigger, anchor: trigger, triggerMode: "submenu", placement: "right",
      open, onOpenChange: next => setOpen(next), ref: (element: MenuElement | null) => { menu.current = element; },
    }, open ? entry.items!.map((child, index) => h(Entry, { key: index, entry: child, menu })) : null),
  );
}

export const Select = forwardRef<HTMLSelectElement | MenuElement, SelectProps>(function Select(props, ref) {
  if (isMenu(props)) {
    const { items, children, ...menu } = props;
    const host = { current: null as MenuElement | null };
    return h(MenuHost, {
      ...menu, tag: "ds-select", role: menu.role ?? "menu", anchor: menu.anchor ?? menu.trigger ?? null,
      ref: (element: MenuElement | null) => { host.current = element; if (typeof ref === "function") ref(element); else if (ref) (ref as { current: unknown }).current = element; },
    }, items ? items.map((entry, index) => h(Entry, { key: index, entry, menu: host })) : children);
  }
  const { className, style, hidden, children, fit, chip, primary, swatch, native, ...field } = props as FieldProps;
  return h("ds-select", { className, style, hidden, fit: fit ? "" : undefined, chip: chip ? "" : undefined, primary: primary ? "" : undefined, native: native || undefined, swatch },
    h("select", { ...field, hidden, ref }, children));
});
