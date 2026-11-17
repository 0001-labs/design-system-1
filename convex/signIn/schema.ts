import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const signInTables = {
  signInCodes: defineTable({ email: v.string(), sentAt: v.number() }).index('by_email', ['email']),
  appleRefreshTokens: defineTable({
    userId: v.id('users'), clientId: v.string(), refreshToken: v.string(),
    status: v.union(v.literal('active'), v.literal('pending')), attempts: v.number(), nextAttemptAt: v.number(),
  }).index('by_userId_and_clientId', ['userId', 'clientId']).index('by_status_and_nextAttemptAt', ['status', 'nextAttemptAt']),
  appleIdentityUses: defineTable({ digest: v.string(), expiresAt: v.number() }).index('by_digest', ['digest']).index('by_expiresAt', ['expiresAt']),
}
