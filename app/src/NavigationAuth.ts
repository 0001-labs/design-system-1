import { nothing } from "lit";
import { api } from "../../convex/_generated/api";
import { authState, authToken, authStorageKey, LiveQuery, mutation } from "./lib/backend";
import { AppElement, defineElement } from "./lib/element";
import { libraryTemplate, templateVersion } from "./lib/libraryTemplate";
import type { Id } from "../../convex/_generated/dataModel";
import { BASE_LIBRARY } from "../../shared/active-library";

import { saveNavigationCache, clearNavigationCache, type NavigationSummary } from "../../shared/navigation-cache";

type AppNavigation = { token: string; components: { name: string; href: string; layer: number }[] };
const LIBRARY_ID = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Only the same-origin parent receives the signed-in workspace summary. Draws nothing.
 * Asked with `ds1:active-library-request` `{ id }`, it also keeps that one library's draft
 * stylesheet live for the parent's examples as `ds1:active-library-styles` `{ id, name, css }`,
 * `css: null` when the library is not the caller's, is gone, or nobody is signed in.
 */
export class NavigationAuth extends AppElement {
  static properties = {
    appNavigation: { state: true },
    navigationLoading: { state: true },
    creating: { state: true },
    creationError: { state: true },
  };
  declare appNavigation: AppNavigation | null;
  declare navigationLoading: boolean;
  declare creating: boolean;
  declare creationError: string | null;

  #ready = () => { const { isLoading, isAuthenticated } = authState.get(); return !isLoading && isAuthenticated; };
  #profile = new LiveQuery(this, api.users.profile, () => this.#ready() ? {} : "skip");
  #libraries = new LiveQuery(this, api.libraries.list, () => this.#ready() ? {} : "skip");
  /** The one library whose styles the parent asked for; null stops. */
  #activeLibrary: string | null = null;
  #activeStyles = new LiveQuery(this, api.libraries.get, () => this.#ready() && this.#activeLibrary ? { id: this.#activeLibrary as Id<"libraries"> } : "skip");
  /** What was last sent for it, so each draft is sent once. */
  #sentStyles: string | null = null;
  #pending = false;
  #reportVersion = 0;
  /** The session the navigation was last asked for, so it is asked once per change. */
  #session: string | null = null;
  #controller: AbortController | null = null;

  constructor() {
    super();
    this.appNavigation = null;
    this.navigationLoading = true;
    this.creating = false;
    this.creationError = null;
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("message", this.#request);
  }

  override disconnectedCallback() {
    window.removeEventListener("message", this.#request);
    this.#controller?.abort();
    this.#session = null;
    super.disconnectedCallback();
  }

  /** Asks the Worker for App's places whenever the session changes; signed out, its document session ends. */
  #follow(isLoading: boolean, ready: boolean, token: string | null) {
    const session = JSON.stringify([isLoading, ready, token]);
    if (session === this.#session) return;
    this.#session = session;
    this.#controller?.abort();
    this.#controller = null;
    this.appNavigation = null;
    if (isLoading) return;
    if (!ready || !token) {
      clearNavigationCache();
      this.navigationLoading = false;
      void fetch("/api/dashboard/session", { method: "DELETE", cache: "no-store" }).catch(() => {});
      return;
    }
    const controller = this.#controller = new AbortController();
    this.navigationLoading = true;
    void fetch("/api/app-navigation", { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) {
          await fetch("/api/dashboard/session", { method: "DELETE", cache: "no-store", signal: controller.signal });
          return;
        }
        const data = await response.json();
        if (!controller.signal.aborted && Array.isArray(data.components)) this.appNavigation = { token, components: data.components };
      }).catch(() => { /* Access unavailable: keep internal navigation hidden. */ })
      .finally(() => { if (!controller.signal.aborted) this.navigationLoading = false; });
  }

  async #report() {
    const version = ++this.#reportVersion;
    const { isLoading } = authState.get();
    const ready = this.#ready();
    const token = authToken.get();
    const libraries = this.#libraries.value;
    const summary: NavigationSummary = {
      type: "ds1:navigation-auth", authenticated: ready, loading: isLoading || (ready && this.navigationLoading),
      // App's places answer only the owner, so having them is being the owner.
      owner: ready && token === this.appNavigation?.token,
      appComponents: ready && token === this.appNavigation?.token ? this.appNavigation.components : [],
      companyName: ready ? this.#profile.value?.companyName ?? "" : "",
      libraries: ready ? libraries?.map(({ _id, name, publishedVersion }) => ({ id: _id, name, publishedVersion })) ?? [] : [],
      librariesLoaded: ready && libraries !== undefined, creating: this.creating, creationError: this.creationError,
    };
    const cacheExpiresAt = await saveNavigationCache(authStorageKey, token, summary);
    if (version !== this.#reportVersion || token !== authToken.get() || isLoading !== authState.get().isLoading || ready !== this.#ready() || !this.isConnected) return;
    window.parent.postMessage({ ...summary, cacheExpiresAt }, window.location.origin);
  }

  #request = async (event: MessageEvent) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    if (event.data?.type === "ds1:navigation-auth-request") this.#report();
    if (event.data?.type === "ds1:active-library-request") {
      const { id } = event.data;
      if (id !== null && (typeof id !== "string" || !LIBRARY_ID.test(id) || id === BASE_LIBRARY)) return;
      // Asking again for the same library answers again.
      this.#activeLibrary = id;
      this.#sentStyles = null;
      this.requestUpdate();
      return;
    }
    if (event.data?.type !== "ds1:create-library" || !this.#ready() || this.#pending) return;
    this.#pending = true; this.creating = true; this.creationError = null;
    try {
      const library = await mutation(api.libraries.create, { name: "Untitled library", css: libraryTemplate, config: JSON.stringify({ schema: 2 }), templateVersion: templateVersion() });
      window.parent.postMessage({ type: "ds1:library-created", id: library._id }, window.location.origin);
    } catch { this.creationError = "Could not create a library. Try again from My libraries."; }
    finally { this.#pending = false; this.creating = false; }
  };

  override willUpdate() {
    this.#follow(authState.get().isLoading, this.#ready(), authToken.get());
  }

  override render() {
    return nothing;
  }

  /** Every change is reported to the parent. */
  override updated() {
    if (!this.isConnected) return;
    this.#report();
    this.#reportStyles();
  }

  /** The asked-for library's draft, once per change; nothing while the session or the draft is still loading. */
  #reportStyles() {
    const id = this.#activeLibrary;
    if (!id || authState.get().isLoading) return;
    const library = this.#ready() ? this.#activeStyles.value : null;
    if (library === undefined || (library && library._id !== id)) return;
    const answer = { type: "ds1:active-library-styles", id, name: library?.name ?? null, css: library?.draftCss ?? null };
    const sent = JSON.stringify(answer);
    if (sent === this.#sentStyles) return;
    this.#sentStyles = sent;
    window.parent.postMessage(answer, window.location.origin);
  }
}
defineElement("ds1-navigation-auth", NavigationAuth);
