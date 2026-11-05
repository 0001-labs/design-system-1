import { expect, test } from 'vite-plus/test';
import { visitAll } from '../scripts/constraint-pages';

test('a page that would not load waits for the rest and is tried again alone', async () => {
  const seen: string[] = [];
  const retried = await visitAll(['a', 'slow', 'b'], 2, async (page, last) => {
    seen.push(`${page}${last ? ' alone' : ''}`);
    return page !== 'slow' || last;
  });
  expect(retried).toEqual(['slow']);
  expect(seen.at(-1)).toBe('slow alone');
  expect(seen.filter(visit => visit === 'a')).toHaveLength(1);
});

test('nothing is tried twice when every page loads', async () => {
  let visits = 0;
  expect(await visitAll(['a', 'b'], 6, async () => { visits += 1; return true; })).toEqual([]);
  expect(visits).toBe(2);
});

test('retries run one at a time, never in parallel', async () => {
  let running = 0, most = 0;
  await visitAll(['a', 'b', 'c'], 3, async (_page, last) => {
    if (!last) return false;
    running += 1; most = Math.max(most, running);
    await new Promise(done => setTimeout(done, 5));
    running -= 1;
    return true;
  });
  expect(most).toBe(1);
});
