import type { ReactiveController, ReactiveControllerHost } from "lit";
import { baseOverrides, TOKENS_START, type BaseOverride } from "../../../shared/base-sheet";
import { AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_MAX_WAIT_MS, backoffMs } from "./autosave";
import { authToken } from "./backend";
import { libraryTemplate } from "./libraryTemplate";
import { setLibraryToken } from "./libraryTokens";

export type Base = { css: string; rev: number; version: number; updatedAt: number; sheet: string; contentHash: string };
export type BaseVersion = { version: number; createdAt: number; contentHash: string; restoredFrom: number | null; overrides: number };
export type DraftState = "live" | "dirty" | "saving" | "conflict" | "error";

type Body = { base?: Base | null; history?: BaseVersion[]; error?: { code?: string; message?: string } | string };

export interface BaseDraftOptions {
  template?: string;
  fetch?: typeof fetch;
  token?: () => string | null;
}

export class BaseDraft implements ReactiveController {
  base: Base | null | undefined = undefined;
  history: BaseVersion[] = [];
  state: DraftState = "live";
  failure = "";
  seed = 0;
  #css = "";
  #rev = 0;
  #pending: string | null = null;
  #saved: string | null = null;
  #debounce: ReturnType<typeof setTimeout> | null = null;
  #maxWait: ReturnType<typeof setTimeout> | null = null;
  #retry: ReturnType<typeof setTimeout> | null = null;
  #attempt = 0;
  #connected = false;
  readonly #host: ReactiveControllerHost;
  readonly #template: string;
  readonly #fetch: typeof fetch;
  readonly #token: () => string | null;

  constructor(host: ReactiveControllerHost, options: BaseDraftOptions = {}) {
    this.#host = host;
    this.#template = options.template ?? libraryTemplate;
    this.#fetch = options.fetch ?? ((...args) => fetch(...args));
    this.#token = options.token ?? (() => authToken.get());
    host.addController(this);
  }

  hostConnected() {
    this.#connected = true;
    window.addEventListener("pagehide", this.#flushNow);
    void this.load();
  }

  hostDisconnected() {
    this.#connected = false;
    window.removeEventListener("pagehide", this.#flushNow);
    this.#flushNow();
    for (const timer of [this.#debounce, this.#maxWait, this.#retry]) if (timer) clearTimeout(timer);
    this.#debounce = this.#maxWait = this.#retry = null;
  }

  get css() { return this.#css; }

  get overrides(): BaseOverride[] {
    const result = baseOverrides(this.#css);
    return "overrides" in result ? result.overrides : [];
  }

  value(name: string) { return this.overrides.find(([token]) => token === name)?.[1]; }

  edit(name: string, value: string) { this.replace(setLibraryToken(this.#css, name, value)); }

  remove(name: string) { this.edit(name, ""); }

  replace(css: string) {
    if (this.base === undefined || css === this.#css) return;
    this.#css = css;
    if (css === this.#saved) { this.#pending = null; this.#update(); return; }
    this.#pending = css;
    if (this.state !== "conflict" && this.state !== "saving") this.state = "dirty";
    if (this.#debounce) clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => { this.#debounce = null; void this.flush(); }, AUTOSAVE_DEBOUNCE_MS);
    this.#maxWait ??= setTimeout(() => { this.#maxWait = null; void this.flush(); }, AUTOSAVE_MAX_WAIT_MS);
    this.#update();
  }

  async load() {
    const { response, body } = await this.#request("/api/base");
    if (!response.ok) {
      this.failure = typeof body.error === "string" ? body.error : body.error?.message ?? "The base could not be read.";
      this.#update();
      return;
    }
    this.base = body.base ?? null;
    this.history = body.history ?? [];
    this.#rev = this.base?.rev ?? 0;
    this.#saved = this.#initial(this.base?.css);
    this.#css = this.#saved;
    this.#pending = null;
    this.failure = "";
    this.state = "live";
    this.seed += 1;
    this.#update();
  }

  flush = async () => {
    const css = this.#pending;
    if (css === null || this.state === "conflict" || this.state === "saving") return;
    if (this.#debounce) { clearTimeout(this.#debounce); this.#debounce = null; }
    if (this.#maxWait) { clearTimeout(this.#maxWait); this.#maxWait = null; }
    this.state = "saving";
    this.#update();
    const { response, body } = await this.#request("/api/base", { method: "PUT", body: JSON.stringify({ css, baseRev: this.#rev }) });
    if (response.ok && body.base) {
      this.#accept(body.base, css);
      if (this.#pending === css) this.#pending = null;
      this.state = this.#pending ? "dirty" : "live";
      this.#update();
      if (this.#pending) void this.flush();
      return;
    }
    const error = typeof body.error === "object" ? body.error : undefined;
    if (error?.code === "draft_conflict") { this.state = "conflict"; this.#update(); return; }
    this.state = "error";
    this.failure = error?.message ?? (typeof body.error === "string" ? body.error : "");
    this.#attempt += 1;
    this.#retry = setTimeout(() => {
      this.#retry = null;
      if (this.#connected && this.#pending) { this.state = "dirty"; void this.flush(); }
    }, backoffMs(this.#attempt));
    this.#update();
  };

  async restore(version: number) {
    this.state = "saving";
    this.#update();
    const { response, body } = await this.#request("/api/base/restore", { method: "POST", body: JSON.stringify({ version }) });
    if (!response.ok || !body.base) {
      this.state = "error";
      this.failure = typeof body.error === "object" ? body.error?.message ?? "" : body.error ?? "";
      this.#update();
      return;
    }
    await this.load();
  }

  #initial(css: string | undefined) {
    const from = css?.lastIndexOf(TOKENS_START) ?? -1;
    return from < 0 ? this.#template : `${this.#template.trimEnd()}\n\n${css!.slice(from)}`;
  }

  #accept(base: Base, css: string) {
    this.base = base;
    this.#rev = base.rev;
    this.#saved = css;
    this.#attempt = 0;
    this.failure = "";
    if (!this.history.some(row => row.version === base.version)) {
      const overrides = (base.sheet.match(/^\s+--/gm) ?? []).length;
      this.history = [{ version: base.version, createdAt: base.updatedAt, contentHash: base.contentHash, restoredFrom: null, overrides }, ...this.history].slice(0, 50);
    }
  }

  #flushNow = () => { if (this.#pending) void this.flush(); };

  async #request(path: string, init: RequestInit = {}) {
    const token = this.#token();
    try {
      const response = await this.#fetch(path, { ...init, cache: "no-store", headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) } });
      const body = await response.json().catch(() => ({})) as Body;
      return { response, body };
    } catch {
      return { response: { ok: false, status: 0 } as Response, body: { error: "The base could not be reached." } as Body };
    }
  }

  #update() { this.#host.requestUpdate(); }
}
