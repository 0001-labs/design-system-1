/**
 * What Google's consent came back with, kept for the moment between the app opening and the site's settings drawing.
 * The app's address is its own (`home.ts` takes every query off at once), so the return is read here first and
 * handed to the one site it names, once.
 */
export interface GoogleReturn { site: string; code?: string; state?: string; error?: string }
let kept: GoogleReturn | null = null;

/** Reads a return out of the address the app opened with; true when there was one, which opens that site's settings. */
export function keepGoogleReturn(search: string): boolean {
  const params = new URLSearchParams(search), site = params.get('open');
  const code = params.get('google_code'), state = params.get('google_state'), error = params.get('google_error');
  if (!site || !/^\d{2}[A-Za-z]{4}$/.test(site) || !((code && state) || error)) return false;
  kept = code && state ? { site, code, state } : { site, error: error! };
  return true;
}

/** The return for a site, taken once. */
export function takeGoogleReturn(site: string): GoogleReturn | null {
  if (kept?.site !== site) return null;
  const value = kept;
  kept = null;
  return value;
}
