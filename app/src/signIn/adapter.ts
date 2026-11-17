import type { SignInAdapter, SignInAvailability, SocialSignIn } from './sign-in'

export type SignInAction = (provider: string, params: Record<string, unknown>) => Promise<unknown>

export function signInAdapter(input: {
  signIn: SignInAction
  providers: () => Promise<SignInAvailability>
  passwordSignIn: (email: string) => Promise<boolean>
  redirectTo: () => string
  brand?: string
}): SignInAdapter {
  return {
    providers: input.providers,
    passwordSignIn: input.passwordSignIn,
    async requestCode(email) {
      await input.signIn('email-code', input.brand ? { email, brand: input.brand } : { email })
    },
    async signInWithCode(email, code) {
      await input.signIn('email-code', { email, code })
    },
    async signInWithPassword(email, password) {
      try {
        await input.signIn('password', { flow: 'signIn', email, password })
      } catch (problem) {
        if (!(problem instanceof Error && /InvalidAccountId|Invalid credentials/i.test(problem.message))) throw problem
        try {
          await input.signIn('password', { flow: 'signUp', email, password })
        } catch {
          throw problem
        }
      }
    },
    async signInWith(provider: SocialSignIn) {
      await input.signIn(provider, { redirectTo: input.redirectTo() })
    },
  }
}
