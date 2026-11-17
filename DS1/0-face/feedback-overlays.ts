import { feedbackWord } from "./feedback-words";

export interface AlertOptions {
  title: string;
  text?: string;
  confirm?: string;
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirm?: string;
  cancel?: string;
  danger?: boolean;
}

export interface PromptOptions {
  title: string;
  text?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  confirm?: string;
  cancel?: string;
}

type Kind = "alert" | "confirm" | "prompt";
interface Spec {
  kind: Kind;
  title: string;
  text?: string;
  confirm: string;
  cancel?: string;
  danger?: boolean;
  field?: { label?: string; value: string; placeholder?: string };
}

const waiting: Array<() => void> = [];
let open = false;
let count = 0;

function inLine<T>(show: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const start = () => {
      open = true;
      show().then(resolve, reject).finally(() => {
        open = false;
        waiting.shift()?.();
      });
    };
    if (open) waiting.push(start);
    else start();
  });
}

function focused(): HTMLElement | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active instanceof HTMLElement ? active : null;
}

function element<K extends keyof HTMLElementTagNameMap>(name: K, attributes: Record<string, string> = {}, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function show(spec: Spec): Promise<boolean | string | null> {
  return new Promise(resolve => {
    const id = `ds-feedback-${++count}`;
    const opener = focused();
    const phone = typeof matchMedia === "function" && matchMedia("(max-width: 768px)").matches;
    const dialog = element("dialog", {
      class: phone ? "ds-overlay ds-overlay--sheet" : "ds-overlay",
      role: spec.kind === "prompt" ? "dialog" : "alertdialog",
      "aria-labelledby": `${id}-title`,
      "data-ds-feedback": spec.kind,
    });
    const header = element("div", { "data-ds-overlay": "header" });
    header.appendChild(element("h2", { id: `${id}-title`, "data-ds-overlay": "title" }, spec.title));
    if (spec.text) {
      header.appendChild(element("p", { id: `${id}-text`, "data-ds-overlay": "description" }, spec.text));
      dialog.setAttribute("aria-describedby", `${id}-text`);
    }
    dialog.appendChild(header);

    let input: HTMLInputElement | undefined;
    if (spec.field) {
      const field = element("div", { "data-ds-overlay": "field" });
      input = element("input", { id: `${id}-field`, class: "ds-input", type: "text", autocomplete: "off" });
      input.value = spec.field.value;
      if (spec.field.placeholder) input.placeholder = spec.field.placeholder;
      if (spec.field.label) field.appendChild(element("label", { for: input.id, "data-ds-overlay": "label" }, spec.field.label));
      else input.setAttribute("aria-labelledby", `${id}-title`);
      field.appendChild(input);
      dialog.appendChild(field);
    }

    const footer = element("div", { "data-ds-overlay": "footer" });
    const cancel = spec.cancel === undefined ? undefined : element("button", { type: "button", class: "ds-button ds-button--secondary", value: "cancel" }, spec.cancel);
    const confirm = element("button", { type: "button", class: spec.danger ? "ds-button ds-button--danger" : "ds-button ds-button--primary", value: "confirm" }, spec.confirm);
    if (cancel) footer.appendChild(cancel);
    footer.appendChild(confirm);
    dialog.appendChild(footer);

    const declined = spec.kind === "prompt" ? null : false;
    let settled = false;
    const finish = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      resolve(spec.kind === "alert" ? true : confirmed ? (input ? input.value : true) : declined);
    };

    confirm.addEventListener("click", () => finish(true));
    cancel?.addEventListener("click", () => finish(false));
    input?.addEventListener("keydown", event => {
      if (event.key !== "Enter" || event.isComposing || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      finish(true);
    });
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish(false); });
    dialog.addEventListener("close", () => finish(false));

    const outside = (event: MouseEvent) => {
      if (event.target !== dialog) return false;
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    };
    let pressedOutside = false;
    if (!spec.danger) {
      dialog.addEventListener("pointerdown", event => { pressedOutside = event.button === 0 && outside(event); });
      dialog.addEventListener("click", event => {
        if (pressedOutside && outside(event)) finish(false);
        pressedOutside = false;
      });
    }

    const first = input ?? (spec.danger ? cancel : undefined) ?? confirm;
    first.setAttribute("autofocus", "");
    document.body.appendChild(dialog);
    try {
      dialog.showModal();
    } catch {
      dialog.setAttribute("open", "");
    }
    first.focus();
    input?.select();
  });
}

export function alert(options: AlertOptions | string): Promise<void> {
  const { title, text, confirm } = typeof options === "string" ? { title: options } as AlertOptions : options;
  if (typeof document === "undefined") return Promise.resolve();
  return inLine(() => show({ kind: "alert", title, text, confirm: confirm ?? feedbackWord("OK") })).then(() => undefined);
}

export function confirm(options: ConfirmOptions | string): Promise<boolean> {
  const { title, text, confirm: yes, cancel, danger } = typeof options === "string" ? { title: options } as ConfirmOptions : options;
  if (typeof document === "undefined") return Promise.resolve(false);
  return inLine(() => show({ kind: "confirm", title, text, confirm: yes ?? feedbackWord("OK"), cancel: cancel ?? feedbackWord("Cancel"), danger })).then(answer => answer === true);
}

export function prompt(options: PromptOptions | string): Promise<string | null> {
  const { title, text, label, value = "", placeholder, confirm: yes, cancel } = typeof options === "string" ? { title: options } as PromptOptions : options;
  if (typeof document === "undefined") return Promise.resolve(null);
  return inLine(() => show({
    kind: "prompt", title, text,
    confirm: yes ?? feedbackWord("OK"), cancel: cancel ?? feedbackWord("Cancel"),
    field: { label, value, placeholder },
  })).then(answer => typeof answer === "string" ? answer : null);
}
