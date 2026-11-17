import { computed, signal } from "@lit-labs/signals";
import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { makeFunctionReference, type FunctionArgs, type FunctionReference, type FunctionReturnType } from "convex/server";
import { convexToJson } from "convex/values";
import type { ReactiveController, ReactiveControllerHost } from "lit";

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!url) throw new Error("VITE_CONVEX_URL is not set. Copy .env.local into this checkout.");

export const client = new ConvexClient(url);

type Tokens = { token: string; refreshToken: string };
type SignInResult = { tokens?: Tokens | null; redirect?: string; verifier?: string };
const signInAction = makeFunctionReference<"action", Record<string, unknown>, SignInResult>("auth:signIn");
const signOutAction = makeFunctionReference<"action", Record<string, never>, null>("auth:signOut");

const namespace = url.replace(/[^a-zA-Z0-9]/g, "");
const storageKey = (name: string) => `${name}_${namespace}`;
const JWT = "__convexAuthJWT", REFRESH = "__convexAuthRefreshToken", VERIFIER = "__convexAuthOAuthVerifier";
const stored = {
  get(name: string) { try { return localStorage.getItem(storageKey(name)); } catch { return null; } },
  set(name: string, value: string) { try { localStorage.setItem(storageKey(name), value); } catch {} },
  remove(name: string) { try { localStorage.removeItem(storageKey(name)); } catch {} },
};

export const authStorageKey = storageKey(JWT);

export const authToken = signal<string | null>(null);
const reading = signal(true);
const accepted = signal<boolean | null>(null);

export const authState = computed(() => {
  if (reading.get()) return { isLoading: true, isAuthenticated: false };
  if (authToken.get() === null) return { isLoading: false, isAuthenticated: false };
  const confirmed = accepted.get();
  return { isLoading: confirmed === null, isAuthenticated: confirmed === true };
});

let token: string | null = null;
let refreshing = false;

function setTokens(tokens: { token: string; refreshToken?: string } | null, store: boolean) {
  const was = token !== null;
  token = tokens?.token ?? null;
  if (store) {
    if (tokens) {
      stored.set(JWT, tokens.token);
      if (tokens.refreshToken) stored.set(REFRESH, tokens.refreshToken);
    } else {
      stored.remove(JWT);
      stored.remove(REFRESH);
    }
  }
  reading.set(false);
  authToken.set(token);
  if (was === (token !== null)) return;
  if (token) {
    accepted.set(null);
    client.setAuth(fetchAccessToken, ok => accepted.set(ok));
  } else {
    client.client.clearAuth();
    accepted.set(false);
  }
}

const retries = [500, 2000];
async function verify(args: Record<string, unknown>): Promise<SignInResult> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await new ConvexHttpClient(url!).action(signInAction, args);
    } catch (error) {
      if (attempt >= retries.length || !(error instanceof TypeError)) throw error;
      await new Promise(resolve => setTimeout(resolve, retries[attempt]! + 100 * Math.random()));
    }
  }
}

function exclusive<T>(name: string, run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  return locks ? (locks.request(name, run) as Promise<T>) : run();
}

async function fetchAccessToken({ forceRefreshToken }: { forceRefreshToken: boolean }) {
  if (!forceRefreshToken) return token;
  const before = token;
  return exclusive(REFRESH, async () => {
    if (token !== before) return token;
    const refreshToken = stored.get(REFRESH);
    if (refreshToken === null) return null;
    refreshing = true;
    try {
      const { tokens } = await verify({ refreshToken });
      setTokens(tokens ?? null, true);
    } finally {
      refreshing = false;
    }
    return token;
  });
}

export async function signIn(provider: string | undefined, params: Record<string, unknown> = {}) {
  const verifier = stored.get(VERIFIER) ?? undefined;
  stored.remove(VERIFIER);
  const result = await client.action(signInAction, { ...(provider === undefined ? {} : { provider }), params, ...(verifier === undefined ? {} : { verifier }) });
  if (result.redirect !== undefined) {
    const redirect = new URL(result.redirect);
    if (result.verifier) stored.set(VERIFIER, result.verifier);
    window.location.href = redirect.toString();
    return { signingIn: false, redirect };
  }
  if (result.tokens !== undefined) {
    setTokens(result.tokens, true);
    return { signingIn: result.tokens !== null };
  }
  return { signingIn: false };
}

export async function signOut() {
  try { await client.action(signOutAction, {}); } catch {}
  setTokens(null, true);
}

let started = false;
export function startAuth() {
  if (started) return;
  started = true;
  window.addEventListener("beforeunload", event => { if (refreshing) event.preventDefault(); });
  window.addEventListener("storage", event => {
    if (event.storageArea !== localStorage || event.key !== storageKey(JWT)) return;
    setTokens(event.newValue === null ? null : { token: event.newValue }, false);
  });
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) {
    const kept = stored.get(JWT);
    setTokens(kept === null ? null : { token: kept }, false);
    return;
  }
  const address = new URL(window.location.href);
  address.searchParams.delete("code");
  window.history.replaceState({}, "", address.pathname + address.search + address.hash);
  window.dispatchEvent(new PopStateEvent("popstate"));
  const verifier = stored.get(VERIFIER);
  void verify({ params: { code }, ...(verifier === null ? {} : { verifier }) })
    .then(({ tokens }) => setTokens(tokens ?? null, true))
    .catch(() => setTokens(null, true))
    .finally(() => stored.remove(VERIFIER));
}

export const query = <Query extends FunctionReference<"query">>(ref: Query, args: FunctionArgs<Query>) => client.query(ref, args);
export const mutation = <Mutation extends FunctionReference<"mutation">>(ref: Mutation, args: FunctionArgs<Mutation>) => client.mutation(ref, args);
export const action = <Action extends FunctionReference<"action">>(ref: Action, args: FunctionArgs<Action>) => client.action(ref, args);

export class LiveQuery<Query extends FunctionReference<"query">> implements ReactiveController {
  value: FunctionReturnType<Query> | undefined = undefined;
  #key: string | null = null;
  #stop: (() => void) | undefined;

  constructor(private host: ReactiveControllerHost, private ref: Query, private args: () => FunctionArgs<Query> | "skip") {
    host.addController(this);
  }

  hostConnected() {
    if (this.#key === null) this.host.requestUpdate();
  }

  hostUpdate() {
    const args = this.args();
    const key = args === "skip" ? "skip" : JSON.stringify(convexToJson(args));
    if (key === this.#key) return;
    this.#stop?.();
    this.#stop = undefined;
    this.#key = key;
    if (args === "skip") { this.value = undefined; return; }
    const unsubscribe = client.onUpdate(this.ref, args, value => {
      this.value = value;
      this.host.requestUpdate();
    }, error => console.error(error));
    this.#stop = unsubscribe;
    this.value = unsubscribe.getCurrentValue();
  }

  hostDisconnected() {
    this.#stop?.();
    this.#stop = undefined;
    this.#key = null;
  }
}
