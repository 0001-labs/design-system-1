export const SYSTEM_AUTHORIZE_URL = 'https://system.0001.dev/auth/authorize'
const STORAGE_KEY = 'one-key'

type Pending = { state: string; verifier: string; startedAt: number }
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>

const hex = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')
export async function challengeOf(verifier: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return btoa(String.fromCharCode(...digest)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function beginOneKey(client: string, storage: Storage, now = Date.now()): Promise<string> {
  const pending: Pending = { state: hex(), verifier: hex(), startedAt: now }
  storage.setItem(STORAGE_KEY, JSON.stringify(pending))
  return `${SYSTEM_AUTHORIZE_URL}?client=${encodeURIComponent(client)}&state=${pending.state}&challenge=${await challengeOf(pending.verifier)}`
}

export function oneKeyReturn(hash: string, storage: Storage, now = Date.now()): { code: string; verifier: string } | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const code = params.get('code') ?? ''
  const state = params.get('state') ?? ''
  if (!code && !state) return null
  const kept = storage.getItem(STORAGE_KEY)
  storage.removeItem(STORAGE_KEY)
  if (!kept) return null
  let pending: Pending
  try {
    pending = JSON.parse(kept)
  } catch {
    return null
  }
  if (typeof pending.state !== 'string' || typeof pending.verifier !== 'string' || typeof pending.startedAt !== 'number') return null
  if (!code || state !== pending.state || now - pending.startedAt > 600_000) return null
  return { code, verifier: pending.verifier }
}
