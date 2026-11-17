import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { skillBlock, skillEnd, skillStart } from '../DS1/0-face/constraints';

const path = join(import.meta.dirname, '../skills/design-system-1/SKILL.md');
const skill = readFileSync(path, 'utf8');
const start = skill.indexOf(skillStart);
const end = skill.indexOf(skillEnd);
if (start < 0 || end < start) throw new Error(`The skill has no constraints markers: ${path}`);
writeFileSync(path, skill.slice(0, start) + skillBlock() + skill.slice(end + skillEnd.length));
console.log(`Wrote the constraints into ${path}`);
