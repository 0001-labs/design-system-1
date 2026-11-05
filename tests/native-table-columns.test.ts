// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vite-plus/test';
import { watchTableColumns } from '../DS1/3-unit/native-table-columns';
let stop: (() => void) | undefined;
afterEach(() => { stop?.(); stop = undefined; document.body.replaceChildren(); });
const paint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

test('existing grouped tables keep their links and row actions while columns resize', async () => {
  document.body.innerHTML = '<table class="ds-table"><thead><tr><th rowspan="2">Name</th><th colspan="2">Activity</th></tr><tr><th>Sent</th><th>Opened</th></tr></thead><tbody><tr><td><a href="/person">Studio</a></td><td>4</td><td>2</td></tr></tbody></table>';
  const table = document.querySelector('table')!;
  const anchor = table.querySelector('a')!; let clicked = false;
  anchor.addEventListener('click', e => { e.preventDefault(); clicked = true; });
  stop = watchTableColumns(document);
  const handles = [...table.querySelectorAll<HTMLElement>('[role="separator"]')];
  expect(handles).toHaveLength(3);
  expect(table.querySelector('a')).toBe(anchor);
  handles[0]!.getBoundingClientRect = () => ({width:20}) as DOMRect;
  for(const cell of table.querySelectorAll('th')) cell.getBoundingClientRect = () => ({width:100}) as DOMRect;
  handles[0]!.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true}));
  expect(table.style.tableLayout).toBe('fixed');
  expect(table.querySelector('col')!.style.width).toBe('120px');
  anchor.click(); expect(clicked).toBe(true);
  table.tBodies[0]!.innerHTML = '<tr><td>Another studio</td><td>6</td><td>1</td></tr>';
  await paint();
  expect(table.querySelectorAll('[role="separator"]')).toHaveLength(3);
  expect(table.querySelector('col')!.style.width).toBe('120px');
});

test('later-rendered tables and tables without headings take the same handles without duplicates', async () => {
  stop = watchTableColumns(document);
  document.body.innerHTML = '<table class="ds-table"><tbody><tr><td>Duration</td><td>20 seconds</td></tr></tbody></table>';
  await paint();
  expect(document.querySelectorAll('[role="separator"]')).toHaveLength(2);
  expect(document.querySelectorAll('[data-ds-table-viewport]')).toHaveLength(1);
  document.querySelector('td')!.textContent = 'Duration updated'; await paint();
  expect(document.querySelectorAll('[role="separator"]')).toHaveLength(2);
});
