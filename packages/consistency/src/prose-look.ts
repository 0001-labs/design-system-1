/**
 * The page's own look for the words Aa draws. A published page writes a heading as h1 to h3 and a paragraph as p,
 * and a site's stylesheets style those elements; in the editor Aa draws each as a div, which none of those rules
 * reach. So a region keeps a hidden h1, h2, h3 and p where its published words stood, reads what the page draws
 * them as, and hands that to Aa's blocks as custom properties, which `proseLookStyles` applies.
 */
const KINDS = {
  h1: '[data-kind="heading"][data-level="1"]',
  h2: '[data-kind="heading"][data-level="2"]',
  h3: '[data-kind="heading"][data-level="3"]',
  p: '[data-kind="paragraph"]',
} as const;
const PROPERTIES = ['font-family', 'font-weight', 'font-style', 'font-size', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-wrap', 'max-inline-size', 'color'] as const;
const token = (kind: string, property: string) => `--c9y-look-${kind}-${property}`;

/** Outweighs Aa's own heading rules; a property the browser could not report is left to them. */
export const proseLookStyles = Object.entries(KINDS)
  .map(([kind, selector]) => `.c9y-native-region[data-prose-look] .aa-block${selector}{${PROPERTIES.map(property => `${property}:var(${token(kind, property)})`).join(';')}}`)
  .join('');

/** The hidden elements a region measures: placed as the published words are, so the page's rules match them alike. */
export function createProseProbe(doc: Document): HTMLElement {
  const probe = doc.createElement('div');
  probe.setAttribute('data-ds-prose', ''); probe.setAttribute('data-editor-chrome', ''); probe.setAttribute('aria-hidden', 'true');
  probe.style.setProperty('display', 'none', 'important');
  for (const kind of Object.keys(KINDS)) probe.append(doc.createElement(kind));
  return probe;
}

/** Reads the probe and writes the look on the region; false while the region is not in a page, where nothing computes. */
export function applyProseLook(probe: HTMLElement, region: HTMLElement): boolean {
  const view = probe.ownerDocument.defaultView;
  if (!view || !probe.isConnected) return false;
  for (const element of probe.children) {
    const style = view.getComputedStyle(element), kind = element.localName;
    for (const property of PROPERTIES) {
      const value = style.getPropertyValue(property);
      if (value) region.style.setProperty(token(kind, property), value); else region.style.removeProperty(token(kind, property));
    }
  }
  region.setAttribute('data-prose-look', '');
  return true;
}
