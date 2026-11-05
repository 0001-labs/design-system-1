import { describe, expect, it } from 'vite-plus/test';
import { atomLabel, atomPreview, docContents, docRefusal, fromEditable, renderDoc, toEditable, type DocPage } from '../shared/doc-pages';

const head = 'import ComponentExample from "../../components/ComponentExample.astro";';
const example = '<ComponentExample example="gap" />';
const code = '```html\n<ds-gap unit></ds-gap>\n```';
const body = `Vertical space.\n\n## Try it\n\n${example}\n\n${code}\n\nA gap is empty.`;
const page: DocPage = {
  path: '/2-core/gap/', file: '2-core/gap.mdx', mdx: true, title: 'Gap', description: 'Space.', head, source: `${head}\n\n${body}`,
  blocks: [
    { kind: 'text', source: 'Vertical space.', html: '<p>Vertical space.</p>' },
    { kind: 'text', source: '## Try it', html: '<div class="sl-heading-wrapper"><h2 id="try-it">Try it</h2></div>' },
    { kind: 'atom', source: example, html: '<section><iframe src="/examples/gap/"></iframe><script type="module" src="/_astro/x.js"></script></section>' },
    { kind: 'text', source: code, html: '<div class="expressive-code">drawn</div>' },
    { kind: 'text', source: 'A gap is empty.', html: '<p>A gap is empty.</p>' },
  ],
};

describe('a documentation page in Aa', () => {
  it('opens with the import hidden and each component one atom', () => {
    const { text, atoms } = toEditable(page, page.source);
    expect(text).toBe(`Vertical space.\n\n## Try it\n\n:doc[2]\n\n${code}\n\nA gap is empty.`);
    expect(atoms).toHaveLength(1);
    expect(atoms[0]!.label).toBe('Component example: gap');
  });

  it('saves untouched as exactly what it opened from', () => {
    expect(fromEditable(page, toEditable(page, page.source).text)).toBe(page.source);
  });

  it('keeps the build\'s HTML for every block left as it was', () => {
    const { html, headings } = renderDoc(page, page.source);
    for (const block of page.blocks) expect(html).toContain(block.html);
    expect(headings).toEqual([{ level: 2, id: 'try-it', text: 'Try it' }]);
  });

  it('draws only the words changed', () => {
    const edited = fromEditable(page, toEditable(page, page.source).text.replace('A gap is empty.', 'A gap is **only** space.\n\n## New part'));
    const { html, headings } = renderDoc(page, edited);
    expect(html).toContain('<p>A gap is <strong>only</strong> space.</p>');
    expect(html).toContain('<h2 id="new-part">New part</h2>');
    expect(html).toContain('<div class="expressive-code">drawn</div>');
    expect(headings.map(heading => heading.id)).toEqual(['try-it', 'new-part']);
  });

  it('moves and removes a component whole', () => {
    const { text } = toEditable(page, page.source);
    const moved = fromEditable(page, text.replace(':doc[2]\n\n', '').replace('Vertical space.', ':doc[2]\n\nVertical space.'));
    expect(moved.indexOf(example)).toBeLessThan(moved.indexOf('Vertical space.'));
    const removed = fromEditable(page, text.replace(':doc[2]', ''));
    expect(removed).not.toContain(example);
    expect(docRefusal(page, removed)).toBeNull();
  });

  it('puts a component typed beside words on its own again', () => {
    const edited = fromEditable(page, toEditable(page, page.source).text.replace(':doc[2]', 'See :doc[2] here'));
    expect(edited).toContain(`See \n\n${example}\n\n here`);
    expect(docRefusal(page, edited)).toBeNull();
  });

  it('refuses words the build could not read on an MDX page, and an atom it does not have', () => {
    expect(docRefusal(page, `${page.source}\n\nA <b>raw</b> tag`)).toBe('bad-markup');
    expect(docRefusal(page, `${page.source}\n\nA {value}`)).toBe('bad-markup');
    expect(docRefusal(page, `${page.source}\n\nimport x from "y"`)).toBe('bad-markup');
    expect(docRefusal(page, `${page.source}\n\nIn code it is fine: \`<b>\` and \`{x}\``)).toBeNull();
    expect(docRefusal(page, `${page.source}\n\n:doc[99]`)).toBe('unknown-block');
  });

  it('never leaves a component looking like words', () => {
    const changed = `${head}\n\n<ComponentExample example="gone" />`;
    expect(docRefusal(page, changed)).toBe('bad-markup');
  });

  it('draws lists, tables, quotes, code and links', () => {
    const { html } = renderDoc(page, `${page.source}\n\n- one\n  - two\n- three\n\n1. first\n\n| A | B |\n| --- | --- |\n| 1 | [x](/y/) |\n\n> Said\n\n\`\`\`js\nlet a = 1 < 2\n\`\`\``);
    expect(html).toContain('<ul><li>one<ul><li>two</li></ul></li><li>three</li></ul>');
    expect(html).toContain('<ol><li>first</li></ol>');
    expect(html).toContain('<td><a href="/y/">x</a></td>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('let a = 1 &lt; 2');
  });

  it('never carries a dangerous link', () => {
    expect(renderDoc(page, `${page.source}\n\n[x](javascript:alert)`).html).not.toContain('href="javascript');
  });

  it('gives On this page in the anchors the build writes', () => {
    expect(docContents([{ level: 2, id: 'a b', text: 'A & B' }, { level: 3, id: 'c', text: 'C' }])).toBe('<a href="#_top" data-depth="0">Overview</a><a href="#a%20b" data-depth="0">A &amp; B</a><a href="#c" data-depth="1">C</a>');
  });

  it('shows a component on the canvas without its scripts', () => {
    const preview = atomPreview(page.blocks[2]!.html);
    expect(preview).not.toContain('<script');
    expect(preview).toContain('src="https://designsystem1.com/examples/gap/"');
    expect(atomLabel('<ds-button>x</ds-button>')).toBe('Button');
  });
});
