// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
const backend = vi.hoisted(() => ({ query: vi.fn(), signIn: vi.fn() }));
vi.mock('../lib/backend', () => backend);
import './SignIn';
import type { SignIn } from './SignIn';

afterEach(() => { document.body.replaceChildren(); vi.clearAllMocks(); });

test('Consistency members can choose either configured social provider; owner-only tools remain email-only', async () => {
  backend.query.mockResolvedValue({ google: true, apple: true, code: true, newAccounts: true });
  const screen = document.createElement('ds1-sign-in') as SignIn;
  screen.privateTitle = 'Consistency'; screen.anyone = true; screen.brand = 'consistency';
  document.body.append(screen);
  await screen.updateComplete;
  let adapter = screen.querySelector('sign-in-screen')!.adapter!;
  expect(await adapter.providers()).toMatchObject({ google: true, apple: true });
  await adapter.signInWith('google');
  expect(backend.signIn).toHaveBeenCalledWith('google', { redirectTo: `${window.location.origin}${window.location.pathname}` });
  await adapter.requestCode('member@example.com');
  expect(backend.signIn).toHaveBeenCalledWith('email-code', { email: 'member@example.com', brand: 'consistency' });
  screen.brand = undefined;
  await screen.updateComplete;
  adapter = screen.querySelector('sign-in-screen')!.adapter!;
  expect(await adapter.providers()).toMatchObject({ google: false, apple: false });
  screen.brand = 'consistency';
  screen.anyone = false;
  await screen.updateComplete;
  adapter = screen.querySelector('sign-in-screen')!.adapter!;
  expect(await adapter.providers()).toMatchObject({ google: false, apple: false });
});
