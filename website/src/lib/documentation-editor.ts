import type { ConsistencyDocsEditor } from '../../../packages/consistency/src/docs-site';
import type { DocHeading } from '../../../shared/doc-pages';

export function connectDocumentationEditor() {
  const body = document.querySelector<HTMLElement>('.sl-markdown-content');
  if (!body) return;
  let editor: ConsistencyDocsEditor | undefined;
  let opening = false;
  let owner = false;
  const toc = document.querySelector('ds-table-of-contents');
  const originalContents = toc ? [...toc.childNodes].map(node => node.cloneNode(true)) : [];
  let currentContents: Node[] = [];
  const show = () => {
    if (!editor) return;
    editor.hidden = !owner;
    editor.inert = !owner;
    if (owner) body.remove();
    else editor.before(body);
    toc?.replaceChildren(...(owner ? currentContents : originalContents).map(node => node.cloneNode(true)));
  };
  const auth = async (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail.loading) return;
    owner = detail.authenticated === true && detail.owner === true;
    if (editor) { show(); return; }
    if (!owner || opening) return;
    opening = true;
    try {
      const { ConsistencyDocsEditor } = await import('../../../packages/consistency/src/docs-site');
      const candidate = new ConsistencyDocsEditor();
      candidate.site = { code: '01Docs', name: 'Design system 1', url: location.origin, domain: location.hostname, docs: true };
      candidate.embedded = true;
      candidate.path = location.pathname;
      candidate.hidden = true;
      candidate.setAttribute('data-ds-not-prose', '');
      candidate.addEventListener('documentation-headings', event => {
        const headings = [{ id: '_top', text: 'Overview', level: 2 }, ...(event as CustomEvent<DocHeading[]>).detail];
        currentContents = headings.map(heading => {
          const link = document.createElement('a');
          link.href = `#${encodeURIComponent(heading.id)}`;
          link.dataset.depth = String(heading.level - 2);
          link.textContent = heading.text;
          return link;
        });
        if (owner) toc?.replaceChildren(...currentContents.map(node => node.cloneNode(true)));
      });
      body.after(candidate);
      if (await candidate.open(location.pathname)) {
        editor = candidate;
        show();
      } else candidate.remove();
    } catch (error) {
      console.error('The documentation editor could not be opened.', error);
    } finally { opening = false; }
  };
  window.addEventListener('ds1-navigation-auth', event => void auth(event));
  window.addEventListener('ds1:access-invalidated', () => { owner = false; show(); });
  if (document.documentElement.hasAttribute('data-ds-owner')) {
    void auth(new CustomEvent('auth', { detail: { authenticated: true, owner: true } }));
  }
  window.addEventListener('beforeunload', event => {
    if (editor?.unsaved) { event.preventDefault(); event.returnValue = ''; }
  });
  document.addEventListener('focusout', () => { if (owner && editor?.unsaved) void editor.flush(); });
  document.addEventListener('click', event => {
    const link = (event.target as Element).closest?.('a[href]');
    if (!editor?.unsaved || !link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
    const href = new URL(link.getAttribute('href')!, location.href);
    if (href.origin === location.origin && href.pathname === location.pathname && href.search === location.search) return;
    event.preventDefault();
    void editor.flush().then(saved => { if (saved) location.assign(href); });
  });
}
