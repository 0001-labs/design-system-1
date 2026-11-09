import { cpSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

if (!process.env.npm_config_user_agent?.startsWith('pnpm/')) {
  throw new Error('Pack Design system 1 with pnpm so the staged package is used.');
}

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const directory = manifest.publishConfig.directory;
const studioFont = /(?:^|[/\\])GT-(?:America|Canon)[^/\\]*\.(?:woff2?|ttf|otf)$/i;

rmSync(directory, { recursive: true, force: true });
mkdirSync(directory);
for (const file of ['DS1', 'dist', 'README.md', 'LICENSE', '.npmignore']) {
  cpSync(file, join(directory, file), { recursive: true, filter: path => !studioFont.test(path) });
}

const fontSheet = join(directory, 'DS1/1-root/fonts.css');
const publicFonts = readFileSync(fontSheet, 'utf8')
  .replace(/@font-face\s*\{[^}]*url\("\.\/fonts\/GT-(?:America|Canon)[^"]+"\)[^}]*\}\s*/g, '')
  .replace(/"GT-(?:America|Canon)[^"]*"/g, 'system-ui');
writeFileSync(fontSheet, publicFonts);

delete manifest.publishConfig.directory;
delete manifest.scripts;
writeFileSync(join(directory, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
