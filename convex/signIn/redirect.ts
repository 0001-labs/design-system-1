export type RedirectRules = {
  origins: string[]
  paths: string[] | RegExp
  params?: Record<string, RegExp | null>
  require?: string[]
  nativeSchemes?: string[]
  hostAllowed?: (hostname: string) => boolean
}

const UUID = /^[a-f0-9-]{36}$/i
const refuse = (reason = 'Invalid sign-in destination'): never => {
  throw new Error(reason)
}

export function signInRedirect(redirectTo: string, rules: RedirectRules): string {
  let url: URL
  try {
    url = new URL(redirectTo)
  } catch {
    return refuse()
  }
  if (url.username || url.password || url.hash) refuse()
  if (rules.nativeSchemes?.includes(url.protocol)) {
    if (url.hostname !== 'callback' || url.port || (url.pathname !== '' && url.pathname !== '/')) refuse()
    const keys = [...url.searchParams.keys()]
    if (keys.length !== 1 || keys[0] !== 'state' || !UUID.test(url.searchParams.get('state') ?? '')) refuse('Invalid sign-in state')
    return url.toString()
  }
  if (!['http:', 'https:'].includes(url.protocol)) refuse()
  const listed = rules.origins.some((origin) => {
    try {
      return new URL(origin).origin === url.origin
    } catch {
      return false
    }
  })
  const byHost = !listed && url.protocol === 'https:' && !url.port && rules.hostAllowed?.(url.hostname.toLowerCase()) === true
  if (!listed && !byHost) refuse()
  const path = url.pathname
  if (!(rules.paths instanceof RegExp ? rules.paths.test(path) : rules.paths.includes(path))) refuse()
  const allowed = rules.params ?? {}
  for (const key of new Set(url.searchParams.keys())) {
    if (!Object.prototype.hasOwnProperty.call(allowed, key)) refuse()
    const values = url.searchParams.getAll(key)
    if (values.length !== 1) refuse()
    const shape = key === 'oauth' ? /^1$/ : allowed[key]
    if (shape && !shape.test(values[0])) refuse()
  }
  for (const key of rules.require ?? []) if (!url.searchParams.has(key)) refuse()
  return url.toString()
}
