import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials'
import { Password } from '@convex-dev/auth/providers/Password'
import { normalizeEmail, passwordAllowed } from './social'

type PasswordConfig = NonNullable<Parameters<typeof Password>[0]>
type CredentialsConfig = Parameters<typeof ConvexCredentials>[0]

export function OwnerPassword(config: PasswordConfig = {}) {
  const base = Password(config.profile ? config : { ...config, profile: (params) => ({ email: normalizeEmail(params.email) }) })
  const inner = (base as unknown as { options: CredentialsConfig }).options
  return ConvexCredentials({
    ...inner,
    async authorize(params, ctx) {
      if (params.flow !== 'signIn' && !passwordAllowed(process.env, params.email)) throw new Error('Sign in with the code sent to your email.')
      return inner.authorize(params, ctx)
    },
  })
}
