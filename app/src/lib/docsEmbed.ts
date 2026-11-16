export function docsThemeFromMessage(data: unknown): 'light' | 'dark' | null {
  if (!data || typeof data !== 'object') return null;
  const message = data as Record<string, unknown>;
  if (message.type !== 'ds1:docs-theme') return null;
  return message.theme === 'light' || message.theme === 'dark' ? message.theme : null;
}

/** Keep the editor chrome in sync with its same-origin documentation host. */
export function initializeDocsEmbed() {
  if (window.parent === window || new URLSearchParams(window.location.search).get('embed') !== 'docs') return;

  const root = document.documentElement;
  root.dataset.docsEmbed = '';
  const applyTheme = (theme: 'light' | 'dark') => {
    root.dataset.docsTheme = theme;
    root.style.colorScheme = theme;
  };

  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const theme = docsThemeFromMessage(event.data);
    if (theme) applyTheme(theme);
  });
  window.parent.postMessage({ type: 'ds1:docs-ready' }, window.location.origin);
}

/**
 * Inside the documentation's app frame the editor stands on the frame's scale: the parent's `--sf`
 * (Desktop aligned on a computer), so its squares are the documentation's squares.
 */
export function followDocsScale() {
  const root = document.documentElement;
  const follow = () => {
    const scale = getComputedStyle(window.parent.document.documentElement).getPropertyValue('--sf').trim() || '1';
    root.style.setProperty('--sf', scale);
    root.toggleAttribute('data-mobile', window.parent.document.documentElement.hasAttribute('data-mobile'));
  };
  root.setAttribute('data-ds-scaling-managed', '');
  root.style.setProperty('--ds-sf', 'var(--sf, 1)');
  follow();
  window.addEventListener('resize', () => requestAnimationFrame(follow));
}
