// @vitest-environment happy-dom
import { beforeEach, afterEach, expect, test, vi } from "vite-plus/test";

const calls = vi.hoisted(() => ({ action: vi.fn(), verify: vi.fn() }));
vi.mock("convex/browser", () => ({
  ConvexClient: class {
    action(...args: unknown[]) { return calls.action(...args); }
    setAuth(_fetch: unknown, accepted?: (value: boolean) => void) { accepted?.(true); }
    clearAuth() {}
  },
  ConvexHttpClient: class {
    action(...args: unknown[]) { return calls.verify(...args); }
  },
}));

const proofKey = "__convexAuthOAuthVerifier_httpshappyotter123convexcloud";
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_CONVEX_URL", "https://happy-otter-123.convex.cloud");
  localStorage.clear();
  window.history.replaceState({}, "", "/app/signin");
  calls.action.mockReset();
  calls.verify.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

test.each(["google", "apple"])("Consistency keeps the %s verifier through navigation and redeems its one-use return code", async (provider) => {
  const redirect = `${window.location.origin}/api/auth/signin/${provider}`;
  const before = await import("../app/src/lib/backend");
  before.startAuth();
  calls.action.mockResolvedValue({ redirect, verifier: "opaque-return-proof" });
  await before.signIn(provider, { redirectTo: `${window.location.origin}/app/signin` });
  expect(window.location.href).toBe(redirect);
  expect(localStorage.getItem(proofKey)).toBe("opaque-return-proof");

  vi.resetModules();
  window.history.replaceState({}, "", "/app/signin?code=one-use-provider-code");
  calls.verify.mockResolvedValue({ tokens: { token: "provider-token", refreshToken: "provider-refresh" } });
  const after = await import("../app/src/lib/backend");
  after.startAuth();
  await vi.waitFor(() => expect(after.authToken.get()).toBe("provider-token"));
  expect(calls.verify.mock.calls[0][1]).toEqual({ params: { code: "one-use-provider-code" }, verifier: "opaque-return-proof" });
  expect(window.location.search).toBe("");
  await vi.waitFor(() => expect(localStorage.getItem(proofKey)).toBeNull());
  expect(after.authState.get().isAuthenticated).toBe(true);
});
