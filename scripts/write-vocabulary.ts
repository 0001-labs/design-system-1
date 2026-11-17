import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { vocabularyJson } from '../shared/consistency-vocabulary';

const path = join(import.meta.dirname, '../shared/generated/vocabulary.json');
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, vocabularyJson());
console.log(`Wrote ${path}`);
