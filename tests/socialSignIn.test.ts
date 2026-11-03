import { afterEach, expect, test, vi } from 'vite-plus/test';
const auth = vi.hoisted(() => ({ config: null as any }));
vi.mock('@convex-dev/auth/server', () => ({ convexAuth: (config: unknown) => { auth.config = config; return {}; } }));
await import('../convex/auth');
afterEach(() => vi.unstubAllEnvs());

const user = { _id: 'person', email: 'person@example.com', emailVerificationTime: 1 };
const context = () => ({ db: {
  get: vi.fn().mockResolvedValue(user), insert: vi.fn().mockResolvedValue('new-person'),
  query: vi.fn().mockReturnValue({ withIndex: () => ({ first: async () => null }) }),
} });
const args = { type: 'oauth', provider: { id: 'google' }, existingUserId: 'person', profile: { email: user.email, emailVerified: true } };

test('disabled or unconfigured providers refuse returning identities on the server', async () => {
  vi.stubEnv('AUTH_GOOGLE_ID', 'example-client'); vi.stubEnv('AUTH_GOOGLE_SECRET', 'example-secret');
  vi.stubEnv('SOCIAL_SIGN_IN', 'off');
  await expect(auth.config.callbacks.createOrUpdateUser(context(), args)).rejects.toThrow('not available');
  vi.stubEnv('SOCIAL_SIGN_IN', 'public'); vi.stubEnv('AUTH_GOOGLE_SECRET', '');
  await expect(auth.config.callbacks.createOrUpdateUser(context(), args)).rejects.toThrow('not available');
});

test('existing mode signs returning accounts in and refuses new ones; public mode creates verified users', async () => {
  vi.stubEnv('AUTH_GOOGLE_ID', 'example-client'); vi.stubEnv('AUTH_GOOGLE_SECRET', 'example-secret');
  vi.stubEnv('SOCIAL_SIGN_IN', 'existing');
  expect(await auth.config.callbacks.createOrUpdateUser(context(), args)).toBe('person');
  await expect(auth.config.callbacks.createOrUpdateUser(context(), { ...args, existingUserId: null })).rejects.toThrow('existing accounts');
  vi.stubEnv('SOCIAL_SIGN_IN', 'public');
  const ctx = context();
  expect(await auth.config.callbacks.createOrUpdateUser(ctx, { ...args, existingUserId: null })).toBe('new-person');
  expect(ctx.db.insert).toHaveBeenCalledWith('users', expect.objectContaining({ email: user.email, emailVerificationTime: expect.any(Number) }));
  await expect(auth.config.callbacks.createOrUpdateUser(context(), { ...args, existingUserId: null, profile: { ...args.profile, emailVerified: false } })).rejects.toThrow('Verify your email');
});
