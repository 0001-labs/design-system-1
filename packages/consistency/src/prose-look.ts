const KINDS = {
  h1: '[data-kind="heading"][data-level="1"]',
  h2: '[data-kind="heading"][data-level="2"]',
  h3: '[data-kind="heading"][data-level="3"]',
  p: '[data-kind="paragraph"]',
} as const;
const PROPERTIES = ['font-family', 'font-weight', 'font-style', 'font-size', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-wrap', 'max-inline-size', 'color'] as const;
const token = (kind: string, property: string) => `--c9y-look-${kind}-${property}`;

export const proseLookStyles = Object.entries(KINDS)
  .map(([kind, selector]) => `.c9y-native-region[data-prose-look] .aa-block${selector}{${PROPERTIES.map(property => `${property}:var(${token(kind, property)})`).join(';')}}`)
  .join('');

export function createProseProbe(doc: Document): HTMLElement {
  const probe = doc.createElement('div');
  probe.setAttribute('data-ds-prose', ''); probe.setAttribute('data-editor-chrome', ''); probe.setAttribute('aria-hidden', 'true');
  probe.style.setProperty('display', 'none', 'important');
  for (const kind of Object.keys(KINDS)) probe.append(doc.createElement(kind));
  return probe;
}

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
