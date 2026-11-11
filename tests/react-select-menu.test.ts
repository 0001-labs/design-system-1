// @vitest-environment happy-dom
import { act, createElement as h, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { Select, type SelectEntry } from "../DS1/react/select";
await import("../DS1/3-unit/ds-select");
await import("../DS1/2-core/ds-button");

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); document.body.replaceChildren(); });

const rows = () => [...host.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
const row = (label: string) => rows().find(node => node.textContent?.includes(label))!;
const click = async (element: HTMLElement) => { await act(async () => { element.click(); await Promise.resolve(); }); };

function Example({ items, onChange = () => {} }: { items: SelectEntry[]; onChange?: (open: boolean) => void }) {
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(true);
  return h("div", null,
    h("button", { ref: setTrigger, type: "button" }, "More"),
    h(Select, { trigger, open, items, onOpenChange: (next: boolean) => { onChange(next); setOpen(next); } }));
}

test("a menu Select draws entries as data: headings, separators, icons, details, shortcuts and checks", async () => {
  const items: SelectEntry[] = [
    { heading: "Workspace" },
    { label: "Rename", icon: "pen", shortcut: "mod+r" },
    { label: "Pinned", checked: true, details: "On top" },
    { separator: true },
    { label: "Delete", danger: true },
  ];
  await act(async () => root.render(h(Example, { items })));
  const menu = host.querySelector("ds-select")!;
  expect(menu.getAttribute("role")).toBe("menu");
  expect(menu.querySelector("[data-ds-menu-label]")!.textContent).toBe("Workspace");
  expect(menu.querySelector("hr[data-ds-menu-separator]")).not.toBeNull();
  expect(row("Rename").querySelector('ds-icon[type="pen"]')).not.toBeNull();
  expect(row("Rename").textContent).toMatch(/R$/);
  expect(row("Pinned").getAttribute("role")).toBe("menuitemcheckbox");
  expect(row("Pinned").getAttribute("aria-checked")).toBe("true");
  expect(row("Pinned").textContent).toContain("On top");
  expect(row("Delete").closest("ds-button")!.hasAttribute("danger")).toBe(true);
});

test("choosing a row runs its action and closes; keepOpen and a prevented choice keep it open", async () => {
  const rename = vi.fn(), cycle = vi.fn(), changes = vi.fn();
  const items: SelectEntry[] = [
    { label: "Rename", onSelect: rename },
    { label: "Colour", keepOpen: true, onSelect: cycle },
    { label: "Ask", onSelect: event => event.preventDefault() },
  ];
  await act(async () => root.render(h(Example, { items, onChange: changes })));
  await click(row("Colour"));
  expect(cycle).toHaveBeenCalledOnce();
  expect(changes).not.toHaveBeenCalled();
  await click(row("Ask"));
  expect(changes).not.toHaveBeenCalled();
  await click(row("Rename"));
  expect(rename).toHaveBeenCalledOnce();
  expect(changes).toHaveBeenLastCalledWith(false);
});

test("a row with items opens a nested menu beside it", async () => {
  const items: SelectEntry[] = [{ label: "Move to", items: [{ label: "Inbox" }, { label: "Archive" }] }];
  await act(async () => root.render(h(Example, { items })));
  const nested = host.querySelectorAll("ds-select")[1]!;
  expect(nested.triggerMode).toBe("submenu");
  expect(nested.trigger).toBe(row("Move to"));
  await click(row("Move to"));
  expect(nested.open).toBe(true);
  expect([...nested.querySelectorAll('[role="menuitem"]')].map(node => node.textContent)).toEqual(["Inbox", "Archive"]);
});

test("with option children it is a field: a native select inside ds-select", async () => {
  await act(async () => root.render(h(Select, { name: "size", defaultValue: "m", native: true }, h("option", { value: "s" }, "Small"), h("option", { value: "m" }, "Medium"))));
  const field = host.querySelector("ds-select")!;
  expect(field.querySelector("select")!.value).toBe("m");
  expect(field.hasAttribute("native")).toBe(true);
});

/** A menu whose entries leave the document when it closes, as a product's own menu does. */
function Unmounting({ items }: { items: SelectEntry[] }) {
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(true);
  return h("div", null,
    h("button", { ref: setTrigger, type: "button" }, "More"),
    open ? h(Select, { trigger, open, items, onOpenChange: (next: boolean) => setOpen(next) }) : null);
}
/** What the browser finds once every handler ran, when it decides whether to follow the link. */
const followed = (link: HTMLElement) => new Promise<{ prevented: boolean; connected: boolean; href: string | null }>(resolve =>
  window.addEventListener("click", event => resolve({ prevented: event.defaultPrevented, connected: link.isConnected, href: link.getAttribute("href") }), { once: true }));
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve)); });

test("a link row is a real link the browser follows, and the menu closes after it", async () => {
  const chosen = vi.fn();
  await act(async () => root.render(h(Unmounting, { items: [{ label: "Documentation", href: "#documentation", onSelect: chosen }, { label: "Rename" }] })));
  const link = row("Documentation");
  expect(link.tagName).toBe("A");
  expect(link.getAttribute("href")).toBe("#documentation");
  expect(link.closest("ds-button")!.hasAttribute("menu-item")).toBe(true);
  const state = followed(link);
  await click(link);
  expect(await state).toEqual({ prevented: false, connected: true, href: "#documentation" });
  expect(chosen).toHaveBeenCalledOnce();
  await settle();
  expect(host.querySelector("ds-select")).toBeNull();
});

test("a link row keeps a modified click and the keyboard: Enter and Space follow it", async () => {
  const items: SelectEntry[] = [{ label: "Documentation", href: "#documentation" }];
  await act(async () => root.render(h(Unmounting, { items })));
  let link = row("Documentation"), state = followed(link);
  await act(async () => { link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true })); });
  expect(await state).toEqual({ prevented: false, connected: true, href: "#documentation" });
  await settle();
  for (const key of ["Enter", " "]) {
    await act(async () => root.render(h(Unmounting, { key, items })));
    link = row("Documentation"); state = followed(link);
    // The platform turns Enter on a link into a click by itself; Space is the row's own.
    const press = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    await act(async () => { link.dispatchEvent(press); if (key === "Enter" && !press.defaultPrevented) link.click(); });
    expect(await state).toEqual({ prevented: false, connected: true, href: "#documentation" });
    await settle();
    expect(host.querySelector("ds-select")).toBeNull();
  }
});

test("a link row stays put when disabled, kept open or declined", async () => {
  const disabled = vi.fn();
  const items: SelectEntry[] = [
    { label: "Disabled", href: "#disabled", disabled: true, onSelect: disabled },
    { label: "Kept", href: "#kept", keepOpen: true },
    { label: "Declined", href: "#declined", onSelect: event => event.preventDefault() },
  ];
  await act(async () => root.render(h(Unmounting, { items })));
  expect(row("Disabled").hasAttribute("href")).toBe(false);
  expect(row("Disabled").getAttribute("aria-disabled")).toBe("true");
  expect(row("Disabled").getAttribute("role")).toBe("menuitem");
  for (const label of ["Disabled", "Kept", "Declined"]) { await click(row(label)); await settle(); }
  expect(disabled).not.toHaveBeenCalled();
  expect(host.querySelector("ds-select")).not.toBeNull();
});
