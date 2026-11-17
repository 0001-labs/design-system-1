export type SocialProvider = 'google' | 'apple'

export type SocialSignInStage = 'off' | 'existing' | 'public'
export function socialSignInStage(value: string | undefined): SocialSignInStage {
  return value === 'existing' || value === 'public' ? value : 'off'
}

export function jwtExpiresAt(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
    return typeof claims?.exp === 'number' && Number.isFinite(claims.exp) ? claims.exp * 1000 : null
  } catch {
    return null
  }
}

export type Environment = Record<string, string | undefined>

export type SignInAvailability = {
  google: boolean
  apple: boolean
  newAccounts: boolean
  code: boolean
}

export function signInAvailability(env: Environment, now: number): SignInAvailability {
  const stage = socialSignInStage(env.SOCIAL_SIGN_IN)
  const appleExpiry = jwtExpiresAt(env.AUTH_APPLE_SECRET ?? '')
  return {
    google: stage !== 'off' && Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    apple: stage !== 'off' && Boolean(env.AUTH_APPLE_ID && appleExpiry !== null && appleExpiry > now),
    newAccounts: stage === 'public',
    code: Boolean(env.AUTH_RESEND_KEY && env.AUTH_EMAIL_FROM),
  }
}

export const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

export function passwordEmails(env: Environment): string[] {
  return (env.SIGN_IN_PASSWORD_EMAILS ?? '').split(',').map(normalizeEmail).filter(Boolean)
}
export function passwordAllowed(env: Environment, email: unknown): boolean {
  const address = normalizeEmail(email)
  return Boolean(address) && passwordEmails(env).includes(address)
}

const DAY = 86_400_000

export function appleSecretReminder(secret: string | undefined, now: number): string | null {
  if (!secret) return null
  const expiresAt = jwtExpiresAt(secret)
  if (expiresAt === null)
    return new Date(now).getUTCDay() === 1 ? 'Apple sign-in is off: AUTH_APPLE_SECRET is not a valid token' : null
  const days = Math.floor((expiresAt - now) / DAY)
  if ([30, 14, 7, 3, 1].includes(days)) return `Apple sign-in stops in ${days} day${days === 1 ? '' : 's'}: renew AUTH_APPLE_SECRET`
  if (days === 0) return 'Apple sign-in stops today: renew AUTH_APPLE_SECRET'
  if (days < 0 && days % 7 === 0) return 'Apple sign-in is off: AUTH_APPLE_SECRET has expired'
  return null
}
