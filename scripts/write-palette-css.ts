import { writeFileSync } from 'node:fs';
import { paletteSheet } from '../DS1/1-root/palette';
writeFileSync(new URL('../DS1/1-root/palette.css', import.meta.url), paletteSheet());
console.log('Palette written to palette.css');
