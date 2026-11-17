import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials'
import { Email } from '@convex-dev/auth/providers/Email'
import { createAccount, signInViaProvider } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalMutation, type ActionCtx } from '../_generated/server'
import { internal } from '../_generated/api'
import type { DataModel } from '../_generated/dataModel'
import { sixDigitCode } from './codes'
import { signInCodeEmail } from './emails'
import { EMAIL_SHAPE, normalizeEmail } from './social'

export const EMAIL_CODE_PROVIDER_ID = 'email-code'
export const EMAIL_CODE_MINUTES = 10

export const reserveSend = internalMutation({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { email }) => {
    const previous = await ctx.db.query('signInCodes').withIndex('by_email', (q) => q.eq('email', email)).unique()
    const now = Date.now()
    if (previous && now - previous.sentAt < 60_000) return false
    if (previous) await ctx.db.patch(previous._id, { sentAt: now })
    else await ctx.db.insert('signInCodes', { email, sentAt: now })
    return true
  },
})

export type SendCode = (ctx: ActionCtx, message: { email: string; code: string; product: string }) => Promise<void>

export function brandName(product: string, brands: Record<string, string> | undefined, brand: unknown): string {
  return typeof brand === 'string' && brands && Object.prototype.hasOwnProperty.call(brands, brand) ? brands[brand]! : product
}

export async function sendCodeWithResend({ product, email, code }: { product: string; email: string; code: string }): Promise<void> {
  const key = process.env.AUTH_RESEND_KEY
  const from = process.env.AUTH_EMAIL_FROM
  if (!key || !from) throw new Error('Sign-in email is not configured')
  const replyTo = process.env.AUTH_EMAIL_REPLY_TO
  const message = signInCodeEmail({ product, code, minutes: EMAIL_CODE_MINUTES })
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, ...(replyTo ? { reply_to: replyTo } : {}), to: email, ...message }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error('Unable to send the sign-in email')
}

export function EmailCode({ product, send, brands }: { product: string; send?: SendCode; brands?: Record<string, string> }) {
  const mailAs = (name: string) =>
    Email({
      id: `${EMAIL_CODE_PROVIDER_ID}-mail`,
      maxAge: EMAIL_CODE_MINUTES * 60,
      generateVerificationToken: async () => sixDigitCode(),
      async sendVerificationRequest({ identifier, token }: { identifier: string; token: string }, ctx?: ActionCtx) {
        if (!ctx) throw new Error('Missing email action context')
        if (send) return send(ctx, { email: identifier, code: token, product: name })
        await sendCodeWithResend({ product: name, email: identifier, code: token })
      },
    })
  const mail = mailAs(product)
  return ConvexCredentials<DataModel>({
    id: EMAIL_CODE_PROVIDER_ID,
    async authorize(params, ctx) {
      const email = normalizeEmail(params.email)
      if (!EMAIL_SHAPE.test(email)) throw new Error('A valid email is required')
      const code = typeof params.code === 'string' ? params.code.trim() : ''
      if (code) return await signInViaProvider(ctx, mail, { params: { email, code } })
      if (!(await ctx.runMutation(internal.signIn.emailCode.reserveSend, { email }))) throw new Error('Please wait before requesting another code')
      const { account } = await createAccount(ctx, { provider: EMAIL_CODE_PROVIDER_ID, account: { id: email }, profile: { email }, shouldLinkViaEmail: true })
      const name = brandName(product, brands, params.brand)
      return await signInViaProvider(ctx, name === product ? mail : mailAs(name), { accountId: account._id, params: { email } })
    },
    extraProviders: [mail],
  })
}
