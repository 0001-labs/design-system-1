// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vite-plus/test';
import { adoptionStudio } from '../scripts/component-adoption';

test('adoption reporting finds its studio from both canonical and worktree sources', () => {
  const root = mkdtempSync(join(tmpdir(), 'adoption-studio-'));
  try {
    writeFileSync(join(root, 'sync.sources.json'), '{}');
    for (const source of ['Design system 1', 'Worktrees/Design system 1/internal-app-shell']) {
      const path = join(root, source);
      mkdirSync(path, { recursive: true });
      expect(adoptionStudio(path)).toBe(root);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
