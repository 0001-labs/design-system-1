import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials'
import { createAccount } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalMutation } from '../_generated/server'
import { internal } from '../_generated/api'
import type { DataModel } from '../_generated/dataModel'
import { appleNativeClients, sha256, verifyAppleIdentityToken } from './appleIdentity'
import { exchangeAppleCode } from './appleTokens'
import { signInAvailability } from './social'

export const APPLE_NATIVE_PROVIDER_ID = 'apple-native'

export const consume = internalMutation({
  args: { digest: v.string(), expiresAt: v.number() }, returns: v.null(),
  handler: async (ctx, { digest, expiresAt }) => {
    if (expiresAt <= Date.now() || (await ctx.db.query('appleIdentityUses').withIndex('by_digest', (q) => q.eq('digest', digest)).unique())) throw new Error('Apple sign-in was already used or expired')
    await ctx.db.insert('appleIdentityUses', { digest, expiresAt })
    const expired = await ctx.db.query('appleIdentityUses').withIndex('by_expiresAt', (q) => q.lte('expiresAt', Date.now())).take(20)
    for (const entry of expired) await ctx.db.delete(entry._id)
    return null
  },
})

export function AppleNative({ defaultName }: { defaultName: string }) {
  return ConvexCredentials<DataModel>({
    id: APPLE_NATIVE_PROVIDER_ID,
    async authorize(params, ctx) {
      if (!signInAvailability(process.env, Date.now()).apple) throw new Error('Apple sign-in is not available yet. Continue with email.')
      if (typeof params.identityToken !== 'string' || typeof params.nonce !== 'string') throw new Error('Invalid Apple sign-in')
      const identity = await verifyAppleIdentityToken(params.identityToken, params.nonce, appleNativeClients(process.env))
      await ctx.runMutation(internal.signIn.appleNative.consume, { digest: await sha256(params.identityToken), expiresAt: identity.expiresAt })
      const refreshToken = await exchangeAppleCode({ code: typeof params.authorizationCode === 'string' ? params.authorizationCode : '', nonce: params.nonce, subject: identity.subject, clientId: identity.clientId }, process.env)
      const { user } = await createAccount(ctx, {
        provider: 'apple', account: { id: identity.subject },
        profile: { ...(identity.email ? { email: identity.email } : {}), emailVerified: identity.emailVerified,
          name: typeof params.name === 'string' && params.name.trim() ? params.name.trim().slice(0, 200) : defaultName },
      })
      if (!user) throw new Error('Account no longer exists')
      if (refreshToken) await ctx.runMutation(internal.signIn.appleTokens.store, { userId: user._id, clientId: identity.clientId, refreshToken })
      return { userId: user._id }
    },
  })
}
