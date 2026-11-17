export const APPLE_SECRET_MAX_SECONDS = 15_777_000

export type AppleClientSecretInput = {
  privateKey: string
  keyId: string
  teamId: string
  clientId: string
  now?: number
  days?: number
}

function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const encodeJson = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)))

export async function appleClientSecret({ privateKey, keyId, teamId, clientId, now = Date.now(), days = 180 }: AppleClientSecretInput): Promise<string> {
  if (!/^[A-Z0-9]{10}$/.test(keyId)) throw new Error('The Key ID is the ten characters Apple shows beside the key')
  if (!/^[A-Z0-9]{10}$/.test(teamId)) throw new Error('The Team ID is the ten characters shown under the account name')
  if (!/^[A-Za-z0-9.-]+$/.test(clientId)) throw new Error('The client ID is a Services ID or bundle ID, such as com.example.app.web')
  if (!(days > 0)) throw new Error('A client secret has to last at least part of a day')
  const body = privateKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/)?.[1]
  if (!body) throw new Error('The key must be the .p8 file Apple issued, BEGIN/END lines included')
  const der = Uint8Array.from(atob(body.replace(/\s/g, '')), (char) => char.charCodeAt(0))
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const iat = Math.floor(now / 1000)
  const exp = iat + Math.min(Math.round(days * 86_400), APPLE_SECRET_MAX_SECONDS)
  const unsigned = `${encodeJson({ alg: 'ES256', kid: keyId })}.${encodeJson({ iss: teamId, iat, exp, aud: 'https://appleid.apple.com', sub: clientId })}`
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned))
  return `${unsigned}.${base64url(new Uint8Array(signature))}`
}
