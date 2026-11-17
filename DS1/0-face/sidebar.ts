export interface TreeRow {
  level: number;
  expanded?: boolean;
  disabled?: boolean;
  label?: string;
}

export interface TreeStep {
  focus?: number;
  toggle?: boolean;
  select?: boolean;
  activate?: boolean;
}

const available = (rows: readonly TreeRow[], from: number, step: 1 | -1) => {
  for (let index = from; index >= 0 && index < rows.length; index += step) if (!rows[index]!.disabled) return index;
  return undefined;
};

function typeahead(rows: readonly TreeRow[], index: number, letter: string) {
  const wanted = letter.toLocaleLowerCase();
  for (let offset = 1; offset <= rows.length; offset++) {
    const at = (index + offset) % rows.length;
    const row = rows[at]!;
    if (!row.disabled && (row.label ?? "").trim().toLocaleLowerCase().startsWith(wanted)) return at;
  }
  return undefined;
}

export function treeStep(rows: readonly TreeRow[], index: number, key: string): TreeStep | undefined {
  const row = rows[index];
  if (!row) return undefined;
  switch (key) {
    case "ArrowDown": return { focus: available(rows, index + 1, 1) ?? index };
    case "ArrowUp": return { focus: available(rows, index - 1, -1) ?? index };
    case "Home": return { focus: available(rows, 0, 1) ?? index };
    case "End": return { focus: available(rows, rows.length - 1, -1) ?? index };
    case "ArrowRight":
      if (row.expanded === false) return row.disabled ? {} : { toggle: true };
      if (row.expanded && (rows[index + 1]?.level ?? 0) > row.level) return { focus: available(rows, index + 1, 1) ?? index };
      return {};
    case "ArrowLeft": {
      if (row.expanded && !row.disabled) return { toggle: false };
      for (let at = index - 1; at >= 0; at--) if (rows[at]!.level < row.level) return rows[at]!.disabled ? {} : { focus: at };
      return {};
    }
    case "Enter": return row.disabled ? {} : { select: true, activate: true };
    case " ": return row.disabled ? {} : { select: true };
    default: {
      if (!/^\S$/u.test(key)) return undefined;
      const at = typeahead(rows, index, key);
      return at === undefined ? {} : { focus: at };
    }
  }
}

export interface SidebarEvents {
  "sidebar-toggle": CustomEvent<{ id: string; expanded: boolean }>;
  "sidebar-select": CustomEvent<{ id: string }>;
  "sidebar-activate": CustomEvent<{ id: string }>;
}

const ITEM = '[role="treeitem"]';
const level = (item: Element) => Math.max(1, Number.parseInt(item.getAttribute("aria-level") ?? "1", 10) || 1);
const expandedOf = (item: Element) => {
  const value = item.getAttribute("aria-expanded");
  return value === null ? undefined : value === "true";
};
const disabledOf = (item: Element) => item.getAttribute("aria-disabled") === "true";
const labelOf = (item: Element) => (item.querySelector(".ds-sidebar__label") ?? item).textContent ?? "";
const idOf = (item: HTMLElement) => item.dataset.id ?? item.id;

export function connectSidebar(tree: HTMLElement): () => void {
  const items = () => [...tree.querySelectorAll<HTMLElement>(ITEM)];
  const visible = () => items().filter(item => !item.hidden && !item.closest("[hidden]"));

  const rove = (focus?: HTMLElement) => {
    const rows = visible();
    const current = focus ?? rows.find(item => item.tabIndex === 0 && !disabledOf(item)) ?? rows.find(item => item.getAttribute("aria-selected") === "true") ?? rows.find(item => !disabledOf(item)) ?? rows[0];
    for (const item of items()) item.tabIndex = item === current ? 0 : -1;
    return current;
  };

  const send = <K extends keyof SidebarEvents>(name: K, detail: SidebarEvents[K]["detail"]) =>
    tree.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));

  const toggle = (item: HTMLElement, expanded: boolean) => {
    if (!send("sidebar-toggle", { id: idOf(item), expanded })) return;
    item.setAttribute("aria-expanded", String(expanded));
    const all = items();
    const own = level(item);
    let closedAt = Infinity;
    for (const row of all.slice(all.indexOf(item) + 1)) {
      const depth = level(row);
      if (depth <= own) break;
      if (depth <= closedAt) closedAt = Infinity;
      row.hidden = !expanded || depth > closedAt;
      if (expanded && !row.hidden && row.getAttribute("aria-expanded") === "false") closedAt = depth;
    }
    rove(item);
  };

  const select = (item: HTMLElement) => {
    if (!send("sidebar-select", { id: idOf(item) })) return;
    for (const row of items()) if (row.hasAttribute("aria-selected") || row === item) row.setAttribute("aria-selected", String(row === item));
  };

  const focus = (item: HTMLElement) => { rove(item); item.focus(); };

  const keydown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const item = (event.target as Element | null)?.closest<HTMLElement>(ITEM);
    if (!item || !tree.contains(item)) return;
    const rows = visible();
    const step = treeStep(rows.map(row => ({ level: level(row), expanded: expandedOf(row), disabled: disabledOf(row), label: labelOf(row) })), rows.indexOf(item), event.key);
    if (!step) return;
    event.preventDefault();
    if (step.toggle !== undefined) toggle(item, step.toggle);
    if (step.select) select(item);
    if (step.activate) send("sidebar-activate", { id: idOf(item) });
    if (step.focus !== undefined && rows[step.focus]) focus(rows[step.focus]!);
  };

  const click = (event: MouseEvent) => {
    const item = (event.target as Element | null)?.closest<HTMLElement>(ITEM);
    if (!item || !tree.contains(item) || disabledOf(item)) return;
    const disclosure = (event.target as Element).closest(".ds-sidebar__disclosure");
    if (disclosure && expandedOf(item) !== undefined) toggle(item, !expandedOf(item));
    else select(item);
    focus(item);
  };

  const dblclick = (event: MouseEvent) => {
    const item = (event.target as Element | null)?.closest<HTMLElement>(ITEM);
    if (!item || !tree.contains(item) || disabledOf(item) || (event.target as Element).closest(".ds-sidebar__disclosure")) return;
    send("sidebar-activate", { id: idOf(item) });
  };

  if (!tree.hasAttribute("role")) tree.setAttribute("role", "tree");
  rove();
  const observer = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => { if (!items().some(item => item.tabIndex === 0 && !item.hidden)) rove(); });
  observer?.observe(tree, { childList: true, subtree: true });
  tree.addEventListener("keydown", keydown);
  tree.addEventListener("click", click);
  tree.addEventListener("dblclick", dblclick);
  return () => {
    observer?.disconnect();
    tree.removeEventListener("keydown", keydown);
    tree.removeEventListener("click", click);
    tree.removeEventListener("dblclick", dblclick);
  };
}
