import type { AuthProviderConfig } from '@convex-dev/auth/server'
import Google from '@auth/core/providers/google'
import Apple from '@auth/core/providers/apple'
import { AppleNative } from './appleNative'
import { EmailCode, type SendCode } from './emailCode'
import { OwnerPassword } from './password'
import { SystemOwner, type SystemOwnerOptions } from './systemOwner'
import { normalizeEmail } from './social'

export type SignInOptions = {
  product: string
  password?: boolean | Parameters<typeof OwnerPassword>[0]
  sendCode?: SendCode
  brands?: Record<string, string>
  appleNative?: boolean
  systemOwner?: SystemOwnerOptions
  extra?: AuthProviderConfig[]
}

export function signInProviders(options: SignInOptions): AuthProviderConfig[] {
  return [
    ...(options.appleNative ? [AppleNative({ defaultName: `${options.product} user` })] : []),
    EmailCode({ product: options.product, send: options.sendCode, brands: options.brands }),
    ...(options.password ? [OwnerPassword(options.password === true ? {} : options.password)] : []),
    ...(options.systemOwner ? [SystemOwner(options.systemOwner)] : []),
    Google({
      profile(profile) {
        return { id: profile.sub, email: normalizeEmail(profile.email), emailVerified: profile.email_verified === true, name: profile.name }
      },
    }),
    Apple({
      profile(profile, tokens) {
        const name = profile.user?.name
        return {
          id: profile.sub,
          ...(tokens?.refresh_token && process.env.AUTH_APPLE_ID ? { appleRefreshToken: tokens.refresh_token, appleClientId: process.env.AUTH_APPLE_ID } : {}),
          ...(profile.email ? { email: normalizeEmail(profile.email), emailVerified: profile.email_verified === true || profile.email_verified === 'true' } : {}),
          ...(name ? { name: [name.firstName, name.lastName].filter(Boolean).join(' ') } : {}),
        }
      },
    }),
    ...(options.extra ?? []),
  ]
}
