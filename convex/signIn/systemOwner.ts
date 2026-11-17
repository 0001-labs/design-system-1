import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials'
import type { GenericId } from 'convex/values'

type CredentialsConfig = Parameters<typeof ConvexCredentials>[0]
type AuthorizeContext = Parameters<CredentialsConfig['authorize']>[1]

export const SYSTEM_OWNER_PROVIDER_ID = 'system-owner'
export const SYSTEM_REDEEM_URL = 'https://system.0001.dev/auth/redeem'
const CODE_SHAPE = /^[0-9a-f-]{72}$/
const VERIFIER_SHAPE = /^[a-f0-9]{64}$/

export type SystemOwnerOptions = {
  client: string
  ownerUser: (ctx: AuthorizeContext) => Promise<GenericId<'users'> | null>
  redeemUrl?: string
  fetcher?: typeof fetch
}

export function SystemOwner(options: SystemOwnerOptions) {
  return ConvexCredentials({
    id: SYSTEM_OWNER_PROVIDER_ID,
    async authorize(params, ctx) {
      const code = typeof params.code === 'string' ? params.code : ''
      const verifier = typeof params.verifier === 'string' ? params.verifier : ''
      if (!CODE_SHAPE.test(code) || !VERIFIER_SHAPE.test(verifier)) return null
      const response = await (options.fetcher ?? fetch)(options.redeemUrl ?? SYSTEM_REDEEM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code, verifier, client: options.client }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) return null
      const result = (await response.json()) as { owner?: unknown; client?: unknown }
      if (result.owner !== 'system-owner' || result.client !== options.client) return null
      const userId = await options.ownerUser(ctx)
      return userId ? { userId } : null
    },
  })
}
