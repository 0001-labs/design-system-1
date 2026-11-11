// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { afterEach, expect, test } from 'vite-plus/test';
const source=readFileSync('website/src/components/LibraryWorkspace.astro','utf8');
const globalStyles=[...source.matchAll(/<style is:global>([\s\S]*?)<\/style>/g)].map(match=>match[1]).join('\n');
const docs=readFileSync('website/src/styles/custom.css','utf8');
afterEach(()=>{document.head.replaceChildren();document.body.replaceChildren();document.documentElement.removeAttribute('data-signed-in');document.documentElement.removeAttribute('data-library-workspace');});
test.each([true,false])('On this page shows only signed out, on public and private documents alike, signed in: %s',signedIn=>{
 if(signedIn)document.documentElement.setAttribute('data-signed-in','');
 // The ::part rules for the column's own track are browser-only; the rule here is what the reader sees.
 const style=document.createElement('style');style.textContent=docs.replace(/[^{}]*::part\([^{}]*\{[^}]*\}/g,'');document.head.append(style);
 document.body.innerHTML='<main class="main-content"><ds-page class="docs-columns"><div class="main-pane"></div><aside slot="aside" class="docs-contents"><div class="right-sidebar-container"><ds-table-of-contents label="On this page"></ds-table-of-contents></div><mobile-starlight-toc></mobile-starlight-toc></aside></ds-page></main>';
 for(const selector of ['.docs-contents','.right-sidebar-container','mobile-starlight-toc']){
  expect(getComputedStyle(document.querySelector<HTMLElement>(selector)!).display==='none',selector).toBe(signedIn);
 }
});
test('signed in, the contents column leaves no track, divider or handle behind',()=>{
 expect(docs).toMatch(/html\[data-signed-in\] \.docs-columns::part\(aside\),\s*html\[data-signed-in\] \.docs-columns::part\(resize-aside\) \{ display: none; \}/);
 expect(docs).toMatch(/html\[data-signed-in\] \.docs-columns::part\(page\) \{[^}]*grid-template-columns: minmax\(0, 1fr\);[^}]*grid-template-areas: "header" "main" "footer";[^}]*column-gap: 0;/);
 // Private documents use the same column as public ones, with no contents of their own.
 const privateDocument=readFileSync('website/src/components/PrivateAppWorkspace.astro','utf8');
 expect(privateDocument).toContain("import TwoColumnContent from './TwoColumnContent.astro'");
 expect(privateDocument).not.toMatch(/PageSidebar|right-sidebar|ds-table-of-contents/);
});
test.each([true,false])('library chrome remains scoped to its workspace, signed in: %s',signedIn=>{
 if(signedIn)document.documentElement.setAttribute('data-signed-in','');
 const style=document.createElement('style');style.textContent=globalStyles;document.head.append(style);
 document.body.innerHTML='<section class="library-workspace"><header class="library-heading">Library</header><nav class="library-tabs">Tabs</nav></section><header class="library-heading" id="other-heading">Other page</header>';
 for(const element of document.querySelectorAll<HTMLElement>('.library-workspace :is(.library-heading,.library-tabs)')){
  expect(getComputedStyle(element).display==='none').toBe(signedIn);
 }
 expect(getComputedStyle(document.querySelector<HTMLElement>('#other-heading')!).display).not.toBe('none');
});
