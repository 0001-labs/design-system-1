// @vitest-environment happy-dom
import { expect, it } from 'vite-plus/test';
import { applyProseLook, createProseProbe, proseLookStyles } from './prose-look';

it('gives the words Aa draws the look the page gives its own headings and paragraphs', () => {
  const style = document.createElement('style');
  style.textContent = '[data-ds-prose] h1{font-family:"GT Canon";font-size:40px;font-weight:400}[data-slot="lead"] p{font-size:28px}';
  const slot = document.createElement('div'), region = document.createElement('div'), probe = createProseProbe(document);
  slot.dataset.slot = 'lead'; region.className = 'c9y-native-region'; region.append(probe); slot.append(region);
  expect(applyProseLook(probe, region)).toBe(false);
  document.head.append(style); document.body.append(slot);
  expect(applyProseLook(probe, region)).toBe(true);
  expect(region.style.getPropertyValue('--c9y-look-h1-font-family')).toContain('GT Canon');
  expect(region.style.getPropertyValue('--c9y-look-h1-font-size')).toBe('40px');
  expect(region.style.getPropertyValue('--c9y-look-p-font-size')).toBe('28px');
  expect(region.hasAttribute('data-prose-look')).toBe(true);
  expect(proseLookStyles).toContain('.c9y-native-region[data-prose-look] .aa-block[data-kind="heading"][data-level="1"]{font-family:var(--c9y-look-h1-font-family)');
  expect(probe.getAttribute('aria-hidden')).toBe('true');
  slot.remove(); style.remove();
});
