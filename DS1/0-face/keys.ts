export type KeyPlatform = "apple" | "other";

export interface ShortcutOptions {
  platform?: KeyPlatform;
}

export interface Shortcut {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

export type KeyWord =
  | "key.ctrl" | "key.shift" | "key.alt" | "key.enter" | "key.escape" | "key.tab" | "key.space"
  | "key.backspace" | "key.delete" | "key.home" | "key.end" | "key.pageup" | "key.pagedown";
export type KeyWords = Partial<Record<KeyWord, string>> | ((word: KeyWord) => string);

const ENGLISH: Record<KeyWord, string> = {
  "key.ctrl": "Ctrl", "key.shift": "Shift", "key.alt": "Alt", "key.enter": "Enter", "key.escape": "Esc",
  "key.tab": "Tab", "key.space": "Space", "key.backspace": "Backspace", "key.delete": "Del",
  "key.home": "Home", "key.end": "End", "key.pageup": "PgUp", "key.pagedown": "PgDn",
};

const TRANSLATOR = Symbol.for("design-system-1.translate");
let words: KeyWords | null = null;

export function setKeyWords(next: KeyWords | null): void {
  words = next;
}

export function keyWord(word: KeyWord): string {
  if (typeof words === "function") return words(word);
  const own = words?.[word];
  if (own !== undefined) return own;
  const translate = (globalThis as unknown as Record<symbol, unknown>)[TRANSLATOR];
  if (typeof translate === "function") {
    const text = String(translate(word));
    if (text && text !== word) return text;
  }
  return ENGLISH[word];
}

export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = data?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod|ios/i.test(platform);
}

const platformOf = (options?: ShortcutOptions): KeyPlatform => options?.platform ?? (isApplePlatform() ? "apple" : "other");

export function modKey(options?: ShortcutOptions): string {
  return platformOf(options) === "apple" ? "⌘" : keyWord("key.ctrl");
}

export function isModKey(event: { metaKey: boolean; ctrlKey: boolean }, options?: ShortcutOptions): boolean {
  return platformOf(options) === "apple" ? event.metaKey : event.ctrlKey;
}

const TEXT_INPUTS = new Set(["", "text", "search", "email", "url", "tel", "password", "number", "date", "datetime-local", "month", "time", "week"]);

function origin(event: Event): Element | null {
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  const first = path.find(node => node instanceof Element) ?? event.target;
  return first instanceof Element ? first : null;
}

export function isTyping(event: Event): boolean {
  const keyboard = event as KeyboardEvent;
  if (keyboard.isComposing || keyboard.keyCode === 229) return true;
  let element = origin(event);
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  if (!element) return false;
  if (element instanceof HTMLInputElement) return TEXT_INPUTS.has(element.type.toLowerCase()) && !element.readOnly;
  if (element instanceof HTMLTextAreaElement) return !element.readOnly;
  if (element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  if (element.closest('[contenteditable]:not([contenteditable="false"])')) return true;
  return Boolean(element.closest('[role="textbox"], [role="searchbox"], [role="combobox"]'));
}

const ALIASES: Record<string, string> = {
  esc: "escape", return: "enter", del: "delete", up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright",
  spacebar: "space", " ": "space", pgup: "pageup", pgdn: "pagedown", cmd: "meta", command: "meta", control: "ctrl", option: "alt", opt: "alt",
};

export function parseShortcut(shortcut: string, options?: ShortcutOptions): Shortcut {
  const apple = platformOf(options) === "apple";
  const parts = shortcut.trim().toLowerCase().split("+").map(part => part.trim());
  const raw = parts[parts.length - 1] === "" ? "plus" : parts.pop()!;
  const result: Shortcut = { ctrl: false, meta: false, alt: false, shift: false, key: ALIASES[raw] ?? raw };
  for (const part of parts) {
    const name = ALIASES[part] ?? part;
    if (name === "mod") result[apple ? "meta" : "ctrl"] = true;
    else if (name === "ctrl" || name === "meta" || name === "alt" || name === "shift") result[name] = true;
    else if (name !== "") throw new Error(`Unknown modifier in shortcut "${shortcut}": ${part}`);
  }
  if (!result.key) throw new Error(`A shortcut names a key: "${shortcut}"`);
  return result;
}

const EVENT_KEYS: Record<string, string> = {
  enter: "Enter", escape: "Escape", tab: "Tab", space: " ", backspace: "Backspace", delete: "Delete",
  home: "Home", end: "End", pageup: "PageUp", pagedown: "PageDown", insert: "Insert",
  arrowup: "ArrowUp", arrowdown: "ArrowDown", arrowleft: "ArrowLeft", arrowright: "ArrowRight", plus: "+",
};

const shifted = (key: string) => key.length === 1 && !/[a-z0-9]/.test(key);

export function matchesShortcut(event: KeyboardEvent, shortcut: string | Shortcut, options?: ShortcutOptions): boolean {
  const wanted = typeof shortcut === "string" ? parseShortcut(shortcut, options) : shortcut;
  if (event.ctrlKey !== wanted.ctrl || event.metaKey !== wanted.meta || event.altKey !== wanted.alt) return false;
  if (!shifted(wanted.key) && event.shiftKey !== wanted.shift) return false;
  if (shifted(wanted.key) && wanted.shift && !event.shiftKey) return false;
  const key = wanted.key;
  if (/^[a-z]$/.test(key)) return event.key.toLowerCase() === key || event.code === `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return event.key === key || event.code === `Digit${key}`;
  if (/^f([1-9]|1[0-9]|2[0-4])$/.test(key)) return event.key.toLowerCase() === key;
  const named = EVENT_KEYS[key];
  if (named) return event.key === named || (key === "space" && event.code === "Space");
  return event.key.toLowerCase() === key;
}

const APPLE_KEYS: Record<string, string> = {
  enter: "↩", escape: "⎋", tab: "⇥", backspace: "⌫", delete: "⌦", home: "↖", end: "↘", pageup: "⇞", pagedown: "⇟",
};
const ARROWS: Record<string, string> = { arrowup: "↑", arrowdown: "↓", arrowleft: "←", arrowright: "→" };
const WORDS: Record<string, KeyWord> = {
  enter: "key.enter", escape: "key.escape", tab: "key.tab", space: "key.space", backspace: "key.backspace",
  delete: "key.delete", home: "key.home", end: "key.end", pageup: "key.pageup", pagedown: "key.pagedown",
};

function keyLabel(key: string, apple: boolean): string {
  if (ARROWS[key]) return ARROWS[key]!;
  if (key === "plus") return "+";
  if (apple && APPLE_KEYS[key]) return APPLE_KEYS[key]!;
  if (WORDS[key]) return keyWord(WORDS[key]!);
  if (/^f\d{1,2}$/.test(key)) return key.toUpperCase();
  if (key === "insert") return "Ins";
  return key.length === 1 ? key.toUpperCase() : key[0]!.toUpperCase() + key.slice(1);
}

export function shortcutLabel(shortcut: string, options?: ShortcutOptions): string {
  const apple = platformOf(options) === "apple";
  const parts = parseShortcut(shortcut, options);
  const key = keyLabel(parts.key, apple);
  if (apple) return `${parts.ctrl ? "⌃" : ""}${parts.alt ? "⌥" : ""}${parts.shift ? "⇧" : ""}${parts.meta ? "⌘" : ""}${key}`;
  return [
    parts.meta ? "Meta" : "",
    parts.ctrl ? keyWord("key.ctrl") : "",
    parts.alt ? keyWord("key.alt") : "",
    parts.shift ? keyWord("key.shift") : "",
    key,
  ].filter(Boolean).join("+");
}

export function ariaKeyShortcuts(shortcut: string, options?: ShortcutOptions): string {
  const parts = parseShortcut(shortcut, options);
  const key = parts.key === "space" ? "Space" : EVENT_KEYS[parts.key] ?? parts.key.toUpperCase();
  return [parts.ctrl && "Control", parts.alt && "Alt", parts.shift && "Shift", parts.meta && "Meta", key].filter(Boolean).join("+");
}

export interface OnShortcutOptions extends ShortcutOptions {
  target?: EventTarget;
  typing?: boolean;
  preventDefault?: boolean;
  repeat?: boolean;
  capture?: boolean;
  signal?: AbortSignal;
}

export function onShortcut(shortcut: string | string[], handler: (event: KeyboardEvent) => void, options: OnShortcutOptions = {}): () => void {
  const target = options.target ?? (typeof document === "undefined" ? undefined : document);
  if (!target) return () => {};
  const shortcuts = (Array.isArray(shortcut) ? shortcut : [shortcut]).map(text => text.trim());
  const listener = (event: Event) => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.defaultPrevented) return;
    if (keyboard.repeat && options.repeat === false) return;
    if (!options.typing && isTyping(keyboard)) return;
    if (!shortcuts.some(text => matchesShortcut(keyboard, text, options))) return;
    if (options.preventDefault !== false) keyboard.preventDefault();
    handler(keyboard);
  };
  const capture = Boolean(options.capture);
  target.addEventListener("keydown", listener, { capture });
  const off = () => {
    target.removeEventListener("keydown", listener, { capture });
    options.signal?.removeEventListener("abort", off);
  };
  options.signal?.addEventListener("abort", off, { once: true });
  if (options.signal?.aborted) off();
  return off;
}
