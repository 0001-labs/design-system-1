import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { EMAIL_CODE_PROVIDER_ID } from './emailCode'
import { APPLE_NATIVE_PROVIDER_ID } from './appleNative'
import { EMAIL_SHAPE, normalizeEmail, socialSignInStage } from './social'

export type SignInUserArgs = {
  existingUserId: Id<'users'> | null
  type: string
  provider: { id: string }
  profile: Record<string, unknown> & { email?: string; emailVerified?: boolean; name?: string; image?: string }
}

export type NewSignInUser = { email: string; name?: string; image?: string; emailVerificationTime?: number }

export async function resolveSignInUser(
  ctx: MutationCtx,
  args: SignInUserArgs,
  product: {
    findByEmail: (ctx: MutationCtx, email: string) => Promise<Id<'users'> | null>
    create: (ctx: MutationCtx, user: NewSignInUser) => Promise<Id<'users'>>
  },
): Promise<Id<'users'>> {
  const email = normalizeEmail(args.profile.email)
  const social = args.type === 'oauth' || args.provider.id === APPLE_NATIVE_PROVIDER_ID
  if (args.existingUserId) {
    const user = await ctx.db.get(args.existingUserId)
    if (!user) throw new Error('Account no longer exists')
    const verified = (args.type === 'verification' || social) && args.profile.emailVerified === true
    if (verified && email && normalizeEmail(user.email) === email && user.emailVerificationTime === undefined) {
      await ctx.db.patch(user._id, { emailVerificationTime: Date.now() })
    }
    return args.existingUserId
  }
  if (!EMAIL_SHAPE.test(email)) throw new Error('A valid email is required')
  if (social && args.profile.emailVerified !== true) throw new Error('Verify your email with your sign-in provider first')
  const found = await product.findByEmail(ctx, email)
  if (found) {
    if (args.provider.id === EMAIL_CODE_PROVIDER_ID || social) return found
    throw new Error('An account already uses this email. Sign in with the code sent to it.')
  }
  if (social && socialSignInStage(process.env.SOCIAL_SIGN_IN) !== 'public')
    throw new Error('Google and Apple sign-in are open to existing accounts for now. Sign in with the code sent to your email.')
  const name = typeof args.profile.name === 'string' ? args.profile.name.trim().slice(0, 200) : ''
  return product.create(ctx, {
    email,
    ...(name ? { name } : {}),
    ...(typeof args.profile.image === 'string' ? { image: args.profile.image } : {}),
    ...(social ? { emailVerificationTime: Date.now() } : {}),
  })
}
