export interface GoogleReturn { site: string; code?: string; state?: string; error?: string }
let kept: GoogleReturn | null = null;

export function keepGoogleReturn(search: string): boolean {
  const params = new URLSearchParams(search), site = params.get('open');
  const code = params.get('google_code'), state = params.get('google_state'), error = params.get('google_error');
  if (!site || !/^\d{2}[A-Za-z]{4}$/.test(site) || !((code && state) || error)) return false;
  kept = code && state ? { site, code, state } : { site, error: error! };
  return true;
}

export function takeGoogleReturn(site: string): GoogleReturn | null {
  if (kept?.site !== site) return null;
  const value = kept;
  kept = null;
  return value;
}
